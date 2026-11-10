"""
Lab 09: first model call with a schema.

Turn a plain-English description into a validated NPC by asking a model for JSON,
parsing the reply, validating it, and retrying with feedback when it is wrong.
"""
from typing import Protocol

from lab04_npc_registry import NPC


class ModelClient(Protocol):
    """Anything with a `complete` method can be the model. Tests pass in a fake one."""

    def complete(self, prompt: str) -> str: ...


def build_prompt(description: str) -> str:
    """
    TODO 1: return a prompt that asks the model to invent an NPC as JSON.

    It must include:
      - the `description` text
      - every field name of the NPC schema (hint: NPC.model_fields, or NPC.model_json_schema())
      - an instruction to reply with JSON only
    """
    raise NotImplementedError("TODO 1: build_prompt")


def parse_npc(raw: str) -> NPC:
    """
    TODO 2: turn the model's raw reply into a validated NPC.

    The reply may be clean JSON, JSON inside a ```json fence, or JSON with chatter around it.
    Find the JSON object, load it, and validate it with the NPC model.

    Raise ValueError (pydantic's ValidationError already is one) if there is no usable JSON
    or it does not match the schema.
    """
    raise NotImplementedError("TODO 2: parse_npc")


def summon_npc(client: ModelClient, description: str, max_attempts: int = 3) -> NPC:
    """
    TODO 3: the validate-and-retry loop.

      1. Call client.complete(...) with the prompt from build_prompt.
      2. Try parse_npc on the reply. If it works, return the NPC.
      3. If it fails, call the model again. The retry prompt must contain the original
         description AND the error message, so the model can correct itself.
      4. After `max_attempts` failed replies, raise ValueError.
    """
    raise NotImplementedError("TODO 3: summon_npc")
