"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Plus, UploadCloud, Code } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AnalysisResult } from "@/components/AnalysisResult";
import { AnalysisReport, AppSettings } from "@/lib/types";
import { analyzeLog } from "@/lib/api";
import { t } from "@/lib/i18n";

interface AnalyzeDialogProps {
  settings: AppSettings;
  onComplete: () => void;
}

export function AnalyzeDialog({ settings, onComplete }: AnalyzeDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [pastedImage, setPastedImage] = useState<File | null>(null);
  const [tab, setTab] = useState("text");
  const lang = settings.language;

  useEffect(() => {
    if (!open || report) return;

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            setPastedImage(file);
            setTab("image");
          }
          break;
        }
      }
    };

    window.addEventListener("paste", handlePaste as EventListener);
    return () => window.removeEventListener("paste", handlePaste as EventListener);
  }, [open, report]);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      const textVal = (document.getElementById("event-text") as HTMLTextAreaElement)?.value;
      const imageInput = document.getElementById("image-upload") as HTMLInputElement;
      const fileInput = document.getElementById("file-upload") as HTMLInputElement;

      if (textVal) formData.append("text", textVal);
      
      if (pastedImage) {
        formData.append("file", pastedImage);
      } else if (imageInput?.files?.[0]) {
        formData.append("file", imageInput.files[0]);
      } else if (fileInput?.files?.[0]) {
        formData.append("file", fileInput.files[0]);
      }

      const data = await analyzeLog(settings, formData);
      setReport(data);
      onComplete();
    } catch {
      alert(t(lang, "backendError"));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (value: boolean) => {
    setOpen(value);
    if (!value) {
      setReport(null);
      setPastedImage(null);
      setTab("text");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        className="bg-[#0078d4] hover:bg-[#006cbd] text-white flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={() => { setReport(null); setPastedImage(null); setTab("text"); }}
      >
        <Plus className="w-4 h-4" /> {t(lang, "analyzeNewLog")}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl bg-white dark:bg-gray-800 overflow-hidden max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-800 dark:text-gray-100">
            {t(lang, "submitEventLog")}
          </DialogTitle>
        </DialogHeader>

        {!report ? (
          <div className="mt-4 w-full">
            <Tabs value={tab} onValueChange={setTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4 bg-gray-100 dark:bg-gray-900">
                <TabsTrigger value="text">{t(lang, "tabText")}</TabsTrigger>
                <TabsTrigger value="image">{t(lang, "tabImage")}</TabsTrigger>
                <TabsTrigger value="file">{t(lang, "tabFile")}</TabsTrigger>
              </TabsList>
              <TabsContent value="text">
                <Textarea
                  id="event-text"
                  placeholder={t(lang, "pastePlaceholder")}
                  className="min-h-[200px] bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-600 w-full"
                />
              </TabsContent>
              <TabsContent value="image">
                {pastedImage ? (
                  <div className="relative border-2 border-dashed border-[#0078d4] rounded-lg p-4 flex flex-col items-center justify-center space-y-4">
                    <img src={URL.createObjectURL(pastedImage)} alt="Pasted" className="max-h-[200px] object-contain rounded-md" />
                    <div className="flex gap-2">
                       <Button variant="outline" size="sm" onClick={() => setPastedImage(null)}>
                         {t(lang, "clearImage") || "Clear Image"}
                       </Button>
                    </div>
                  </div>
                ) : (
                  <label htmlFor="image-upload" className="border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-lg p-10 flex flex-col items-center justify-center text-center space-y-2 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer block w-full">
                    <UploadCloud className="w-8 h-8 text-gray-400" />
                    <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">{t(lang, "uploadImage")}</p>
                    <p className="text-xs text-gray-400">{t(lang, "uploadImageHint") || "Or press Ctrl+V to paste"}</p>
                    <Input id="image-upload" type="file" accept="image/*" className="hidden" onChange={(e) => {
                      if (e.target.files?.[0]) setPastedImage(e.target.files[0]);
                    }} />
                  </label>
                )}
              </TabsContent>
              <TabsContent value="file">
                <label htmlFor="file-upload" className="border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-lg p-10 flex flex-col items-center justify-center text-center space-y-2 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer block w-full">
                  <Code className="w-8 h-8 text-gray-400" />
                  <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">{t(lang, "uploadFile")}</p>
                  <p className="text-xs text-gray-400">{t(lang, "uploadFileHint")}</p>
                  <Input id="file-upload" type="file" accept=".evtx,.xml" className="hidden" />
                </label>
              </TabsContent>
            </Tabs>
            <Button onClick={handleAnalyze} className="w-full bg-[#0078d4] hover:bg-[#006cbd]" disabled={loading}>
              {loading ? t(lang, "searching") : t(lang, "searchAnalyze")}
            </Button>
          </div>
        ) : (
          <AnalysisResult
            report={report}
            settings={settings}
            language={lang}
            onAnalyzeAnother={() => { setReport(null); setPastedImage(null); setTab("text"); }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

