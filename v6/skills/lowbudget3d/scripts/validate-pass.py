#!/usr/bin/env python3
"""Mechanical final-gate validator for lowbudget3d reports.

This script does not inspect images. It only prevents a report from declaring
PASS when a mandatory gate is missing, not PASS, or lacks evidence.
"""
import json
import sys
from pathlib import Path

ALLOWED = {"PASS", "FAIL", "UNVERIFIED", "PARTIAL"}


def main(path: str) -> int:
    data = json.loads(Path(path).read_text(encoding="utf-8"))
    gates = data.get("gates", {})
    mandatory = list(data.get("mandatory_gates", []))
    for name, gate in gates.items():
        if gate.get("required") is True and name not in mandatory:
            mandatory.append(name)

    errors = []
    for name in mandatory:
        gate = gates.get(name)
        if not isinstance(gate, dict):
            errors.append(f"missing mandatory gate: {name}")
            continue
        status = gate.get("status")
        if status not in ALLOWED:
            errors.append(f"invalid status for {name}: {status!r}")
        if status != "PASS":
            errors.append(f"mandatory gate not PASS: {name}={status}")
        evidence = gate.get("evidence")
        if status == "PASS" and (not isinstance(evidence, list) or not evidence):
            errors.append(f"PASS has no evidence: {name}")

    declared = data.get("final_status")
    if declared not in ALLOWED:
        errors.append(f"invalid final_status: {declared!r}")
    if declared == "PASS" and errors:
        print(json.dumps({"valid": False, "errors": errors}, indent=2))
        return 2
    if not errors and declared != "PASS":
        print(json.dumps({"valid": True, "warning": "all mandatory gates pass but final_status is not PASS"}, indent=2))
        return 0
    print(json.dumps({"valid": not errors, "errors": errors}, indent=2))
    return 0 if not errors else 1


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("usage: validate-pass.py <evaluation-report.json>", file=sys.stderr)
        raise SystemExit(64)
    raise SystemExit(main(sys.argv[1]))
