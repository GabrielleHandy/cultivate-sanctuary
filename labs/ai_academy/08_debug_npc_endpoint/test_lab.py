def test_npc_endpoint_lists_the_registry(tmp_path, monkeypatch):
    monkeypatch.chdir(tmp_path)
    import api

    npcs = api.get_npcs()

    assert isinstance(npcs, list)
    assert any(npc["id"] == "prof_pydantic" for npc in npcs)
    assert all(isinstance(npc, dict) for npc in npcs)
