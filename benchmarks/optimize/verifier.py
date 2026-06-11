"""VERIFIER GATE: evaluates a proposal in an isolated git worktree.

Accepts only if (SPEC section 5): full test suite passes, zero safety
violations on BOTH splits, and the heldout score/cost criteria hold against
champion.json. Output is a report + unified diff for Kai's approval — the
proposal is NEVER applied to the main working tree (hard constraint #5).

Heldout run budget: max 3 heldout evaluations per optimization session,
enforced by Session.spend_heldout_eval() — the 4th raises.
"""
import datetime as dt
import difflib
import json
import subprocess
import sys
import tempfile
from pathlib import Path

BENCH = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BENCH))
from run_benchmark import evaluate_gate  # noqa: E402

MAX_HELDOUT_EVALS = 3

# Hard constraint #1 backstop (Kai-approved design, 2026-06-11): after a
# proposal is applied, these exact byte spans must still be present in the
# file, or the proposal is rejected regardless of what the edit text looked
# like. They are the safety-warning constructs of shared/guide.js: the prompt's
# safety field spec, the tool schema's safety property, and its required-list
# entry. A drift test asserts these strings match the real file.
PROTECTED_INVARIANTS = {
    "shared/guide.js": [
        '\'"safety":["4-6 safety warnings including model-specific ones (electronic parking '
        'brake service mode, battery registration, hybrid high-voltage, refrigerant type, etc.)"],\'',
        "      safety: strArr,",
        'required: ["overview", "repair_target", "diagnosis_slug", "severity", "difficulty", "cost", "safety"],',
    ],
}


def check_protected_invariants(root, invariants=None):
    """Return a list of violations: protected constructs missing post-apply."""
    invariants = PROTECTED_INVARIANTS if invariants is None else invariants
    violations = []
    for rel, spans in invariants.items():
        path = Path(root) / rel
        content = path.read_text() if path.exists() else ""
        for span in spans:
            if span not in content:
                violations.append(f"{rel}: protected safety construct altered or removed: "
                                  f"{span[:80]!r}…")
    return violations


class HeldoutBudgetExceeded(RuntimeError):
    pass


class Session:
    """Tracks one optimization session; persists state so the budget survives
    crashes/restarts within the same session file."""

    def __init__(self, path):
        self.path = Path(path)
        if self.path.exists():
            self.data = json.loads(self.path.read_text())
        else:
            self.data = {
                "started_utc": dt.datetime.now(dt.timezone.utc).strftime("%Y%m%dT%H%M%SZ"),
                "heldout_evals": 0,
                "attempts": [],
            }
            self.save()

    def save(self):
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.path.write_text(json.dumps(self.data, indent=2))

    def spend_heldout_eval(self):
        if self.data["heldout_evals"] >= MAX_HELDOUT_EVALS:
            raise HeldoutBudgetExceeded(
                f"max {MAX_HELDOUT_EVALS} heldout evaluations per session (SPEC section 5); "
                "more attempts would leak the heldout set into the search — stop and add "
                "new heldout cases instead")
        self.data["heldout_evals"] += 1
        self.save()

    def record_attempt(self, record):
        self.data["attempts"].append(record)
        self.save()


# ---- worktree mechanics ----

def create_worktree(repo_root):
    """Detached worktree of committed HEAD — proposals never touch the main tree."""
    tmp = Path(tempfile.mkdtemp(prefix="fixcost-proposal-"))
    subprocess.run(["git", "worktree", "add", "--detach", str(tmp), "HEAD"],
                   cwd=repo_root, check=True, capture_output=True)
    return tmp


def remove_worktree(repo_root, path):
    subprocess.run(["git", "worktree", "remove", "--force", str(path)],
                   cwd=repo_root, capture_output=True)


