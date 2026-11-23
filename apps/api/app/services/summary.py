from app.models import Course, Goal, Transaction


def finance_summary(rows: list[Transaction]) -> dict:
    totals_by_currency: dict[str, dict[str, int]] = {}
    for row in rows:
        totals = totals_by_currency.setdefault(
            row.currency,
            {"income_minor": 0, "expenses_minor": 0, "savings_minor": 0, "count": 0},
        )
        if row.type == "income":
            totals["income_minor"] += row.amount_minor
        elif row.type == "expense":
            totals["expenses_minor"] += row.amount_minor
        elif row.type == "savings":
            totals["savings_minor"] += row.amount_minor
        totals["count"] += 1

    currencies = {
        currency: {
            "income": totals["income_minor"] / 100,
            "expenses": totals["expenses_minor"] / 100,
            "savings": totals["savings_minor"] / 100,
            "balance": (totals["income_minor"] - totals["expenses_minor"]) / 100,
            "count": totals["count"],
        }
        for currency, totals in totals_by_currency.items()
    }
    return {"by_currency": currencies}


def learning_summary(rows: list[Course]) -> dict:
    lessons_done = sum(row.lessons_done for row in rows)
    lessons_total = sum(row.lessons_total for row in rows)
    return {
        "courses": len(rows),
        "lessons_done": lessons_done,
        "lessons_total": lessons_total,
        "percent": round((lessons_done / lessons_total) * 100) if lessons_total else 0,
    }


def goals_summary(rows: list[Goal]) -> dict:
    percentages = [min(100, round((row.current / row.target) * 100)) if row.target else 0 for row in rows]
    return {
        "count": len(rows),
        "average_percent": round(sum(percentages) / len(percentages)) if percentages else 0,
    }
