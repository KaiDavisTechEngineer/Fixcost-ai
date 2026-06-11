"""OPTIMIZER: proposes prompt/schema changes to improve benchmark scores.

Sees ONLY the aggregate train-split view from evaluator.optimizer_view() plus
the source of the files it is allowed to edit. It never sees benchmark cases,
per-case scores, or anything heldout. Proposals are structured edits validated
by validate_proposal() before the verifier will touch them.
"""
import json
import os
import re
import time
import urllib.error
import urllib.request
from pathlib import Path

# The only surface the optimizer may modify (v1: the shared prompt/schema).
ALLOWED_FILES = ["shared/guide.js"]

# Hard constraint #1: safety/HV content is protected. Any edit whose old or new
# text brushes against it is auto-rejected — changes there need Kai's explicit
# sign-off, which means a human-authored change, not an optimizer proposal.
SAFETY_GUARD = re.compile(r"safety|high[\s-]?voltage|must_mention|\bhv\b", re.IGNORECASE)

PROPOSAL_TOOL = {
    "name": "propose_change",
    "description": "Propose a minimal set of exact text edits to improve benchmark scores.",
    "input_schema": {
        "type": "object",
        "properties": {
            "rationale": {"type": "string", "description": "why this change should move the weak component(s), 2-5 sentences"},
            "edits": {
                "type": "array",
                "minItems": 1,
                "items": {
                    "type": "object",
                    "properties": {
                        "file": {"type": "string", "enum": ALLOWED_FILES},
                        "old": {"type": "string", "description": "exact text to replace; must appear exactly once in the file"},
                        "new": {"type": "string", "description": "replacement text"},
                    },
                    "required": ["file", "old", "new"],
                },
            },
        },
        "required": ["rationale", "edits"],
    },
}

SYSTEM = (
    "You are an optimization agent improving the prompt and tool schema of an AI car-repair "
    "diagnostic app. You see ONLY aggregate train-split benchmark metrics — never individual "
    "test cases. You may ONLY edit the listed allowed files, via exact-text replacements. "
    "You MUST NOT modify anything related to safety warnings, the safety field, or "
    "high-voltage/hybrid-HV content — such edits are automatically rejected. "
    "Propose the SMALLEST change you believe will improve the weak component(s). "
    "Each edit's 'old' text must be copied EXACTLY from the source (it must occur exactly once)."
)


def resolve_model():
    return os.environ.get("ANTHROPIC_MODEL") or "claude-sonnet-4-6"


def _call_anthropic(body, attempts=3):
    last = None
    for i in range(attempts):
        try:
            req = urllib.request.Request(
                "https://api.anthropic.com/v1/messages",
                data=json.dumps(body).encode(),
                headers={
                    "Content-Type": "application/json",
                    "x-api-key": os.environ.get("ANTHROPIC_API_KEY", ""),
                    "anthropic-version": "2023-06-01",
                },
                method="POST",
            )
            with urllib.request.urlopen(req, timeout=300) as r:
                return json.load(r)
        except (urllib.error.URLError, TimeoutError) as e:  # transient network
            last = e
            time.sleep(5 * (i + 1))
    raise RuntimeError(f"optimizer API call failed after {attempts} attempts: {last}")


def build_user_message(view, sources, goal, prior_attempts=None):
    msg = [
        f"GOAL: {goal}",
        "",
        "AGGREGATE TRAIN METRICS (current vs champion):",
        json.dumps(view, indent=2),
        "",
    ]
    for path, src in sources.items():
        msg.append(f"=== SOURCE: {path} (the only file you may edit) ===")
        msg.append(src)
        msg.append("")
    if prior_attempts:
        msg.append("PRIOR ATTEMPTS THIS SESSION (do not repeat them):")
        for a in prior_attempts:
            msg.append(json.dumps(a))
        msg.append("")
    msg.append("Call propose_change with your minimal edit set.")
    return "\n".join(msg)


def propose(view, repo_root, goal, prior_attempts=None):
    """One optimizer call. Returns {'rationale': str, 'edits': [...]}."""
    sources = {f: (Path(repo_root) / f).read_text() for f in ALLOWED_FILES}
    body = {
        "model": resolve_model(),
        "max_tokens": 4096,
        "system": SYSTEM,
        "tools": [PROPOSAL_TOOL],
        "tool_choice": {"type": "tool", "name": "propose_change"},
        "messages": [{"role": "user",
                      "content": build_user_message(view, sources, goal, prior_attempts)}],
    }
    data = _call_anthropic(body)
    if data.get("error"):
        raise RuntimeError(f"optimizer API error: {data['error']}")
    tool = next((b for b in data.get("content", [])
                 if b.get("type") == "tool_use" and b.get("name") == "propose_change"), None)
    if not tool:
        raise RuntimeError("optimizer returned no propose_change tool call")
    return tool["input"]


def validate_proposal(proposal, repo_root):
    """Static checks before the verifier spends any benchmark budget."""
    errors = []
    edits = proposal.get("edits") or []
    if not edits:
        errors.append("proposal contains no edits")
    for i, e in enumerate(edits):
        f, old, new = e.get("file"), e.get("old", ""), e.get("new", "")
        if f not in ALLOWED_FILES:
            errors.append(f"edit {i}: file '{f}' is not in the allowlist {ALLOWED_FILES}")
            continue
        if SAFETY_GUARD.search(old) or SAFETY_GUARD.search(new):
            errors.append(f"edit {i}: touches protected safety/HV content — auto-rejected "
                          "(requires explicit human sign-off)")
        content = (Path(repo_root) / f).read_text()
        n = content.count(old)
        if old == "":
            errors.append(f"edit {i}: empty 'old' text")
        elif n == 0:
            errors.append(f"edit {i}: 'old' text not found in {f}")
        elif n > 1:
            errors.append(f"edit {i}: 'old' text occurs {n} times in {f} (must be unique)")
        if old == new:
            errors.append(f"edit {i}: old and new are identical")
    return errors


def apply_edits(content_by_file, edits):
    """Pure function: apply validated edits to in-memory file contents."""
    out = dict(content_by_file)
    for e in edits:
        out[e["file"]] = out[e["file"]].replace(e["old"], e["new"], 1)
    return out
