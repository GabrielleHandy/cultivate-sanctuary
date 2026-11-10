# Lab 07 · Debug-it: two memories, one name

**NPC:** Archivist Bobbin · **Format:** Debug-it · **Your code:** [`memory_engine.py`](../../../memory_engine.py)

> 🐈 "I filed two different memories under the number 3. Now when you ask for number 3, I flip a coin."

## 1. Ask
After the vault evicts or graduates a memory, the next new memory can be given an id that is
already in use.

## 2. Predict (write these down first)
- How is `new_id` calculated today?
- Walk through it by hand: ids `[1, 2, 3]`, evict id 1, add a new memory. What id does it get?
- Name two different ways to hand out ids that can never collide.

## 3. Work
Make every observation id unique for the lifetime of a vault, including after it is saved and
reloaded.

## 4. Reveal
```bash
python -m pytest labs/memory_vault/07_debug_unique_ids -q
```

## 5. Diff
Compare with your predictions.

## 6. Log
One sentence: why is "count the items and add one" a trap?
