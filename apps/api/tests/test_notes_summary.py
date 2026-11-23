"""Notes CRUD, pagination, and summary endpoint tests."""


def test_notes_seed_list(client, auth_headers):
    response = client.get("/api/notes", headers=auth_headers)
    assert response.status_code == 200
    assert len(response.json()) >= 5  # seed has five notes


def test_note_pagination(client, auth_headers):
    page = client.get("/api/notes?limit=2&offset=0", headers=auth_headers)
    assert page.status_code == 200
    assert len(page.json()) == 2

    offset_page = client.get("/api/notes?limit=2&offset=2", headers=auth_headers)
    assert len(offset_page.json()) == 2


def test_create_update_delete_note(client, auth_headers):
    created = client.post(
        "/api/notes",
        headers=auth_headers,
        json={"title": "Revision notes", "emoji": "📘", "class_name": "ENG 455", "type": "Lecture"},
    ).json()
    assert created["title"] == "Revision notes"

    updated = client.patch(
        f"/api/notes/{created['id']}",
        headers=auth_headers,
        json={"reviewed": True, "body": "Key points"},
    )
    assert updated.status_code == 200
    assert updated.json()["reviewed"] is True
    assert updated.json()["body"] == "Key points"

    assert client.delete(f"/api/notes/{created['id']}", headers=auth_headers).status_code == 204


def test_note_not_found_other_user(client, auth_headers, second_headers):
    created = client.post(
        "/api/notes",
        headers=auth_headers,
        json={"title": "Secret note"},
    ).json()
    response = client.patch(
        f"/api/notes/{created['id']}",
        headers=second_headers,
        json={"reviewed": True},
    )
    assert response.status_code == 404


def test_notes_require_auth(client):
    assert client.get("/api/notes").status_code == 401


def test_summary_aggregates(client, auth_headers):
    summary = client.get("/api/summary", headers=auth_headers)
    assert summary.status_code == 200
    body = summary.json()
    assert "finance" in body and "learning" in body and "goals" in body and "health" in body
    # Seed learning: done 9+14+7+5=35, total 12+18+10+8=48 -> 73%
    assert body["learning"]["lessons_total"] == 48
    assert body["learning"]["lessons_done"] == 35
    assert body["learning"]["percent"] == 73
    # Seed health
    assert body["health"]["steps"] == 7500
    # Goals average across 3 seeded goals
    assert body["goals"]["count"] == 3