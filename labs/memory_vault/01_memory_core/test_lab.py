from memory_engine import MemoryVault, ShortTermObservation, compute_similarity


def test_observation_defaults():
    obs = ShortTermObservation(id=1, observation="Prefers gamified coding challenges")
    assert obs.supporting_evidence == []
    assert obs.access_count == 1


def test_related_phrases_are_similar_and_unrelated_are_not():
    base = "Prefers gamified coding challenges"
    assert compute_similarity(base, "Learns best when coding challenges are framed like a game") > 0.15
    assert compute_similarity(base, "Needs low FODMAP meals for dinner") == 0.0


def test_created_then_reinforced_then_graduated():
    vault = MemoryVault()
    text = "Prefers gamified coding challenges"
    actions = [vault.process_observation(text, session_num=n)["action"] for n in (1, 2, 3)]
    assert actions == ["created", "reinforced", "graduated"]
    assert vault.items == []  # a graduated memory leaves short-term storage


def test_reinforcing_keeps_the_evidence():
    vault = MemoryVault()
    vault.process_observation("Prefers gamified coding challenges", session_num=1)
    result = vault.process_observation("Prefers gamified coding challenges a lot", session_num=2)
    assert result["item"].supporting_evidence == ["Prefers gamified coding challenges a lot"]
    assert result["item"].last_accessed_session == 2


def test_full_vault_evicts_the_least_used_memory():
    vault = MemoryVault(max_slots=2)
    vault.process_observation("alpha bravo charlie", session_num=1)
    vault.process_observation("delta echo foxtrot", session_num=1)
    vault.process_observation("delta echo foxtrot", session_num=2)   # reinforce the second
    vault.process_observation("golf hotel india", session_num=3)     # forces an eviction

    kept = [item.observation for item in vault.items]
    assert "alpha bravo charlie" not in kept
    assert len(kept) == 2
