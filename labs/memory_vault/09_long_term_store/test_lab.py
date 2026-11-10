from memory_engine import MemoryVault, ShortTermObservation
from tools.labkit import load_starter

starter = load_starter(__file__)
LongTermStore = starter.LongTermStore


def graduated(text, evidence=()):
    return ShortTermObservation(id=1, observation=text, supporting_evidence=list(evidence), access_count=3)


# ── TODO 1 ──
def test_promote_creates_numbered_entries():
    store = LongTermStore()
    first = store.promote(graduated("Prefers gamified coding challenges", ["likes quests"]), session_num=4)
    second = store.promote(graduated("Needs low FODMAP meals for dinner"), session_num=5)

    assert (first.id, second.id) == ("LT-1", "LT-2")
    assert first.pattern == "Prefers gamified coding challenges"
    assert first.evidence == ["likes quests"]
    assert first.graduated_session == 4


def test_promoting_a_similar_pattern_merges_instead_of_duplicating():
    store = LongTermStore()
    store.promote(graduated("Prefers gamified coding challenges", ["likes quests"]), session_num=4)
    merged = store.promote(graduated("Prefers gamified coding challenges daily", ["likes quests", "asked for a boss fight"]), session_num=9)

    assert len(store.items) == 1
    assert merged.id == "LT-1"
    assert merged.reinforced_count == 1
    assert "Prefers gamified coding challenges daily" in merged.evidence
    assert merged.evidence.count("likes quests") == 1
    assert "asked for a boss fight" in merged.evidence


def test_works_with_a_real_graduation_from_the_vault():
    vault, store = MemoryVault(), LongTermStore()
    for session in (1, 2, 3):
        result = vault.process_observation("Prefers gamified coding challenges", session_num=session)
    assert result["action"] == "graduated"

    entry = store.promote(result["item"], session_num=3)
    assert entry.pattern == "Prefers gamified coding challenges"
    assert len(entry.evidence) == 2  # the two reinforcing observations


# ── TODO 2 ──
def test_recall_ranks_by_similarity_and_drops_non_matches():
    store = LongTermStore()
    store.promote(graduated("Prefers gamified coding challenges"), session_num=1)
    store.promote(graduated("Needs low FODMAP meals for dinner"), session_num=1)
    store.promote(graduated("Enjoys coding late at night"), session_num=1)

    results = store.recall("gamified coding challenges")
    assert [m.pattern for m in results] == ["Prefers gamified coding challenges", "Enjoys coding late at night"]
    assert store.recall("gamified coding challenges", top_k=1)[0].id == "LT-1"
    assert store.recall("quantum submarine") == []


# ── TODO 3 and 4 ──
def test_save_and_load_round_trip(tmp_path):
    path = tmp_path / "long_term.json"
    store = LongTermStore()
    store.promote(graduated("Prefers gamified coding challenges", ["likes quests"]), session_num=4)
    store.save(path)

    loaded = LongTermStore.load(path)
    assert loaded == store

    third = loaded.promote(graduated("Needs low FODMAP meals for dinner"), session_num=6)
    assert third.id == "LT-2"


def test_loading_a_missing_file_gives_an_empty_store(tmp_path):
    assert LongTermStore.load(tmp_path / "nothing_here.json").items == []
