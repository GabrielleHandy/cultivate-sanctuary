# Lab 08 · Debug-it: the silent roll call

**NPC:** Professor Pydantic · **Format:** Debug-it · **Your code:** [`api.py`](../../../api.py)

> 🦉 "You asked a list for its values. Lists do not have values. Lists *are* values."

## 1. Ask
`GET /api/v1/npcs` fails every time it is called.

## 2. Predict (write these down first)
- What type is `registry.npcs`? Check `lab04_npc_registry.py` before you guess.
- What would the JavaScript equivalent of this mistake look like?
- Why did nobody notice until now?

## 3. Work
Make the endpoint return every registered NPC as a list of dicts.

## 4. Reveal
```bash
python -m pytest labs/ai_academy/08_debug_npc_endpoint -q
```

## 5. Diff
Compare with your predictions.

## 6. Log
One sentence: what is the cheapest test that would have caught this on day one?
