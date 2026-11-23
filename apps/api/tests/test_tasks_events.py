"""Task and event CRUD plus seed-backed list tests."""


def test_tasks_seed_on_first_list(client, auth_headers):
    """First list call seeds tasks for a fresh user."""
    response = client.get("/api/tasks", headers=auth_headers)
    assert response.status_code == 200
    tasks = response.json()
    assert len(tasks) >= 6  # seed has six tasks
    assert all("id" in t and "title" in t and "due" in t for t in tasks)


def test_create_and_delete_task(client, auth_headers):
    create = client.post(
        "/api/tasks",
        headers=auth_headers,
        json={"title": "Write tests", "category": "Study", "priority": "High", "due": "10:00"},
    )
    assert create.status_code == 201
    task = create.json()
    assert task["title"] == "Write tests"
    assert task["priority"] == "High"

    delete = client.delete(f"/api/tasks/{task['id']}", headers=auth_headers)
    assert delete.status_code == 204


def test_update_task_done(client, auth_headers):
    created = client.post(
        "/api/tasks",
        headers=auth_headers,
        json={"title": "Finish report", "priority": "Medium"},
    ).json()
    updated = client.patch(
        f"/api/tasks/{created['id']}",
        headers=auth_headers,
        json={"done": True},
    )
    assert updated.status_code == 200
    assert updated.json()["done"] is True


def test_delete_other_users_task_404(client, auth_headers, second_headers):
    created = client.post(
        "/api/tasks",
        headers=auth_headers,
        json={"title": "Private task", "priority": "Low"},
    ).json()
    response = client.delete(f"/api/tasks/{created['id']}", headers=second_headers)
    assert response.status_code == 404


def test_tasks_require_auth(client):
    assert client.get("/api/tasks").status_code == 401


def test_create_event(client, auth_headers):
    response = client.post(
        "/api/events",
        headers=auth_headers,
        json={"title": "Team sync", "place": "Room 1", "starts_at": "2026-11-25T10:00:00"},
    )
    assert response.status_code == 201
    assert response.json()["title"] == "Team sync"


def test_list_events_seeded(client, auth_headers):
    response = client.get("/api/events", headers=auth_headers)
    assert response.status_code == 200
    assert len(response.json()) >= 5  # seed has five events