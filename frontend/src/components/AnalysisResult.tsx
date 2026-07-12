"use client";

import { Button } from "@/components/ui/button";
import { Download, Search, Link as LinkIcon } from "lucide-react";
import { AnalysisReport, AppLanguage, AppSettings } from "@/lib/types";
import { FollowUpDialog } from "@/components/FollowUpDialog";
import { t } from "@/lib/i18n";

interface AnalysisResultProps {
  report: AnalysisReport;
  settings: AppSettings;
  language: AppLanguage;
  onAnalyzeAnother: () => void;
}

function markdownLine(label: string, value?: string) {
  return value ? `- ${label}: ${value}` : "";
}

function buildMarkdown(report: AnalysisReport) {
  const meta = report.eventMetadata;
  const lines = [
    `# EventIQ Analysis Report`,
    "",
    `## Event`,
    markdownLine("Event ID", report.eventId),
    markdownLine("Provider", report.provider),
    markdownLine("Level", meta?.level),
    markdownLine("Log Name", meta?.logName),
    markdownLine("Timestamp", meta?.timestamp),
    markdownLine("Computer", meta?.computer),
    "",
    `## Source`,
    report.description || "No source description.",
    "",
  ].filter((line) => line !== "");

  if (report.solutionSummary) {
    lines.push("## Overview", report.solutionSummary.overview || "No overview.", "");

    if (report.solutionSummary.causes?.length) {
      lines.push("## Possible Causes");
      report.solutionSummary.causes.forEach((cause, idx) => lines.push(`${idx + 1}. ${cause}`));
      lines.push("");
    }

    if (report.solutionSummary.steps?.length) {
      lines.push("## Recommended Steps");
      report.solutionSummary.steps.forEach((step, idx) => lines.push(`${idx + 1}. ${step}`));
      lines.push("");
    }
  } else if (report.aiSummary) {
    lines.push("## Solution Summary", report.aiSummary, "");
  }

  if (report.searchResults?.length) {
    lines.push("## References");
    report.searchResults.forEach((result) => {
      lines.push(`- [${result.title}](${result.link})`);
      if (result.snippet) lines.push(`  ${result.snippet}`);
    });
    lines.push("");
  }

  return `${lines.join("\n")}\n`;
}

