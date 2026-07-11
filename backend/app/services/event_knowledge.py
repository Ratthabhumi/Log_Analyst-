from app.schemas.analyze import SolutionSummary

# Curated summaries for common Windows Event IDs.
# Used instead of random web-snippet translation for consistent, accurate output.

EVENT_KNOWLEDGE: dict[str, dict[str, SolutionSummary]] = {
    "10016": {
        "th": SolutionSummary(
            overview=(
                "Event ID 10016 มาจาก DistributedCOM (DCOM) หมายความว่าโปรแกรมหรือบริการ Windows "
                "พยายามเรียกใช้ COM Server แต่ไม่มีสิทธิ์ Local Activation ตามที่ตั้งค่าไว้ "
                "โดยทั่วไปเป็น Warning/Error ที่พบบ่อย และมักไม่ทำให้เครื่องล่ม "
                "แต่จะขึ้นซ้ำใน Event Viewer หากสิทธิ์ DCOM ยังไม่ถูกต้อง"
            ),
            causes=[
                "แอปหรือบริการ Windows ไม่มีสิทธิ์ DCOM (Launch/Activation) สำหรับ CLSID/APPID ที่ระบุใน Event",
                "การอัปเดต Windows หรือซอฟต์แวร์เปลี่ยนการตั้งค่าความปลอดภัยของ COM",
                "บริการพื้นหลัง (เช่น ShellExperienceHost, Game Bar) เรียก COM โดยสิทธิ์ไม่เพียงพอ",
            ],
            steps=[
                "เปิด Event Viewer ดูรายละเอียด Event ให้ครบ โดยเฉพาะ CLSID และ APPID ที่แสดงในข้อความ",
                "กด Win + R พิมพ์ dcomcnfg แล้วกด Enter เพื่อเปิด Component Services",
                "ไปที่ Component Services → Computers → My Computer → DCOM Config",
                "หาแอปที่ตรงกับ CLSID/APPID ใน Event คลิกขวา → Properties → แท็บ Security",
                "ปรับ Launch และ Activation permissions ให้บัญชีที่เกี่ยวข้องมีสิทธิ์เพียงพอ (หรือปล่อยค่า Default หากไม่แน่ใจ)",
                "รีสตาร์ทเครื่อง แล้วตรวจสอบ Event Viewer อีกครั้งว่า Event 10016 ยังขึ้นซ้ำหรือไม่",
            ],
        ),
        "en": SolutionSummary(
            overview=(
                "Event ID 10016 from DistributedCOM means a program or Windows service tried to "
                "access a COM Server without the required Local Activation permission. "
                "It is common and usually does not crash the system, but may repeat in Event Viewer "
                "until DCOM permissions are corrected."
            ),
            causes=[
                "An app or Windows service lacks DCOM Launch/Activation rights for the CLSID/APPID in the event",
                "A Windows or software update changed COM security settings",
                "A background service calls COM without sufficient permissions",
            ],
            steps=[
                "Open Event Viewer and note the full details, especially CLSID and APPID in the message",
                "Press Win + R, type dcomcnfg, and press Enter to open Component Services",
                "Go to Component Services → Computers → My Computer → DCOM Config",
                "Find the app matching the CLSID/APPID, right-click → Properties → Security tab",
                "Adjust Launch and Activation permissions for the relevant account (or use Default if unsure)",
                "Restart the computer and check Event Viewer again for repeated 10016 events",
            ],
        ),
    },
    "41": {
        "th": SolutionSummary(
            overview=(
                "Event ID 41 (Kernel-Power) หมายถึงระบบรีสตาร์ทโดยไม่ปิดเครื่องอย่างถูกต้อง "
                "(unexpected shutdown) มักเกิดจากไฟดับ, กดรีเซ็ตค้าง, หรือขัดข้องของฮาร์ดแวร์/ไดรเวอร์"
            ),
            causes=[
                "ไฟฟ้าดับหรือสายไฟ/ปลั๊กไม่แน่น",
                "กดปุ่มรีเซ็ตค้าง หรือเครื่องค้างจนต้องบังคับปิด",
                "ไดรเวอร์, PSU, RAM หรือการอัปเดต Windows มีปัญหา",
            ],
            steps=[
                "ตรวจสอบว่าไฟฟ้าและสายไฟเสถียร ไม่มีการดับกะทันหัน",
                "ดู Event Viewer รอบเวลาเดียวกันว่ามี Event อื่น (เช่น 6008, 1001) หรือไม่",
                "อัปเดต Windows และไดรเวอร์ (โดยเฉพาะชิปเซ็ต, VGA, Storage)",
                "รัน memory diagnostic และตรวจสอบอุณหภูมิ/PSU หากเกิดซ้ำบ่อย",
            ],
        ),
        "en": SolutionSummary(
            overview=(
                "Event ID 41 (Kernel-Power) means the system rebooted without a clean shutdown. "
                "Common causes include power loss, forced reset, or hardware/driver issues."
            ),
            causes=[
                "Power loss or loose power cable",
                "Held reset button or forced shutdown after a freeze",
                "Driver, PSU, RAM, or Windows update problems",
            ],
            steps=[
                "Verify stable power supply and connections",
                "Check Event Viewer around the same time for related events (6008, 1001)",
                "Update Windows and drivers (chipset, GPU, storage)",
                "Run memory diagnostics and check thermals/PSU if it happens often",
            ],
        ),
    },
    "6008": {
        "th": SolutionSummary(
            overview=(
                "Event ID 6008 (EventLog) บันทึกว่าระบบปิดตัวลงโดยไม่ผ่านขั้นตอน Shut down ปกติ "
                "มักพบคู่กับ Kernel-Power 41 หลังไฟดับหรือบังคับปิดเครื่อง"
            ),
            causes=[
                "ไฟดับหรือถอดปลั๊กขณะเครื่องเปิดอยู่",
                "กดปิดเครื่องค้างหรือบังคับปิดจากปุ่มพาวเวอร์",
                "ระบบค้างจนต้องรีเซ็ตฮาร์ดแวร์",
            ],
            steps=[
                "ตรวจสอบแหล่งจ่ายไฟและ UPS หากมี",
                "ดู Event 41 และ 1001 ในช่วงเวลาเดียวกันเพื่อหาสาเหตุร่วม",
                "อัปเดตระบบและไดรเวอร์ จากนั้นสังเกตว่ายังเกิดซ้ำหรือไม่",
            ],
        ),
        "en": SolutionSummary(
            overview=(
                "Event ID 6008 (EventLog) records that the system shut down unexpectedly. "
                "It often appears with Kernel-Power 41 after power loss or a forced shutdown."
            ),
            causes=[
                "Power outage or unplugging while the PC is on",
                "Held power button or forced shutdown",
                "System freeze requiring a hardware reset",
            ],
            steps=[
                "Check power supply and UPS if available",
                "Review events 41 and 1001 at the same timestamp for related causes",
                "Update the system and drivers, then monitor for repeats",
            ],
        ),
    },
}


def get_curated_summary(event_id: str, language: str) -> SolutionSummary | None:
    if event_id not in EVENT_KNOWLEDGE:
        return None
    lang = language if language in ("th", "en") else "th"
    return EVENT_KNOWLEDGE[event_id].get(lang)
