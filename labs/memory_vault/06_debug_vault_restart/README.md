# Lab 06 · Debug-it: the vault that forgets

**NPC:** Archivist Bobbin · **Format:** Debug-it · **Your code:** [`lab05_api_gateway.py`](../../../lab05_api_gateway.py)

> 🐈 "I wrote everything down. Then someone restarted the server and I woke up with empty shelves.
> Per my records... I have no records."

## 1. Ask
`save_state()` writes the memory vault to `sanctuary_save.json`. After a restart the vault is empty
anyway. That means a memory can never be seen in three separate runs, so it can never graduate.

## 2. Predict (write these down first)
- Open `sanctuary_save.json`. Is the vault in the file? So is the bug in saving, or loading?
- Which three things does `save_state()` write? Which of them does `load_state()` read back?
- The saved vault is a list of plain dicts. What do you need to turn them back into?

## 3. Work
Make a new `SanctuaryService` come back with the same vault contents the old one saved.

## 4. Reveal
```bash
python -m pytest labs/memory_vault/06_debug_vault_restart -q
```

## 5. Diff
Compare with your predictions.

## 6. Log
One sentence: what is a "round-trip test", and why would it have caught this?
