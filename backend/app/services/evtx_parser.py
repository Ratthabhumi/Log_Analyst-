import io
import re
import defusedxml.ElementTree as ET

NS = {"e": "http://schemas.microsoft.com/win/2004/08/events/event"}

LEVEL_MAP = {
    "1": "Critical",
    "2": "Error",
    "3": "Warning",
    "4": "Information",
    "5": "Verbose",
}


def _text(elem: ET.Element | None) -> str:
    return (elem.text or "").strip() if elem is not None else ""


def _event_xml_to_text(xml_str: str) -> str:
    try:
        root = ET.fromstring(xml_str)
    except ET.ParseError:
        return ""

    system = root.find("e:System", NS)
    if system is None:
        return ""

    provider = system.find("e:Provider", NS)
    provider_name = provider.get("Name", "") if provider is not None else ""
    event_id = _text(system.find("e:EventID", NS))
    level_raw = _text(system.find("e:Level", NS))
    level = LEVEL_MAP.get(level_raw, level_raw)
    channel = _text(system.find("e:Channel", NS))
    computer = _text(system.find("e:Computer", NS))

    time_elem = system.find("e:TimeCreated", NS)
    timestamp = time_elem.get("SystemTime", "") if time_elem is not None else ""

    lines = []
    if channel:
        lines.append(f"Log Name: {channel}")
    if provider_name:
        lines.append(f"Source: {provider_name}")
    if timestamp:
        lines.append(f"Date: {timestamp}")
    if event_id:
        lines.append(f"Event ID: {event_id}")
    if level:
        lines.append(f"Level: {level}")
    if computer:
        lines.append(f"Computer: {computer}")

    event_data = root.find("e:EventData", NS)
    if event_data is not None:
        for data in event_data.findall("e:Data", NS):
            name = data.get("Name", "")
            value = _text(data)
            if name and value:
                lines.append(f"{name}: {value}")

    return "\n".join(lines)


def _is_error_level(xml_str: str) -> bool:
    match = re.search(r"<Level>(\d+)</Level>", xml_str)
    if not match:
        return False
    return match.group(1) in ("1", "2")


def parse_evtx(content: bytes, max_records: int = 100) -> tuple[str, str]:
    try:
        from Evtx.Evtx import Evtx
    except ImportError:
        raise RuntimeError(
            "python-evtx is not installed. Run: pip install python-evtx"
        )

    fallback = ""
    error_event = ""

    with Evtx(io.BytesIO(content)) as log:
        for i, record in enumerate(log.records()):
            if i >= max_records:
                break
            xml_str = record.xml()
            text = _event_xml_to_text(xml_str)
            if not text:
                continue
            if not fallback:
                fallback = text
            if _is_error_level(xml_str):
                error_event = text
                break

    extracted = error_event or fallback
    if not extracted:
        raise ValueError("No events found in EVTX file")

    return extracted, f"Parsed EVTX file ({max_records} records scanned)"
