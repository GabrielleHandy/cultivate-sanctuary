import json

import pytest

from tools.labkit import load_starter

starter = load_starter(__file__)

DESCRIPTION = "a grumpy frog who teaches webhooks at the dojo"

GOOD = {
    "id": "sensei_pushup", "name": "Sensei Pushup", "species": "frog", "building": "kinetic_dojo",
    "teaches": "webhooks", "unlock_signal": 40, "traits": ["disciplined", "competitive"],
    "catchphrase": "One. Two. Data.",
}


class FakeClient:
    """Stands in for a model: replays scripted replies and records every prompt it was sent."""

    def __init__(self, replies):
        self.replies = list(replies)
        self.prompts = []

    def complete(self, prompt: str) -> str:
        self.prompts.append(prompt)
        return self.replies.pop(0)


# ── TODO 1 ──
def test_prompt_contains_the_description_and_every_field():
    prompt = starter.build_prompt(DESCRIPTION)
    assert DESCRIPTION in prompt
    for field in ["id", "name", "species", "building", "teaches", "unlock_signal", "traits", "catchphrase"]:
        assert field in prompt
    assert "json" in prompt.lower()


# ── TODO 2 ──
def test_parses_clean_json():
    assert starter.parse_npc(json.dumps(GOOD)).id == "sensei_pushup"


def test_parses_json_inside_a_code_fence_with_chatter():
    raw = "Sure! Here is your NPC:\n```json\n" + json.dumps(GOOD, indent=2) + "\n```\nHope that helps!"
    assert starter.parse_npc(raw).species == "frog"


def test_reply_with_no_json_raises_value_error():
    with pytest.raises(ValueError):
        starter.parse_npc("I am a poem about frogs, not an NPC.")


def test_json_that_breaks_the_schema_raises_value_error():
    with pytest.raises(ValueError):
        starter.parse_npc(json.dumps({**GOOD, "unlock_signal": 150}))


# ── TODO 3 ──
def test_good_first_reply_needs_one_call():
    client = FakeClient([json.dumps(GOOD)])
    npc = starter.summon_npc(client, DESCRIPTION)
    assert npc.name == "Sensei Pushup"
    assert len(client.prompts) == 1


def test_bad_reply_is_retried_with_the_error_fed_back():
    bad = json.dumps({**GOOD, "unlock_signal": 150})
    client = FakeClient([bad, json.dumps(GOOD)])

    npc = starter.summon_npc(client, DESCRIPTION)

    assert npc.unlock_signal == 40
    assert len(client.prompts) == 2
    retry_prompt = client.prompts[1]
    assert retry_prompt != client.prompts[0]
    assert DESCRIPTION in retry_prompt
    assert "unlock_signal" in retry_prompt  # the validation error names the field that was wrong


def test_gives_up_after_max_attempts():
    client = FakeClient(["nope", "still nope", "nope again", json.dumps(GOOD)])
    with pytest.raises(ValueError):
        starter.summon_npc(client, DESCRIPTION, max_attempts=3)
    assert len(client.prompts) == 3
