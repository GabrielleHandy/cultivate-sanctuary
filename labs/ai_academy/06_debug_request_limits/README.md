# Lab 06 · Debug-it: the unguarded door

**NPC:** Professor Pydantic · **Format:** Debug-it · **Your code:** [`lab05_api_gateway.py`](../../../lab05_api_gateway.py)

> 🦉 "You wrote a contract in a comment and then did not enforce it. A comment is not a guard."

## 1. Ask
`HabitLogRequest` accepts anything. Send `power_boost=500` and the sector is saved with
`power_level: 420`. On the next start the save file fails validation, and the service **silently
starts fresh**, wiping your progress. A negative boost drains power instead.

## 2. Predict (write these down first)
- Where is the intended contract written down? Why doesn't Python enforce it?
- Which is the better place to stop a bad number: the request model, or the engine? Why?
- What should a client receive when it sends `power_boost=500`?

## 3. Work
Make `HabitLogRequest` enforce the contract in the comment above it:
`observation_text` 3 to 280 characters, `power_boost` 1 to 50, default 15.

Hint: you already used `Field(ge=..., le=...)` in Lab 04. Strings have `min_length` / `max_length`.

## 4. Reveal
```bash
python -m pytest labs/ai_academy/06_debug_request_limits -q
```

## 5. Diff
Compare with your predictions. Was the bug where you expected?

## 6. Log
One sentence in your session log: what does "validate at the boundary" mean to you now?

**Stretch:** even with the door guarded, should `load_state()` really throw your save away without telling you?
