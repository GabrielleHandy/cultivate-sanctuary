# Labs

Every lab is one small AI-engineering build. **You write the code; the tests decide if it passed.**

```
labs/<place>/<nn>_<slug>/
    README.md      the brief, in the 6-beat loop (Ask, Predict, Work, Reveal, Diff, Log)
    starter.py     where you write (newer labs). Older labs point at files in the repo root.
    test_lab.py    the referee's tests. Read them, but don't edit them to make them pass.
```

## The loop

1. Walk up to an NPC in the village (or open `quests.json`) and pick an **available** lab.
2. Read its `README.md`. Write your predictions down before you code.
3. Do the work.
4. Run that lab's tests:

   ```bash
   python -m pytest labs/ai_academy/06_debug_request_limits -q
   ```

5. When they pass, ring the bell:

   ```bash
   python tools/referee.py
   ```

   This re-runs every lab, rewrites `progress.json`, and prints the scoreboard.
6. Commit and push. The live village reads `progress.json`, so the house lights up for real.

CI runs `python tools/referee.py --check` on every push, so `progress.json` can't claim a lab the tests don't back.

## Formats

- **Code-it**: build something new from a brief.
- **Debug-it**: a real bug in this repo. The test reproduces it; you find and fix the cause.
- **Predict-it**: guess the output first, then run it and explain the difference.
- **Break-it**: attack your own build until it fails, then harden it.
