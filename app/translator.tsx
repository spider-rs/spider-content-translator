"use client";

import { useState, useMemo, lazy, Suspense } from "react";
import SearchBar from "./searchbar";
import { Button } from "@/components/ui/button";

const MonacoEditor = lazy(() => import("@monaco-editor/react").then((m) => ({ default: m.default })));

function stripHTML(html: string): string {
  return html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export default function Translator() {
  const [data, setData] = useState<any[] | null>(null);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [rightFormat, setRightFormat] = useState<"text" | "markdown">("text");

  const pages = (data || []).filter((p: any) => p?.url);
  const current = pages[selectedIdx];

  const rightContent = useMemo(() => {
    if (!current?.content) return "";
    return rightFormat === "text" ? stripHTML(current.content) : current.content;
  }, [current, rightFormat]);

  const wordCount = rightContent.split(/\s+/).filter(Boolean).length;
  const charCount = rightContent.length;
  const readingTime = Math.ceil(wordCount / 200);

  const download = (content: string, ext: string) => {
    const blob = new Blob([content], { type: "text/plain" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `content.${ext}`; a.click();
  };

  return (
    <div className="flex flex-col h-screen">
      <SearchBar setDataValues={setData} />
      {pages.length > 0 && current ? (
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-2 border-b">
            {pages.length > 1 && (
              <select className="bg-background border rounded px-2 py-1 text-sm flex-1" value={selectedIdx} onChange={(e) => setSelectedIdx(Number(e.target.value))}>
                {pages.map((p: any, i: number) => <option key={i} value={i}>{p.url}</option>)}
              </select>
            )}
            <div className="flex gap-2">
              <Button size="sm" variant={rightFormat === "text" ? "default" : "outline"} onClick={() => setRightFormat("text")}>Text</Button>
              <Button size="sm" variant={rightFormat === "markdown" ? "default" : "outline"} onClick={() => setRightFormat("markdown")}>Raw</Button>
            </div>
            <div className="flex gap-3 text-xs text-muted-foreground">
              <span>{wordCount} words</span>
              <span>{charCount} chars</span>
              <span>{readingTime} min read</span>
            </div>
            <Button size="sm" variant="ghost" onClick={() => navigator.clipboard.writeText(rightContent)}>Copy</Button>
            <Button size="sm" variant="ghost" onClick={() => download(rightContent, rightFormat === "text" ? "txt" : "html")}>Download</Button>
          </div>
          <div className="flex flex-1 overflow-hidden">
            <div className="flex-1 border-r">
              <Suspense fallback={<div className="p-4 text-muted-foreground">Loading editor...</div>}>
                <MonacoEditor height="100%" language="html" value={current.content || ""} theme="vs-dark" options={{ readOnly: true, minimap: { enabled: false }, wordWrap: "on" }} />
              </Suspense>
            </div>
            <div className="flex-1">
              <Suspense fallback={<div className="p-4 text-muted-foreground">Loading editor...</div>}>
                <MonacoEditor height="100%" language={rightFormat === "text" ? "plaintext" : "html"} value={rightContent} theme="vs-dark" options={{ readOnly: true, minimap: { enabled: false }, wordWrap: "on" }} />
              </Suspense>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center flex-1 text-muted-foreground">Enter a URL to translate content between formats</div>
      )}
    </div>
  );
}
