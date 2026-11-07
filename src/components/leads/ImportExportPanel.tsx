"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Download, Upload, Loader2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ImportExportPanel({ archived = false }: { archived?: boolean }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);

  // ── Export ───────────────────────────────────────────────────
  function handleExport() {
    const url = `/api/leads/export${archived ? "?archived=true" : ""}`;
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    toast.success("CSV download started");
  }

  // ── Import ───────────────────────────────────────────────────
  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".csv")) {
      toast.error("Please upload a .csv file");
      return;
    }

    setImporting(true);
    try {
      const form = new FormData();
      form.append("file", file);

      const res = await fetch("/api/leads/import", { method: "POST", body: form });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? "Import failed");

      toast.success(
        `Imported ${data.succeeded} lead${data.succeeded !== 1 ? "s" : ""}${data.failed > 0 ? ` (${data.failed} failed)` : ""}`
      );

      // Refresh page to show new leads
      window.location.reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Import failed");
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="flex items-center gap-2">
      {/* CSV Template hint */}
      <a
        href="/lead-import-template.csv"
        className="hidden sm:flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
        title="Download CSV template"
      >
        <FileText className="h-3.5 w-3.5" />
        Template
      </a>

      {/* Import */}
      <Button
        variant="outline"
        size="sm"
        disabled={importing}
        onClick={() => fileRef.current?.click()}
      >
        {importing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
        Import CSV
      </Button>
      <input
        ref={fileRef}
        type="file"
        accept=".csv"
        className="sr-only"
        onChange={handleImport}
      />

      {/* Export */}
      <Button variant="outline" size="sm" onClick={handleExport}>
        <Download className="h-4 w-4" />
        Export CSV
      </Button>
    </div>
  );
}
