"""Finance transactions and finance summary tests."""


def test_transactions_seed_summary(client, auth_headers):
    summary = client.get("/api/transactions/summary", headers=auth_headers)
    assert summary.status_code == 200
    by_currency = summary.json()["by_currency"]
    assert "USD" in by_currency
    usd = by_currency["USD"]
    # Seed: income 120000 + 26000, expenses 38000 + 9600 + 7400 + 2800
    assert usd["income"] == 1460.0
    assert usd["expenses"] == 578.0
    assert usd["balance"] == 882.0
    assert usd["count"] == 7


def test_create_transaction_updates_summary(client, auth_headers):
    before = client.get("/api/transactions/summary", headers=auth_headers).json()["by_currency"]["USD"]

    created = client.post(
        "/api/transactions",
        headers=auth_headers,
        json={"label": "Refund", "amount": 50.0, "type": "income", "currency": "USD"},
    )
    assert created.status_code == 201
    assert created.json()["amount"] == 50.0

    after = client.get("/api/transactions/summary", headers=auth_headers).json()["by_currency"]["USD"]
    assert after["income"] == before["income"] + 50.0
    assert after["balance"] == before["balance"] + 50.0


def test_create_expense_balance(client, auth_headers):
    before = client.get("/api/transactions/summary", headers=auth_headers).json()["by_currency"]["USD"]

    created = client.post(
        "/api/transactions",
        headers=auth_headers,
        json={"label": "Coffee", "amount": 12.5, "type": "expense", "currency": "USD"},
    )
    assert created.status_code == 201

    after = client.get("/api/transactions/summary", headers=auth_headers).json()["by_currency"]["USD"]
    assert after["expenses"] == before["expenses"] + 12.5
    assert after["balance"] == before["balance"] - 12.5


def test_delete_transaction(client, auth_headers):
    created = client.post(
        "/api/transactions",
        headers=auth_headers,
        json={"label": "Temp", "amount": 5.0, "type": "expense"},
    ).json()
    assert client.delete(f"/api/transactions/{created['id']}", headers=auth_headers).status_code == 204


def test_transactions_require_auth(client):
    assert client.get("/api/transactions").status_code == 401