"use client";

import { Mic, Calendar, User, FileText, Loader2, Search, X } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function ExplorerSpeechesPage() {
  const [speeches, setSpeeches] = useState<any[]>([]);
  const [politicians, setPoliticians] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    Promise.all([
      fetch('/api/v1/speeches').then(res => res.json()),
      fetch('/api/v1/politicians').then(res => res.json())
    ]).then(([speechesData, polsData]) => {
        const sorted = speechesData.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setSpeeches(sorted);
        setPoliticians(polsData);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch data", err);
        setLoading(false);
      });
  }, []);

  const getSpeakerName = (id: string) => {
    const p = politicians.find(p => p.id === id);
    return p ? `${p.name} (${p.party})` : 'Unbekannt';
  };

  const filteredSpeeches = speeches.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.session.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getSpeakerName(s.speakerId).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const clearFilters = () => {
    setSearchQuery("");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reden</h1>
          <p className="text-sm text-slate-500">Durchsuchen Sie aktuelle Plenarreden und Debattenbeiträge.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center bg-white p-4 rounded-lg shadow-sm border border-slate-200">
           <div className="relative flex-1 min-w-0">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-slate-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              className="block w-full rounded-md border-0 py-1.5 pl-10 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
              placeholder="Reden durchsuchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {/* Fixed width for results count */}
          <div className="w-full sm:w-auto px-2 text-sm text-slate-500 italic whitespace-nowrap shrink-0 text-right">
             {filteredSpeeches.length} Ergebnisse
          </div>

          {searchQuery && (
             <button 
                onClick={clearFilters}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
             >
               <X className="h-4 w-4" />
               Reset
             </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredSpeeches.map((speech) => (
          <Link key={speech.id} href={`/speeches/${speech.id}`} className="block group">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:border-blue-300 hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 text-xs text-blue-600 font-medium mb-1">
                    <span className="bg-blue-50 px-2 py-0.5 rounded text-[10px] uppercase tracking-wide">{speech.type}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-500">{speech.session}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {speech.title}
                  </h3>
                </div>
                <div className="flex items-center text-slate-400 text-xs gap-1 bg-slate-50 px-2 py-1 rounded">
                  <Calendar className="h-3 w-3" />
                  {new Date(speech.date).toLocaleDateString('de-DE')}
                </div>
              </div>
              
              <div className="flex items-center gap-6 text-sm text-slate-600 border-t border-slate-100 pt-4">
                 <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-slate-400" />
                    <span className="font-medium text-slate-700">{getSpeakerName(speech.speakerId)}</span> 
                 </div>
                 <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-slate-400" />
                    <span>Dauer: {speech.duration}</span>
                 </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}