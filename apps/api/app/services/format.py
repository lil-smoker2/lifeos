from datetime import UTC, datetime


def relative_time(moment: datetime) -> str:
    if moment.tzinfo is None:
        moment = moment.replace(tzinfo=UTC)
    delta = datetime.now(UTC) - moment
    minutes = max(1, int(delta.total_seconds() // 60))
    if minutes < 60:
        return f"{minutes} min ago"
    hours = minutes // 60
    if hours < 24:
        return f"{hours}h ago"
    if hours < 48:
        return "Yesterday"
    return f"{hours // 24} days ago"