function downloadMarkdown(report: AnalysisReport) {
  const markdown = buildMarkdown(report);
  const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  const eventId = report.eventId || "unknown";
  anchor.href = url;
  anchor.download = `eventiq-${eventId}-${Date.now()}.md`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function downloadJSON(report: AnalysisReport) {
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  const eventId = report.eventId || "unknown";
  anchor.href = url;
  anchor.download = `eventiq-${eventId}-${Date.now()}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function AnalysisResult({ report, settings, language, onAnalyzeAnother }: AnalysisResultProps) {
  const meta = report.eventMetadata;

  return (
    <div className="space-y-4 w-full min-w-0">
      <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-[#0078d4] p-4 rounded-md break-words w-full">
        <h3 className="font-semibold text-blue-800 dark:text-blue-200 break-words">
          {t(language, "eventId")}: {report.eventId} - {report.provider}
        </h3>
        <p className="text-sm text-blue-600 dark:text-blue-300 mt-1 line-clamp-2 break-words">{report.description}</p>
      </div>

      {meta && (meta.level || meta.logName || meta.timestamp || meta.computer) && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-4 rounded-md grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <h4 className="font-semibold text-gray-800 dark:text-gray-200 col-span-full">{t(language, "metadata")}</h4>
          {meta.level && (
            <div>
              <span className="text-gray-500 dark:text-gray-400">{t(language, "level")}: </span>
              <span className="font-medium text-gray-800 dark:text-gray-200">{meta.level}</span>
            </div>
          )}
          {meta.logName && (
            <div>
              <span className="text-gray-500 dark:text-gray-400">{t(language, "logName")}: </span>
              <span className="font-medium text-gray-800 dark:text-gray-200">{meta.logName}</span>
            </div>
          )}
          {meta.timestamp && (
            <div>
              <span className="text-gray-500 dark:text-gray-400">{t(language, "timestamp")}: </span>
              <span className="font-medium text-gray-800 dark:text-gray-200">{meta.timestamp}</span>
            </div>
          )}
          {meta.computer && (
            <div>
              <span className="text-gray-500 dark:text-gray-400">{t(language, "computer")}: </span>
              <span className="font-medium text-gray-800 dark:text-gray-200">{meta.computer}</span>
            </div>
          )}
        </div>
      )}

      {report.solutionSummary ? (
        <div className="space-y-4 w-full">
          <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-4 rounded-md w-full">
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">{t(language, "overview")}</h4>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{report.solutionSummary.overview}</p>
          </div>

          {report.solutionSummary.causes?.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 p-4 rounded-md w-full">
              <h4 className="font-semibold text-amber-900 dark:text-amber-200 mb-2">{t(language, "causes")}</h4>
              <ol className="list-decimal list-inside space-y-1.5 text-sm text-amber-900/90 dark:text-amber-100">
                {report.solutionSummary.causes.map((cause, idx) => (
                  <li key={idx} className="leading-relaxed">{cause}</li>
                ))}
              </ol>
            </div>
          )}

          {report.solutionSummary.steps?.length > 0 && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 p-4 rounded-md w-full">
              <h4 className="font-semibold text-green-900 dark:text-green-200 mb-2">{t(language, "steps")}</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-green-900/90 dark:text-green-100">
                {report.solutionSummary.steps.map((step, idx) => (
                  <li key={idx} className="leading-relaxed">{step}</li>
                ))}
              </ol>
            </div>
          )}
        </div>
      ) : report.aiSummary ? (
        <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-4 rounded-md w-full">
          <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">{t(language, "solutionSummary")}</h4>
          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{report.aiSummary}</p>
        </div>
      ) : null}

      <div className="w-full min-w-0">
        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
          <Search className="w-4 h-4 text-[#0078d4]" /> {t(language, "references")}
        </h4>
        <div className="space-y-3 w-full min-w-0">
          {report.searchResults?.map((result, idx) => (
            <a
              key={idx}
              href={result.link}
              target="_blank"
              rel="noreferrer"
              className="block p-3 rounded-md border border-gray-100 dark:border-gray-700 hover:border-[#0078d4] hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors w-full min-w-0"
            >
              <div className="flex items-start gap-2 w-full min-w-0">
                <LinkIcon className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-blue-700 dark:text-blue-300 truncate">{result.title}</p>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded shrink-0 ${
                        result.sourceType === "official"
                          ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                      }`}
                    >
                      {result.sourceType === "official" ? t(language, "official") : t(language, "community")}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">{result.link}</p>
                  {result.snippet && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">{result.snippet}</p>
                  )}
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>

      {report.solutionSummary && (
        <FollowUpDialog
          settings={settings}
          report={{
            eventId: report.eventId,
            provider: report.provider,
            solutionSummary: report.solutionSummary,
            searchResults: report.searchResults?.map((result) => ({ title: result.title, link: result.link })) || [],
          }}
        />
      )}

      <div className="flex flex-wrap gap-2 mt-4 print:hidden">
        <Button variant="outline" className="flex-1 min-w-[120px]" onClick={() => downloadMarkdown(report)}>
          <Download className="w-4 h-4 mr-2" />
          Export MD
        </Button>
        <Button variant="outline" className="flex-1 min-w-[120px]" onClick={() => downloadJSON(report)}>
          <Download className="w-4 h-4 mr-2" />
          Export JSON
        </Button>
        <Button variant="outline" className="flex-1 min-w-[120px]" onClick={() => window.print()}>
          <Download className="w-4 h-4 mr-2" />
          Export PDF
        </Button>
        <Button variant="outline" className="w-full mt-2" onClick={onAnalyzeAnother}>
          {t(language, "analyzeAnother")}
        </Button>
      </div>
    </div>
  );
}
