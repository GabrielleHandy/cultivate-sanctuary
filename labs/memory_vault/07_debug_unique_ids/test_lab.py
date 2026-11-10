from memory_engine import MemoryVault

DISTINCT = ["alpha bravo charlie", "delta echo foxtrot", "golf hotel india", "juliet kilo lima", "mike november oscar"]


def test_ids_stay_unique_after_an_eviction():
    vault = MemoryVault(max_slots=3)
    for n, text in enumerate(DISTINCT, start=1):
        vault.process_observation(text, session_num=n)

    ids = [item.id for item in vault.items]
    assert len(ids) == len(set(ids)), f"duplicate ids in the vault: {ids}"


def test_ids_stay_unique_after_a_graduation():
    vault = MemoryVault()
    vault.process_observation(DISTINCT[0], session_num=1)
    vault.process_observation(DISTINCT[1], session_num=1)
    for session in (2, 3):
        vault.process_observation(DISTINCT[0], session_num=session)  # graduates and leaves the vault
    vault.process_observation(DISTINCT[2], session_num=4)

    ids = [item.id for item in vault.items]
    assert len(ids) == len(set(ids)), f"duplicate ids in the vault: {ids}"


def test_ids_stay_unique_after_a_save_and_reload():
    vault = MemoryVault(max_slots=3)
    for n, text in enumerate(DISTINCT[:4], start=1):
        vault.process_observation(text, session_num=n)

    reloaded = MemoryVault.model_validate(vault.model_dump())
    reloaded.process_observation(DISTINCT[4], session_num=5)

    ids = [item.id for item in reloaded.items]
    assert len(ids) == len(set(ids)), f"duplicate ids in the vault: {ids}"
