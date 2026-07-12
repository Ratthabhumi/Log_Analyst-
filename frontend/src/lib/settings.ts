import { AppSettings } from "./types";

const STORAGE_KEY = "eventiq_settings";

function normalizeApiUrl(url: string) {
  const trimmed = url.trim();
  // Hardcode the Render URL as the absolute default, ignoring old Vercel env vars
  if (!trimmed) return "https://log-analyst-backend.onrender.com";

  const withProtocol = /^(https?:\/\/)/i.test(trimmed) ? trimmed : `https://${trimmed}`;
  const cleanUrl = withProtocol.replace(/\/$/, "");
  
  // Force HTTPS on production
  if (typeof window !== "undefined") {
    const isProduction = window.location.hostname !== 'localhost' && 
                         window.location.hostname !== '127.0.0.1';
    if (isProduction && cleanUrl.startsWith('http://')) {
      return cleanUrl.replace('http://', 'https://');
    }
  }
  
  return cleanUrl;
}

export const DEFAULT_SETTINGS: AppSettings = {
  apiUrl: normalizeApiUrl("https://log-analyst-backend.onrender.com"),
  language: "th",
  theme: "light",
};

export function loadSettings(): AppSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const saved = JSON.parse(raw);
    
    // Clear old HTTP settings on production to avoid mixed content errors
    const isProduction = window.location.hostname !== 'localhost' && 
                         window.location.hostname !== '127.0.0.1';
    if (isProduction && saved.apiUrl && saved.apiUrl.startsWith('http://')) {
      localStorage.removeItem(STORAGE_KEY);
      return DEFAULT_SETTINGS;
    }
    
    // Automatically migrate old fly.dev URLs to Render
    if (saved.apiUrl && saved.apiUrl.includes('fly.dev')) {
      saved.apiUrl = "https://log-analyst-backend.onrender.com";
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    }
    
    const apiUrl = normalizeApiUrl(saved.apiUrl || DEFAULT_SETTINGS.apiUrl);
    
    return {
      ...DEFAULT_SETTINGS,
      ...saved,
      apiUrl: apiUrl,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): AppSettings {
  const normalized = { ...settings, apiUrl: normalizeApiUrl(settings.apiUrl) };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  applyTheme(normalized.theme);
  return normalized;
}

export function applyTheme(theme: AppSettings["theme"]) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
}
