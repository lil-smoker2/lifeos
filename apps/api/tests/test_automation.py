"""Automation rule CRUD, manual run, and trigger-fired run history tests."""


def test_rules_seeded(client, auth_headers):
    response = client.get("/api/automation/rules", headers=auth_headers)
    assert response.status_code == 200
    rules = response.json()
    assert len(rules) >= 3  # seed has three rules


def test_manual_run_increments_and_logs(client, auth_headers):
    rules = client.get("/api/automation/rules", headers=auth_headers).json()
    rule = rules[0]
    runs_before = rule["runs"]

    run = client.post(f"/api/automation/rules/{rule['id']}/run", headers=auth_headers)
    assert run.status_code == 200
    assert run.json()["title"].startswith("Ran ")

    rules_after = client.get("/api/automation/rules", headers=auth_headers).json()
    matching = next(r for r in rules_after if r["id"] == rule["id"])
    assert matching["runs"] == runs_before + 1

    activity = client.get("/api/automation/activity", headers=auth_headers).json()
    assert any(a["title"].startswith("Ran ") for a in activity)


def test_task_completion_fires_active_rule(client, auth_headers):
    """Completing a task with an active task_completed rule writes activity."""
    rules = client.get("/api/automation/rules", headers=auth_headers).json()
    task_rule = next(r for r in rules if r["trigger_kind"] == "task_completed" and r["active"])
    runs_before = task_rule["runs"]

    task = client.post(
        "/api/tasks",
        headers=auth_headers,
        json={"title": "Trigger me", "priority": "Medium"},
    ).json()
    client.patch(f"/api/tasks/{task['id']}", headers=auth_headers, json={"done": True})

    rules_after = client.get("/api/automation/rules", headers=auth_headers).json()
    matching = next(r for r in rules_after if r["id"] == task_rule["id"])
    assert matching["runs"] == runs_before + 1


def test_create_rule(client, auth_headers):
    created = client.post(
        "/api/automation/rules",
        headers=auth_headers,
        json={"trigger": "New rule", "trigger_kind": "expense_added", "action": "Do something"},
    ).json()
    assert created["trigger"] == "New rule"
    assert created["active"] is True


def test_delete_rule(client, auth_headers):
    created = client.post(
        "/api/automation/rules",
        headers=auth_headers,
        json={"trigger": "Temp", "trigger_kind": "study_session", "action": "Temp action"},
    ).json()
    assert client.delete(f"/api/automation/rules/{created['id']}", headers=auth_headers).status_code == 204