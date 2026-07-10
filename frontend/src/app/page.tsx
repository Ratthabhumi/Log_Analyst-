"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Search, Plus, Trash2, FileText, Image as ImageIcon, Code, UploadCloud, Link as LinkIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function Dashboard() {
  const [isAnalyzeOpen, setIsAnalyzeOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    
    try {
      const formData = new FormData();
      
      // Determine what to send based on which input has data
      const textVal = (document.getElementById("event-text") as HTMLTextAreaElement)?.value;
      const imageInput = document.getElementById("image-upload") as HTMLInputElement;
      const fileInput = document.getElementById("file-upload") as HTMLInputElement;

      if (textVal) {
        formData.append("text", textVal);
      }
      
      if (imageInput && imageInput.files && imageInput.files.length > 0) {
        formData.append("file", imageInput.files[0]);
      } else if (fileInput && fileInput.files && fileInput.files.length > 0) {
        formData.append("file", fileInput.files[0]);
      }

      const response = await fetch("http://localhost:8000/api/v1/analyze", {
        method: "POST",
        body: formData,
      });
      
      if (response.ok) {
        const data = await response.json();
        setReport(data);
      } else {
        console.error("Analysis failed");
        alert("Failed to analyze. Check backend logs.");
      }
    } catch (error) {
      console.error(error);
      alert("Error connecting to backend");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7f6]">
      {/* Top Navbar */}
      <nav className="bg-[#0078d4] text-white px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2 font-semibold text-lg">
          <FileText className="w-5 h-5" />
          EventIQ
        </div>
        <div className="flex items-center gap-6 text-sm">
          <span className="font-medium">Dashboard</span>
          <div className="flex items-center gap-2">
            <span className="bg-white/20 p-1 rounded-full"><img src="https://ui-avatars.com/api/?name=Admin&background=random&color=fff" alt="admin" className="w-6 h-6 rounded-full" /></span>
            <span>admin</span>
          </div>
          <span className="cursor-pointer hover:text-blue-200">Logout</span>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6 space-y-6">
        
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-800">Analysis History</h1>
          <Dialog open={isAnalyzeOpen} onOpenChange={setIsAnalyzeOpen}>
            <DialogTrigger className="bg-[#0078d4] hover:bg-[#006cbd] text-white flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <Plus className="w-4 h-4" /> Analyze New Log
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] bg-white">
              <DialogHeader>
                <DialogTitle className="text-xl text-gray-800 font-semibold mb-2">Submit Event Log</DialogTitle>
              </DialogHeader>
              
              {!report ? (
                <div className="space-y-4">
                  <Tabs defaultValue="text" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-4 bg-gray-100">
                      <TabsTrigger value="text" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Paste Text</TabsTrigger>
                      <TabsTrigger value="image" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Image (OCR)</TabsTrigger>
                      <TabsTrigger value="file" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">EVTX / XML</TabsTrigger>
                    </TabsList>
                    <TabsContent value="text">
                      <Textarea 
                        id="event-text"
                        placeholder="Paste raw event text here..." 
                        className="min-h-[200px] bg-gray-50 border-gray-200 focus:border-[#0078d4] focus:ring-[#0078d4]"
                      />
                    </TabsContent>
                    <TabsContent value="image">
                      <label htmlFor="image-upload" className="border-2 border-dashed border-gray-200 rounded-lg p-10 flex flex-col items-center justify-center text-center space-y-2 hover:bg-gray-50 cursor-pointer block w-full">
                          <UploadCloud className="w-8 h-8 text-gray-400" />
                          <p className="text-sm text-gray-600 font-medium">Click to upload or drag and drop</p>
                          <p className="text-xs text-gray-400">PNG, JPG (max. 5MB)</p>
                          <Input id="image-upload" type="file" accept="image/*" className="hidden" />
                      </label>
                    </TabsContent>
                    <TabsContent value="file">
                      <label htmlFor="file-upload" className="border-2 border-dashed border-gray-200 rounded-lg p-10 flex flex-col items-center justify-center text-center space-y-2 hover:bg-gray-50 cursor-pointer block w-full">
                          <Code className="w-8 h-8 text-gray-400" />
                          <p className="text-sm text-gray-600 font-medium">Upload EVTX or XML file</p>
                          <p className="text-xs text-gray-400">.evtx, .xml supported</p>
                          <Input id="file-upload" type="file" accept=".evtx,.xml" className="hidden" />
                      </label>
                    </TabsContent>
                  </Tabs>
                  <Button onClick={handleAnalyze} className="w-full bg-[#0078d4] hover:bg-[#006cbd]" disabled={loading}>
                    {loading ? "Searching Solutions..." : "Search & Analyze"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                    <h3 className="font-semibold text-red-800">Event ID: {report.eventId} - {report.provider}</h3>
                    <p className="text-sm text-red-600 mt-1 line-clamp-2">{report.description}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <Search className="w-4 h-4 text-[#0078d4]" /> Top Solutions Found:
                    </h4>
                    <div className="space-y-3">
                      {report.searchResults.map((result: any, idx: number) => (
                        <a key={idx} href={result.link} target="_blank" rel="noreferrer" className="block p-3 rounded-md border border-gray-100 hover:border-[#0078d4] hover:bg-blue-50/50 transition-colors">
                          <div className="flex items-start gap-2">
                            <LinkIcon className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-blue-700">{result.title}</p>
                              <p className="text-xs text-gray-500 mt-1 truncate">{result.link}</p>
                            </div>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-4" onClick={() => setReport(null)}>
                    Analyze Another
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Logs Analyzed</p>
              <h2 className="text-3xl font-bold text-gray-800">12</h2>
            </div>
            <div className="bg-blue-50 p-3 rounded-full text-[#0078d4]">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500 mb-1">Critical Errors</p>
              <h2 className="text-3xl font-bold text-gray-800">4</h2>
            </div>
            <div className="bg-red-50 p-3 rounded-full text-red-500">
              <Trash2 className="w-5 h-5" />
            </div>
          </div>
          <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500 mb-1">Average Search Time</p>
              <h2 className="text-3xl font-bold text-gray-800">1.2<span className="text-lg font-medium text-gray-400 ml-1">sec</span></h2>
            </div>
            <div className="bg-green-50 p-3 rounded-full text-green-600">
              <Search className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* List Section */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <div className="relative w-full max-w-sm">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input placeholder="Search by Event ID or Provider..." className="pl-9 bg-gray-50 border-gray-200 focus-visible:ring-1 focus-visible:ring-[#0078d4]" />
            </div>
            <div className="text-sm text-gray-500 flex items-center gap-2">
              <span>Sort by:</span>
              <select className="bg-transparent font-medium text-gray-800 outline-none cursor-pointer">
                <option>Newest First</option>
                <option>Oldest First</option>
              </select>
            </div>
          </div>
          
          <div className="divide-y divide-gray-100">
            {/* Mock Item 1 */}
            <div className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
              <div>
                <h4 className="font-semibold text-[#0078d4]">Event ID 10016 - DistributedCOM</h4>
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                   <Code className="w-3.5 h-3.5" /> Parsed via Text Paste
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded font-medium">2026-07-10</span>
                <Trash2 className="w-4 h-4 text-red-400 hover:text-red-600 cursor-pointer" />
              </div>
            </div>
            {/* Mock Item 2 */}
            <div className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
              <div>
                <h4 className="font-semibold text-[#0078d4]">Event ID 41 - Kernel-Power</h4>
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                   <ImageIcon className="w-3.5 h-3.5" /> Parsed via OCR Image
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded font-medium">2026-07-09</span>
                <Trash2 className="w-4 h-4 text-red-400 hover:text-red-600 cursor-pointer" />
              </div>
            </div>
            {/* Mock Item 3 */}
            <div className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
              <div>
                <h4 className="font-semibold text-[#0078d4]">Event ID 6008 - EventLog</h4>
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                   <FileText className="w-3.5 h-3.5" /> Parsed via EVTX File
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded font-medium">2026-07-08</span>
                <Trash2 className="w-4 h-4 text-red-400 hover:text-red-600 cursor-pointer" />
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
