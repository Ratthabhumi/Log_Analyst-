import re

from app.schemas.analyze import EventMetadata

KNOWN_PROVIDERS = {
    "10016": "DistributedCOM",
    "41": "Kernel-Power",
    "6008": "EventLog",
    "1001": "Windows Error Reporting",
    "4625": "Security",
    "7031": "Service Control Manager",
}

CRITICAL_LEVELS = {"critical", "error", "1", "2", "emergency", "alert"}

# Fortinet log action types that are security-relevant
FORTINET_CRITICAL_ACTIONS = {"block", "deny", "drop", "reset", "blocked"}


def _field(text: str, *patterns: str) -> str:
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(1).strip()
    return ""


def _fortinet_field(text: str, key: str) -> str:
    """Extract key=value or key="value" from Fortinet log line."""
    match = re.search(rf'(?:^|\s){re.escape(key)}="([^"]*)"', text)
    if match:
        return match.group(1).strip()
    match = re.search(rf'(?:^|\s){re.escape(key)}=(\S+)', text)
    if match:
        return match.group(1).strip()
    return ""


def _is_fortinet_log(text: str) -> bool:
    """Detect if text looks like a Fortinet/FortiGate log."""
    fortinet_markers = [
        r'devname=',
        r'logid=',
        r'type="(traffic|event|utm|anomaly|virus|webfilter|ips|dns)"',
        r'fortigate',
        r'fortios',
        r'fgt_',
        r'subtype="(forward|local|ips|webfilter|antivirus)"',
    ]
    text_lower = text.lower()
    return any(re.search(p, text_lower) for p in fortinet_markers)


def _parse_fortinet(text: str) -> EventMetadata:
    """Parse Fortinet FortiGate log format."""
    log_id  = _fortinet_field(text, "logid")
    log_type = _fortinet_field(text, "type")
    subtype  = _fortinet_field(text, "subtype")
    level    = _fortinet_field(text, "level") or _fortinet_field(text, "severity")
    action   = _fortinet_field(text, "action")
    devname  = _fortinet_field(text, "devname")
    srcip    = _fortinet_field(text, "srcip")
    dstip    = _fortinet_field(text, "dstip")
    service  = _fortinet_field(text, "service")
    msg      = _fortinet_field(text, "msg")
    policyid = _fortinet_field(text, "policyid")

    # Build a human-readable event ID: logid or type+subtype
    event_id = log_id if log_id else f"{log_type}-{subtype}" if log_type else "Fortinet"
    provider = f"FortiGate/{log_type}" if log_type else "FortiGate"
    if subtype:
        provider += f"/{subtype}"

    # Timestamp: date= + time=
    date_v = _fortinet_field(text, "date")
    time_v = _fortinet_field(text, "time")
    timestamp = f"{date_v} {time_v}".strip() if date_v or time_v else ""

    # Build description
    parts = []
    if srcip:   parts.append(f"Src: {srcip}")
    if dstip:   parts.append(f"Dst: {dstip}")
    if service: parts.append(f"Service: {service}")
    if action:  parts.append(f"Action: {action}")
    if policyid: parts.append(f"PolicyID: {policyid}")
    if msg:     parts.append(f"Message: {msg}")
    log_name = " | ".join(parts) if parts else log_type

    # Critical if action is block/deny/drop or level is emergency/alert/error
    level_lower = level.lower() if level else ""
    action_lower = action.lower() if action else ""
    is_critical = (
        level_lower in CRITICAL_LEVELS
        or action_lower in FORTINET_CRITICAL_ACTIONS
    )

    return EventMetadata(
        eventId=event_id or "Unknown",
        provider=provider,
        level=level or action or "",
        logName=log_name,
        timestamp=timestamp,
        computer=devname,
        isCritical=is_critical,
        faultingApp="",
    )


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

    # Detect Fortinet log first
    if _is_fortinet_log(text):
        return _parse_fortinet(text)

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
