import re
from typing import Optional

from app.schemas.analyze import EventMetadata

KNOWN_PROVIDERS = {
    "10016": "DistributedCOM",
    "41": "Kernel-Power",
    "6008": "EventLog",
    "1001": "Windows Error Reporting",
    "4625": "Security",
    "7031": "Service Control Manager",
}

CRITICAL_LEVELS = {"critical", "error", "1", "2"}


def _field(text: str, *patterns: str) -> str:
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(1).strip()
    return ""


def is_critical_level(level: str) -> bool:
    normalized = level.strip().lower()
    if not normalized:
        return False
    if normalized in CRITICAL_LEVELS:
        return True
    return "critical" in normalized or normalized == "error"


def parse_event_metadata(text: str) -> EventMetadata:
    if not text:
        return EventMetadata()

    event_id = _field(text, r"Event\s*ID[:\s]+(\d+)", r'"id"[:\s]+(\d+)', r"'id'[:\s]+(\d+)")
    provider = _field(
        text,
        r"Provider\s*Name[:\s]+([^\n\r]+)",
        r"Source[:\s]+([^\n\r]+)",
        r"Provider[:\s]+([^\n\r]+)",
        r'"provider"[:\s]+"([^"]+)"',
        r"'provider'[:\s]+'([^']+)'",
    )
    if not provider and event_id in KNOWN_PROVIDERS:
        provider = KNOWN_PROVIDERS[event_id]

    level = _field(text, r"Level[:\s]+([^\n\r]+)")
    log_name = _field(text, r"Log\s*Name[:\s]+([^\n\r]+)")
    timestamp = _field(
        text,
        r"Date\s*(?:and\s*Time)?[:\s]+([^\n\r]+)",
        r"Time\s*Created[:\s]+([^\n\r]+)",
        r"Logged[:\s]+([^\n\r]+)",
    )
    computer = _field(text, r"Computer[:\s]+([^\n\r]+)")
    
    # Extract faulting application name
    faulting_app = _field(
        text,
        r"Faulting\s+application\s+name[:\s]+([^\n\r]+)",
        r"Faulting\s+module\s+name[:\s]+([^\n\r]+)",
    )

    return EventMetadata(
        eventId=event_id or "Unknown",
        provider=provider or "Unknown",
        level=level,
        logName=log_name,
        timestamp=timestamp,
        computer=computer,
        isCritical=is_critical_level(level),
        faultingApp=faulting_app,
    )
