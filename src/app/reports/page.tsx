"use client";

import { FileText, Download, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Report } from "@/types";

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/reports')
      .then(res => res.json())
      .then(data => {
        setReports(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch reports", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Berichte</h1>
          <p className="text-sm text-slate-500">Greifen Sie auf generierte Berichte und Analyse-Exporte zu.</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500">
           Neuen Bericht generieren
        </button>
      </div>

      <div className="bg-white shadow sm:rounded-md border border-slate-200">
        <ul role="list" className="divide-y divide-slate-200">
          {reports.map((report) => (
            <li key={report.id} className="px-4 py-4 sm:px-6 hover:bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 h-10 w-10 rounded bg-blue-50 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{report.name}</p>
                  <p className="text-xs text-slate-500">Generiert am {report.date} • {report.size}</p>
                </div>
              </div>
              <button className="text-slate-400 hover:text-blue-600">
                <Download className="h-5 w-5" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}