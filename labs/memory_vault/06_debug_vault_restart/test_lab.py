from lab05_api_gateway import HabitLogRequest, SanctuaryService


def test_the_vault_survives_a_restart(tmp_path, monkeypatch):
    monkeypatch.chdir(tmp_path)

    first_run = SanctuaryService()
    first_run.record_habit(
        HabitLogRequest(sector_id="memory_vault", observation_text="Evening reflection in the notebook", power_boost=5)
    )
    assert len(first_run.engine.vault.items) == 1

    second_run = SanctuaryService()  # simulates restarting the server

    assert len(second_run.engine.vault.items) == 1
    restored = second_run.engine.vault.items[0]
    assert restored.observation == "Evening reflection in the notebook"
    assert restored.access_count == 1


def test_a_memory_can_graduate_across_restarts(tmp_path, monkeypatch):
    monkeypatch.chdir(tmp_path)
    request = HabitLogRequest(sector_id="memory_vault", observation_text="Evening reflection in the notebook", power_boost=5)

    actions = [SanctuaryService().record_habit(request).memory_action for _ in range(2)]

    assert actions == ["created", "reinforced"]
