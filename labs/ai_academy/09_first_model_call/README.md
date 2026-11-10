# Lab 09 · Code-it: first model call with a schema

**NPC:** Professor Pydantic · **Format:** Code-it · **Your code:** [`starter.py`](starter.py)

> 🦉 "A language model is a talented intern who has never once read the style guide. You will ask it
> for an NPC. It will hand you a poem. Your job is to keep asking until it hands you an NPC."

## 1. Ask
This is the core loop of structured output, and you will reuse it in every later quest line:

1. Build a prompt that asks for JSON matching a schema.
2. Parse whatever text comes back (models love wrapping JSON in ```` ```json ```` fences and chatter).
3. Validate it with Pydantic.
4. If it fails, **tell the model what was wrong and ask again**, up to a limit.

You are turning a plain-English description ("a grumpy frog who teaches webhooks at the dojo")
into a validated `NPC` from Lab 04.

The lab is model-agnostic on purpose. `summon_npc` takes any `client` with a
`complete(prompt: str) -> str` method. The tests pass in a fake client with scripted replies,
so you need no API key and it costs nothing.

## 2. Predict (write these down first)
- A model returns `Sure! Here you go:` followed by fenced JSON. What breaks if you call `json.loads` on it?
- The JSON is valid but has `unlock_signal: 150`. Who catches it?
- On a retry, what should the second prompt contain that the first did not?
- What should happen after the third bad answer?

## 3. Work
Complete the three TODOs in `starter.py`: `build_prompt`, `parse_npc`, `summon_npc`.

## 4. Reveal
```bash
python -m pytest labs/ai_academy/09_first_model_call -q
```

## 5. Diff
Compare with your predictions. Which failure mode surprised you?

## 6. Log
One sentence: why is "validate and retry" safer than "write a better prompt"?

## Stretch: make it real
Write a tiny adapter class with a `complete(prompt)` method that calls a real model, and run
`summon_npc` against it from a scratch script. Use the provider's current SDK docs for the call
itself. Keep your API key in an environment variable, never in the repo.
