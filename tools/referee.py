"""
The Referee: runs every lab's tests and writes progress.json, which powers the village.

    python tools/referee.py           run all labs, update progress.json, print the scoreboard
    python tools/referee.py --check   verify progress.json matches the tests (used by CI)

A lab is:
    passed     its tests pass
    available  it has a folder and all its prerequisites are passed
    locked     it has a folder but a prerequisite is not passed yet
    planned    it is on the map but has no folder yet
"""
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
QUESTS = ROOT / "quests.json"
PROGRESS = ROOT / "progress.json"


def run_lab_tests(lab_path: Path) -> bool:
    result = subprocess.run(
        [sys.executable, "-m", "pytest", str(lab_path), "-q", "--no-header", "-p", "no:cacheprovider"],
        cwd=ROOT, capture_output=True, text=True,
    )
    return result.returncode == 0


def validate(quests: dict) -> None:
    npc_ids = {n["id"] for n in quests["npcs"]}
    lab_ids = [lab["id"] for lab in quests["labs"]]
    assert len(lab_ids) == len(set(lab_ids)), "duplicate lab id in quests.json"
    for npc in quests["npcs"]:
        assert npc["lives_at"] in quests["places"], f"{npc['id']} lives at unknown place {npc['lives_at']}"
    for lab in quests["labs"]:
        assert lab["npc"] in npc_ids, f"{lab['id']} belongs to unknown npc {lab['npc']}"
        for pre in lab["prereqs"]:
            assert pre in lab_ids, f"{lab['id']} has unknown prerequisite {pre}"
        if lab["path"]:
            assert (ROOT / lab["path"]).is_dir(), f"{lab['id']} path does not exist: {lab['path']}"


def compute_progress(quests: dict) -> dict:
    passed = {lab["id"] for lab in quests["labs"] if lab["path"] and run_lab_tests(ROOT / lab["path"])}

    labs = {}
    for lab in quests["labs"]:
        if lab["id"] in passed:
            status = "passed"
        elif not lab["path"]:
            status = "planned"
        elif all(pre in passed for pre in lab["prereqs"]):
            status = "available"
        else:
            status = "locked"
        labs[lab["id"]] = status

    npcs, places = {}, {place: 0 for place in quests["places"]}
    for npc in quests["npcs"]:
        line = [lab["id"] for lab in quests["labs"] if lab["npc"] == npc["id"]]
        done = sum(1 for lab_id in line if lab_id in passed)
        power = round(100 * done / len(line)) if line else 0
        npcs[npc["id"]] = {"passed": done, "total": len(line), "power": power}
        places[npc["lives_at"]] = power

    total = len(quests["labs"])
    return {
        "labs": labs,
        "npcs": npcs,
        "places": places,
        "passed": len(passed),
        "total": total,
        "signal": round(100 * len(passed) / total) if total else 0,
    }


def print_scoreboard(quests: dict, progress: dict) -> None:
    icons = {"passed": "[x]", "available": "[ ]", "locked": " # ", "planned": " . "}
    print("=" * 64)
    print(f"  REFEREE  |  signal {progress['signal']}%  |  {progress['passed']} / {progress['total']} labs passed")
    print("=" * 64)
    for npc in sorted(quests["npcs"], key=lambda n: n["order"]):
        score = progress["npcs"][npc["id"]]
        print(f"\n  {npc['name']}  ({quests['places'][npc['lives_at']]})  {score['passed']}/{score['total']}  {score['power']}%")
        for lab in quests["labs"]:
            if lab["npc"] == npc["id"]:
                status = progress["labs"][lab["id"]]
                print(f"    {icons[status]} {lab['id']:<7} {lab['title']}  ({status})")
    print()


def main() -> int:
    sys.stdout.reconfigure(encoding="utf-8")
    quests = json.loads(QUESTS.read_text(encoding="utf-8"))
    validate(quests)
    progress = compute_progress(quests)

    if "--check" in sys.argv:
        saved = json.loads(PROGRESS.read_text(encoding="utf-8")) if PROGRESS.exists() else None
        if saved != progress:
            print("progress.json does not match the lab tests. Run: python tools/referee.py")
            return 1
        print(f"progress.json is honest: {progress['passed']} / {progress['total']} labs passed.")
        return 0

    PROGRESS.write_text(json.dumps(progress, indent=2) + "\n", encoding="utf-8")
    print_scoreboard(quests, progress)
    print("  progress.json updated. Commit and push it to light up the live village.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
