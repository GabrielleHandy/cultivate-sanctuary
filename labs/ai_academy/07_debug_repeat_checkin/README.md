# Lab 07 · Debug-it: the second check-in

**NPC:** Professor Pydantic · **Format:** Debug-it · **Your code:** [`lab05_api_gateway.py`](../../../lab05_api_gateway.py), [`memory_engine.py`](../../../memory_engine.py)

> 🦉 "Two modules. Two vocabularies. One of them is wrong, and the user gets a 500."

## 1. Ask
Log a habit. Log a similar one again. The second call blows up with a `ValidationError`, which the
API turns into a 500. Worse: the power boost was already saved before the error, so retrying
double-counts.

## 2. Predict (write these down first)
- Which two pieces of code disagree, and about what word?
- Which side should change: the one that produces the value, or the one that validates it?
- Why did the boost get saved even though the request "failed"?

## 3. Work
Make a repeated, similar check-in succeed and report that the memory was reinforced.

Hint: run the test and read the last line of the traceback. It names the field and the value.

## 4. Reveal
```bash
python -m pytest labs/ai_academy/07_debug_repeat_checkin -q
```

## 5. Diff
Compare with your predictions.

## 6. Log
One sentence: how would you stop two modules drifting apart like this in future?

**Stretch:** `api.py` catches every `Exception` and returns a 500. Which errors deserve a 4xx instead?
