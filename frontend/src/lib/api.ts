import { AnalysisReport, AppSettings, HistoryItem, StatsData } from "./types";

const TOKEN_KEY = "eventiq_token";

export function apiBase(settings: AppSettings) {
  let url = settings.apiUrl.replace(/\/$/, "");
  
  // Force HTTPS on production to avoid mixed content errors
  if (typeof window !== "undefined") {
    const isProduction = window.location.hostname !== 'localhost' && 
                         window.location.hostname !== '127.0.0.1';
    if (isProduction && url.startsWith('http://')) {
      url = url.replace('http://', 'https://');
    }
  }
  
  return url;
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getAuthUser(): { username: string; role: string } | null {
  const token = getAuthToken();
  if (!token) return null;
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));
    return { username: decoded.sub, role: decoded.role || "user" };
  } catch {
    return null;
  }
}

export function saveAuthToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken() {
  localStorage.removeItem(TOKEN_KEY);
}

function authHeaders(settings?: AppSettings): HeadersInit {
  const token = getAuthToken();
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (settings?.geminiApiKey) headers["X-Gemini-Api-Key"] = settings.geminiApiKey;
  return headers;
}

async function authFetch(input: RequestInfo | URL, init: RequestInit = {}, settings?: AppSettings) {
  const response = await fetch(input, {
    ...init,
    headers: {
      ...authHeaders(settings),
      ...init.headers,
    },
  });
  if (response.status === 401) clearAuthToken();
  return response;
}

export async function login(
  settings: AppSettings,
  username: string,
  password: string
): Promise<string> {
  const response = await fetch(`${apiBase(settings)}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!response.ok) throw new Error("Invalid username or password");
  const data = await response.json();
  saveAuthToken(data.access_token);
  return data.access_token;
}

export async function fetchHistory(settings: AppSettings): Promise<HistoryItem[]> {
  const response = await authFetch(`${apiBase(settings)}/api/v1/history/`, {}, settings);
  if (!response.ok) throw new Error("Failed to fetch history");
  return response.json();
}

export async function fetchStats(settings: AppSettings): Promise<StatsData> {
  const response = await authFetch(`${apiBase(settings)}/api/v1/stats/`, {}, settings);
  if (!response.ok) throw new Error("Failed to fetch stats");
  return response.json();
}

export async function deleteHistoryItem(settings: AppSettings, id: number) {
  const response = await authFetch(`${apiBase(settings)}/api/v1/history/${id}`, {
    method: "DELETE",
  }, settings);
  if (!response.ok) throw new Error("Failed to delete history");
}

export async function analyzeLog(
  settings: AppSettings,
  formData: FormData
): Promise<AnalysisReport> {
  formData.append("language", settings.language);
  const response = await authFetch(`${apiBase(settings)}/api/v1/analyze/`, {
    method: "POST",
    body: formData,
  }, settings);
  if (!response.ok) throw new Error("Analysis failed");
  return response.json();
}

export async function askFollowUp(
  settings: AppSettings,
  body: { question: string; eventId: string; provider: string; language: string }
): Promise<{ answer: string }> {
  const response = await authFetch(`${apiBase(settings)}/api/v1/analyze/followup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }, settings);
  if (!response.ok) throw new Error("Follow-up failed");
  return response.json();
}
export async function sendFeedback(
  settings: AppSettings,
  historyId: number,
  score: number,
  correctedSolution?: any
): Promise<void> {
  const response = await authFetch(`${apiBase(settings)}/api/v1/feedback/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      history_id: historyId,
      score,
      corrected_solution: correctedSolution,
    }),
  }, settings);
  if (!response.ok) throw new Error('Failed to send feedback');
  return response.json();
}

export async function exportToObsidian(
  settings: AppSettings,
  historyId: number
): Promise<{ status: string; filepath: string }> {
  const response = await authFetch(`${apiBase(settings)}/api/v1/obsidian/obsidian/export`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ history_id: historyId }),
  }, settings);
  if (!response.ok) throw new Error('Failed to export to Obsidian');
  return response.json();
}

export async function fetchUsers(settings: AppSettings): Promise<any[]> {
  const response = await authFetch(`${apiBase(settings)}/api/v1/admin/users`, {}, settings);
  if (!response.ok) throw new Error('Failed to fetch users');
  return response.json();
}

export async function createUser(settings: AppSettings, user: any): Promise<any> {
  const response = await authFetch(`${apiBase(settings)}/api/v1/admin/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  }, settings);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to create user');
  }
  return response.json();
}

export async function deleteUser(settings: AppSettings, userId: number): Promise<void> {
  const response = await authFetch(`${apiBase(settings)}/api/v1/admin/users/${userId}`, {
    method: 'DELETE',
  }, settings);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to delete user');
  }
}

export async function fetchLeaderboard(settings: AppSettings): Promise<any[]> {
  const response = await authFetch(`${apiBase(settings)}/api/v1/admin/leaderboard`, {}, settings);
  if (!response.ok) throw new Error('Failed to fetch leaderboard');
  return response.json();
}
