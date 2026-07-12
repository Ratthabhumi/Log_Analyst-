export interface EventMetadata {
  eventId: string;
  provider: string;
  level: string;
  logName: string;
  timestamp: string;
  computer: string;
  isCritical: boolean;
}

export interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  sourceType?: "official" | "community";
}

export interface SolutionSummary {
  overview: string;
  causes: string[];
  steps: string[];
}

export interface AnalysisReport {
  eventId: string;
  provider: string;
  description: string;
  eventMetadata?: EventMetadata;
  aiSummary?: string;
  solutionSummary?: SolutionSummary;
  searchResults?: SearchResult[];
  historyId?: number;
}

export interface HistoryItem extends AnalysisReport {
  id: number;
  parseMethod?: string;
  searchTimeMs?: number;
  created_at: string;
}

export interface StatsData {
  totalLogs: number;
  criticalErrors: number;
  avgSearchTimeSec: number;
}

export type AppLanguage = "th" | "en";
export type AppTheme = "light" | "dark";

export interface AppSettings {
  apiUrl: string;
  language: AppLanguage;
  theme: AppTheme;
  geminiApiKey?: string;
}