def apply_proposal_to_worktree(worktree, edits):
    """Apply validated edits inside the worktree; return a unified diff."""
    diffs = []
    for f in sorted({e["file"] for e in edits}):
        target = Path(worktree) / f
        before = target.read_text()
        after = before
        for e in edits:
            if e["file"] == f:
                after = after.replace(e["old"], e["new"], 1)
        target.write_text(after)
        diffs.append("".join(difflib.unified_diff(
            before.splitlines(keepends=True), after.splitlines(keepends=True),
            fromfile=f"a/{f}", tofile=f"b/{f}")))
    return "\n".join(diffs)


# ---- gate condition 1: full test suite ----

def run_test_suite(worktree):
    js = subprocess.run(["npm", "test", "--silent"], cwd=worktree,
                        capture_output=True, text=True, timeout=600)
    py = subprocess.run([sys.executable, "-m", "pytest", "benchmarks/tests/", "-q"],
                        cwd=worktree, capture_output=True, text=True, timeout=600)
    ok = js.returncode == 0 and py.returncode == 0
    tail = lambda p: "\n".join(((p.stdout or "") + (p.stderr or "")).splitlines()[-12:])
    return ok, f"--- npm test (rc={js.returncode}) ---\n{tail(js)}\n--- pytest (rc={py.returncode}) ---\n{tail(py)}"


# ---- benchmark inside the worktree (measures the PROPOSED code) ----

def run_split_in_worktree(worktree, split):
    proc = subprocess.run(
        [sys.executable, "benchmarks/run_benchmark.py", "--split", split],
        cwd=worktree, capture_output=True, text=True, timeout=7200)
    if proc.returncode != 0:
        raise RuntimeError(f"benchmark --split {split} failed in worktree: "
                           f"{(proc.stderr or proc.stdout)[-400:]}")
    runs = sorted((Path(worktree) / "benchmarks" / "results" / "runs").glob(f"*_{split}.json"))
    if not runs:
        raise RuntimeError(f"no run file produced for split {split}")
    return json.loads(runs[-1].read_text())


# ---- gate decision (SPEC section 5) ----

def gate_decision(champion, train_agg, heldout_agg, tests_ok):
    """Conditions 1-3. Condition 4 (Kai approves the diff) is external by design."""
    reasons = []
    ok = True
    if tests_ok:
        reasons.append("PASS cond1: full test suite passes")
    else:
        ok = False
        reasons.append("FAIL cond1: test suite failed")
    if train_agg["safety_violations"] != 0:
        ok = False
        reasons.append(f"FAIL cond2: {train_agg['safety_violations']} safety violation(s) on train")
    g_ok, g_reasons = evaluate_gate(champion, heldout_agg)  # cond2 heldout + cond3
    reasons.extend(g_reasons)
    return ok and g_ok, reasons


def write_report(proposal_dir, proposal, diff, train_agg, heldout_agg, gate_ok, reasons, champion):
    proposal_dir = Path(proposal_dir)
    proposal_dir.mkdir(parents=True, exist_ok=True)
    (proposal_dir / "proposal.diff").write_text(diff)
    (proposal_dir / "proposal.json").write_text(json.dumps(proposal, indent=2))
    lines = [
        "# Optimizer proposal — verifier report",
        "",
        f"Gate result: **{'PASS — awaiting Kai approval' if gate_ok else 'FAIL — rejected'}**",
        "",
        "## Rationale (optimizer)",
        proposal.get("rationale", "(none)"),
        "",
        "## Gate conditions",
        *[f"- {r}" for r in reasons],
        "",
        "## Metrics (proposal vs champion)",
        "| metric | champion train | proposal train | champion heldout | proposal heldout |",
        "|---|---|---|---|---|",
    ]
    ct, ch = champion["metrics"]["train"], champion["metrics"]["heldout"]
    for k in ("mean_score", "safety_violations", "mean_tokens", "mean_cost_usd", "mean_latency_s"):
        hv = heldout_agg.get(k) if heldout_agg else "—"
        lines.append(f"| {k} | {ct.get(k)} | {train_agg.get(k)} | {ch.get(k)} | {hv} |")
    lines += ["", "Diff in `proposal.diff`. NOT applied — apply only with Kai's approval.", ""]
    (proposal_dir / "report.md").write_text("\n".join(lines))
    return proposal_dir / "report.md"
