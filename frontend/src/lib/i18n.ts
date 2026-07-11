import { AppLanguage } from "./types";

const translations = {
  th: {
    // Navbar
    dashboard: "แดชบอร์ด",
    settings: "ตั้งค่า",
    logout: "ออกจากระบบ",

    // Settings
    settingsTitle: "ตั้งค่า",
    apiUrl: "API URL",
    language: "ภาษา",
    theme: "ธีม",
    themeLight: "สว่าง",
    themeDark: "มืด",
    save: "บันทึก",
    reset: "รีเซ็ต",

    // Login
    loginTitle: "เข้าสู่ระบบ EventIQ",
    loginSubtitle: "กรุณาเข้าสู่ระบบเพื่อใช้งาน",
    username: "ชื่อผู้ใช้",
    password: "รหัสผ่าน",
    signIn: "เข้าสู่ระบบ",
    invalidCredentials: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง",

    // Dashboard
    analysisHistory: "ประวัติการวิเคราะห์",
    analyzeNewLog: "วิเคราะห์ Log ใหม่",
    totalLogs: "จำนวน Log ที่วิเคราะห์",
    criticalErrors: "ข้อผิดพลาดร้ายแรง",
    avgSearchTime: "เวลาค้นหาเฉลี่ย",
    sec: "วินาที",

    // History
    searchPlaceholder: "ค้นหา Event ID หรือ Provider...",
    sortBy: "เรียงตาม:",
    sortNewest: "ใหม่ล่าสุด",
    sortOldest: "เก่าสุด",
    sortEventAsc: "Event ID (น้อย→มาก)",
    sortEventDesc: "Event ID (มาก→น้อย)",
    sortProvider: "Provider (A-Z)",
    noHistory: 'ไม่พบประวัติ กด "วิเคราะห์ Log ใหม่" เพื่อเริ่มต้น',
    eventId: "Event ID",
    critical: "ร้ายแรง",
    parsedViaText: "วิเคราะห์จากข้อความ",
    deleteConfirm: "ต้องการลบรายการนี้หรือไม่?",

    // Analyze dialog
    submitEventLog: "ส่ง Event Log",
    tabText: "ข้อความ",
    tabImage: "รูปภาพ",
    tabFile: "ไฟล์",
    pastePlaceholder: "วางข้อความ Event Log ที่นี่...",
    uploadImage: "คลิกเพื่ออัปโหลดหรือลากไฟล์มาวาง",
    uploadImageHint: "PNG, JPG (สูงสุด 5MB)",
    uploadFile: "อัปโหลดไฟล์ EVTX หรือ XML",
    uploadFileHint: "รองรับ .evtx, .xml",
    searchAnalyze: "ค้นหาและวิเคราะห์",
    searching: "กำลังค้นหาวิธีแก้ไข...",
    backendError: "เชื่อมต่อ Backend ไม่ได้ ตรวจสอบ API URL ในหน้าตั้งค่า",

    // Analysis result
    analysisResult: "ผลการวิเคราะห์",
    overview: "📋 สรุปปัญหา",
    causes: "🔍 สาเหตุที่เป็นไปได้",
    steps: "✅ วิธีแก้ไข (ทำตามลำดับ)",
    references: "ลิงก์อ้างอิงที่พบ:",
    official: "ทางการ",
    community: "ชุมชน",
    analyzeAnother: "วิเคราะห์อันใหม่",
    metadata: "ข้อมูล Event",
    level: "ระดับ",
    logName: "Log Name",
    timestamp: "เวลา",
    computer: "คอมพิวเตอร์",
    solutionSummary: "สรุปวิธีแก้ไข",
    followUpTitle: "ถามรายละเอียดเพิ่มเติม",
    followUpPlaceholder: "ถามคำถามเกี่ยวกับ Event นี้ เช่น จะหาเหตุผลหรือแก้ไขอย่างไร",
    followUpButton: "ถามเพิ่มเติม",
    followUpAnswer: "คำตอบ",
    followUpError: "เกิดข้อผิดพลาดในการขอคำตอบเพิ่มเติม",
    clearImage: "ลบรูปภาพ",
  },
  en: {
    dashboard: "Dashboard",
    settings: "Settings",
    logout: "Logout",
    settingsTitle: "Settings",
    apiUrl: "API URL",
    language: "Language",
    theme: "Theme",
    themeLight: "Light",
    themeDark: "Dark",
    save: "Save",
    reset: "Reset",
    loginTitle: "EventIQ Login",
    loginSubtitle: "Please sign in to continue",
    username: "Username",
    password: "Password",
    signIn: "Sign In",
    invalidCredentials: "Invalid username or password",
    analysisHistory: "Analysis History",
    analyzeNewLog: "Analyze New Log",
    totalLogs: "Total Logs Analyzed",
    criticalErrors: "Critical Errors",
    avgSearchTime: "Average Search Time",
    sec: "sec",
    searchPlaceholder: "Search by Event ID or Provider...",
    sortBy: "Sort by:",
    sortNewest: "Newest First",
    sortOldest: "Oldest First",
    sortEventAsc: "Event ID (A-Z)",
    sortEventDesc: "Event ID (Z-A)",
    sortProvider: "Provider (A-Z)",
    noHistory: 'No analysis history found. Click "Analyze New Log" to start.',
    eventId: "Event ID",
    critical: "Critical",
    parsedViaText: "Parsed via Text Paste",
    deleteConfirm: "Are you sure you want to delete this log?",
    submitEventLog: "Submit Event Log",
    tabText: "Text",
    tabImage: "Image",
    tabFile: "File",
    pastePlaceholder: "Paste raw event text here...",
    uploadImage: "Click to upload or drag and drop",
    uploadImageHint: "PNG, JPG (max. 5MB)",
    uploadFile: "Upload EVTX or XML file",
    uploadFileHint: ".evtx, .xml supported",
    searchAnalyze: "Search & Analyze",
    searching: "Searching Solutions...",
    backendError: "Error connecting to backend. Check API URL in Settings.",
    analysisResult: "Analysis Result",
    overview: "Overview",
    causes: "Possible causes",
    steps: "Recommended steps",
    references: "Top Solutions Found:",
    official: "Official",
    community: "Community",
    analyzeAnother: "Analyze Another",
    metadata: "Event Metadata",
    level: "Level",
    logName: "Log Name",
    timestamp: "Timestamp",
    computer: "Computer",
    solutionSummary: "Solution Summary",
    followUpTitle: "Ask a follow-up",
    followUpPlaceholder: "Ask a follow-up question about this Event",
    followUpButton: "Ask",
    followUpAnswer: "Answer",
    followUpError: "Unable to fetch follow-up answer",
    clearImage: "Clear Image",
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

export function t(lang: AppLanguage, key: TranslationKey): string {
  return translations[lang][key] ?? translations.en[key];
}

export type SortKey = "newest" | "oldest" | "eventAsc" | "eventDesc" | "provider";

export const SORT_KEYS: SortKey[] = ["newest", "oldest", "eventAsc", "eventDesc", "provider"];

export function sortLabel(lang: AppLanguage, key: SortKey): string {
  const map: Record<SortKey, TranslationKey> = {
    newest: "sortNewest",
    oldest: "sortOldest",
    eventAsc: "sortEventAsc",
    eventDesc: "sortEventDesc",
    provider: "sortProvider",
  };
  return t(lang, map[key]);
}

export function compareBySort(a: { eventId?: string; provider?: string; created_at: string }, b: typeof a, key: SortKey) {
  if (key === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  if (key === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  if (key === "eventAsc") return String(a.eventId || "").localeCompare(String(b.eventId || ""), undefined, { numeric: true });
  if (key === "eventDesc") return String(b.eventId || "").localeCompare(String(a.eventId || ""), undefined, { numeric: true });
  if (key === "provider") return String(a.provider || "").localeCompare(String(b.provider || ""));
  return 0;
}
