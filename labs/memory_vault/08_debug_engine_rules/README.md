# Lab 08 · Debug-it: the house that un-restores

**NPC:** Archivist Bobbin · **Format:** Debug-it · **Your code:** [`sanctuary_engine.py`](../../../sanctuary_engine.py)

> 🐈 "You restored the Academy to full colour on Tuesday. On Wednesday you worked hard again, and it
> went back to a blueprint. I keep records. This is not how rewards work."

## 1. Ask
Two rule bugs in `sync_habit_action`:

1. A building that has levelled up and reached `color_restored` drops back to `blueprint_glow` on
   the very next check-in.
2. A sector's `level` can climb past 10, which the schema forbids. The save then becomes unloadable.

## 2. Predict (write these down first)
- Read the `if / elif` in the power section. Which branch runs on the check-in *after* a level-up?
- Should a visual state ever move backwards in an anti-guilt game?
- `sector.level += 1` on a model with `le=10`: why doesn't Pydantic stop it? (Look up `validate_assignment`.)

## 3. Work
Make restoration permanent, and stop `level` at 10.

## 4. Reveal
```bash
python -m pytest labs/memory_vault/08_debug_engine_rules -q
```

## 5. Diff
Compare with your predictions.

## 6. Log
One sentence: what is the difference between validating on creation and validating on assignment?
