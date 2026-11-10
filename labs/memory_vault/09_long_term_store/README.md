# Lab 09 · Code-it: the long-term shelf (Tier 3)

**NPC:** Archivist Bobbin · **Format:** Code-it · **Your code:** [`starter.py`](starter.py)

> 🐈 "When a memory graduates, your vault removes it and... drops it on the floor. I have been
> picking them up for weeks. Build me a shelf."

## 1. Ask
In Lab 01, a memory seen three times **graduates**: `process_observation` returns
`{"action": "graduated", "item": ...}` and removes it from short-term storage. Nothing catches it.
Tier 3 does not exist yet.

Build `LongTermStore`:

- `promote(observation, session_num)`: put a graduated observation on the shelf. If a very similar
  pattern is already there, merge into it instead of creating a duplicate.
- `recall(query, top_k)`: return the stored memories most similar to a query. This is retrieval,
  the "R" in RAG, with word-overlap standing in for embeddings until a later lab.
- `save(path)` / `load(path)`: survive a restart.

## 2. Predict (write these down first)
- Two graduated memories say almost the same thing. One shelf entry or two? What do you keep from each?
- `recall("coding games")` against a shelf of five memories: what decides the order?
- What should `recall` return when nothing is similar at all?

## 3. Work
Complete the four TODOs in `starter.py`. Reuse `compute_similarity` from `memory_engine.py`.

## 4. Reveal
```bash
python -m pytest labs/memory_vault/09_long_term_store -q
```

## 5. Diff
Compare with your predictions.

## 6. Log
One sentence: where does word-overlap similarity fall down as a way to recall memories?
(That answer is your reason to do the embeddings lab next.)

## Stretch
Wire it in: make `SanctuaryEngine` hold a `LongTermStore` and call `promote` when the vault reports
`"graduated"`.
