"""
========================================================================
🏛️ CULTIVATE // SANCTUARY — LAB 01: THE 3-TIER MEMORY CORE
========================================================================
The Memory Vault: short-term observation schema, Jaccard similarity,
and the eviction / graduation engine. (Lab 01: complete.)
========================================================================
"""

from typing import List
from pydantic import BaseModel, Field


# ─── EXERCISE 1: DEFINE THE SHORT-TERM OBSERVATION SCHEMA ─────────────────
# Your architectural idea:
# Instead of overwriting an observation when a similar realization comes in,
# we store the main `observation` string AND a list of `supporting_evidence`
# strings that back it up!
#
# Reference syntax for Pydantic fields:
#   field_name: type = Field(default=...)
#   For a list that starts empty: Field(default_factory=list)
#   For an integer >= 1:          Field(default=1, ge=1)

class ShortTermObservation(BaseModel):
    id: int
    observation: str

    supporting_evidence:List[str] = Field(default_factory=list)

    access_count:int = Field(default=1, ge=1)

    first_seen_session: int = Field(default=1, ge=1)
    last_accessed_session: int = Field(default=1, ge=1)


# ─── EXERCISE 2: SIMILARITY COMPARISON (GROUPING REALIZATIONS) ────────────
# Before we plug in heavy vector embeddings, AI engineers often build a fast,
# deterministic token-overlap similarity check called Jaccard Similarity:
#
#   similarity = (number of shared words) / (total unique words across both)
#
# In Python sets:
#   intersection = words_a & words_b   (shared words)
#   union        = words_a | words_b   (all unique words combined)

STOP_WORDS = {"the", "a", "an", "to", "in", "on", "of", "and", "is", "for", "with", "when", "that"}

def tokenize(text: str) -> set[str]:
    """Splits text into lowercase meaningful words, removing punctuation & stop words."""
    clean = "".join(ch.lower() if ch.isalnum() else " " for ch in text)
    return {w for w in clean.split() if w not in STOP_WORDS and len(w) > 2}


def compute_similarity(obs_a: str, obs_b: str) -> float:
    """
    Returns a similarity score between 0.0 (completely different) and 1.0 (identical meaning words).
    """
    words_a = tokenize(obs_a)
    words_b = tokenize(obs_b)

    if not words_a or not words_b:
        return 0.0

    shared = len(words_a & words_b)
    diff = len(words_a | words_b)
    return shared / diff


# ─── EXERCISE 3: THE MEMORY VAULT (EVICTION & GRADUATION ENGINE) ──────────
# Now we combine your schema + similarity function into the real vault!
# When a new observation arrives from a session:
#   1. Check if it matches an existing observation (similarity >= threshold).
#   2. If MATCHED:
#        - Increment access_count (+1)
#        - Update last_accessed_session
#        - Append new_text to supporting_evidence
#        - If access_count >= 3: it GRADUATES to Long-Term Memory!
#   3. If NOT MATCHED:
#        - If vault is full (15/15): EVICT the oldest entry with the lowest access_count
#        - Add the new observation to the vault

class MemoryVault(BaseModel):
    items: List[ShortTermObservation] = Field(default_factory=list)
    max_slots: int = 15
    similarity_threshold: float = 0.20
    
    def process_observation(self, new_text: str, session_num: int) -> dict:
        """Processes a new realization and returns what action occurred."""
        # Step 1: Search for a similar existing observation
        best_match = None
        best_score = 0.0

        for item in self.items:
            score = compute_similarity(new_text, item.observation)
            if score >= self.similarity_threshold and score > best_score:
                best_match = item
                best_score = score

        # ─── CASE A: MATCH FOUND (REINFORCE & CHECK GRADUATION) ───────────
        if best_match:
            best_match.access_count+= 1
            best_match.last_accessed_session = session_num
            best_match.supporting_evidence.append(new_text)
            if best_match.access_count >=3:
                self.items.remove(best_match)
                return {"action": "graduated", "item":best_match}
            else:
                return {"action": "reinforced", "item": best_match}   

        # ─── CASE B: NO MATCH (ADD NEW & HANDLE EVICTION IF FULL) ──────────
        # Vault full: evict the lowest access_count (oldest last_accessed_session on a tie).
        if len(self.items) >= self.max_slots:
            least_accessed = min(self.items, key=lambda x: (x.access_count, x.last_accessed_session))
            self.items.remove(least_accessed)

        # Create new item
        new_id = len(self.items) + 1
        new_item = ShortTermObservation(
            id=new_id,
            observation=new_text,
            first_seen_session=session_num,
            last_accessed_session=session_num
        )
        self.items.append(new_item)
        return {"action": "created", "item": new_item}


# ─── LAB 01 & 02 VERIFICATION TEST RUNNER ─────────────────────────────────

if __name__ == "__main__":
    print("=" * 60)
    print("🧪 RUNNING LAB 01 TEST SUITE...")
    print("=" * 60)

    # Test 1: Pydantic Schema Defaults
    obs = ShortTermObservation(id=1, observation="Prefers gamified coding challenges")
    assert obs.supporting_evidence == [], "supporting_evidence should default to []"
    assert obs.access_count == 1, "access_count should default to 1"
    print("✅ TEST 1 PASSED: ShortTermObservation schema initialized cleanly!")

    # Test 2: Similarity Check on Related Phrases
    s1 = "Prefers gamified coding challenges"
    s2 = "Learns best when coding challenges are framed like a game"
    sim = compute_similarity(s1, s2)
    print(f"✅ TEST 2 PASSED: Related ideas similarity = {sim:.2f} (Jaccard match)")
    assert sim > 0.15, "Related phrases must show positive similarity"

    # Test 3: Unrelated Phrases
    s3 = "Needs low FODMAP meals for dinner"
    sim_unrelated = compute_similarity(s1, s3)
    print(f"✅ TEST 3 PASSED: Unrelated ideas similarity = {sim_unrelated:.2f}")
    assert sim_unrelated == 0.0, "Unrelated phrases must be 0.0"

    print("=" * 60)
    print("🎉 ALL LAB 01 TESTS PASSED! MEMORY VAULT FOUNDATIONS ONLINE!")
    print("=" * 60)

    # Test 4: MemoryVault process_observation
    vault = MemoryVault(max_slots=2)
    res1 = vault.process_observation("Prefers gamified coding challenges", session_num=1)
    if res1:
        print(f"Action 1: {res1['action']} -> Vault size: {len(vault.items)}")


