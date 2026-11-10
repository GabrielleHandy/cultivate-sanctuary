"""
Lab 09: the long-term shelf (Tier 3).

Graduated short-term observations are promoted here, de-duplicated, recalled by similarity,
and saved to disk.
"""
from pathlib import Path
from typing import List

from pydantic import BaseModel, Field

from memory_engine import ShortTermObservation, compute_similarity  # noqa: F401  (you will need both)


class LongTermMemory(BaseModel):
    id: str                                    # "LT-1", "LT-2", ...
    pattern: str                               # the observation text
    evidence: List[str] = Field(default_factory=list)
    graduated_session: int = Field(ge=1)
    reinforced_count: int = Field(default=0, ge=0)  # how many later graduations merged into this one


class LongTermStore(BaseModel):
    items: List[LongTermMemory] = Field(default_factory=list)
    merge_threshold: float = 0.5               # similarity at or above this means "same pattern"

    def promote(self, observation: ShortTermObservation, session_num: int) -> LongTermMemory:
        """
        TODO 1: put a graduated observation on the shelf and return the shelf entry.

        - If an existing item's pattern is similar enough (>= merge_threshold), MERGE:
          add the observation's text and its supporting_evidence to that item's evidence
          (no duplicates), add 1 to reinforced_count, and return that item.
        - Otherwise create a new LongTermMemory with the next unused id ("LT-1", "LT-2", ...),
          carrying over the supporting_evidence, and return it.
        """
        raise NotImplementedError("TODO 1: promote")

    def recall(self, query: str, top_k: int = 3) -> List[LongTermMemory]:
        """
        TODO 2: return up to `top_k` memories most similar to `query`, best first.
        Leave out anything with zero similarity.
        """
        raise NotImplementedError("TODO 2: recall")

    def save(self, path: Path) -> None:
        """TODO 3: write the whole store to `path` as JSON."""
        raise NotImplementedError("TODO 3: save")

    @classmethod
    def load(cls, path: Path) -> "LongTermStore":
        """TODO 4: read a store back from `path`. A missing file means an empty store."""
        raise NotImplementedError("TODO 4: load")
