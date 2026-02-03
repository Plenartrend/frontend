"use client";

import { Calendar, User, FileText, Loader2, Search, X, Filter } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { Speech, Topic } from "@/types";
import { formatPublisher, formatSession, formatSpeechTitle } from "@/lib/utils";

export default function ExplorerSpeechesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState("");
  const [topics, setTopics] = useState<Topic[]>([]);

  useEffect(() => {
    fetch('/api/v1/topics?page_size=1000')
      .then(res => res.json())
      .then((data: any) => {
        let loadedTopics: Topic[] = [];
        if (Array.isArray(data)) {
          loadedTopics = data;
        } else if (data.data && Array.isArray(data.data)) {
          loadedTopics = data.data;
        }
        
        // Sort topics alphabetically by title
        loadedTopics.sort((a, b) => a.title.localeCompare(b.title));
        setTopics(loadedTopics);
      })
      .catch(err => console.error('Failed to fetch topics', err));
  }, []);

  const { data: speeches, loading, loadingMore, hasMore, loadMoreRef } = useInfiniteScroll<Speech>({
    fetchUrl: selectedTopicId 
      ? `/api/v1/speeches?topic_id=${selectedTopicId}` 
      : "/api/v1/speeches",
    pageSize: 20,
  });

  const sortedSpeeches = speeches.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const filteredSpeeches = sortedSpeeches.filter(s => {
    const query = searchQuery.toLowerCase();
    const speakerName = `${s.speaker.firstName} ${s.speaker.lastName}`.toLowerCase();
    
    const matchesSearch = (
      s.title?.toLowerCase().includes(query) ||
      s.type?.toLowerCase().includes(query) ||
      s.session?.toLowerCase().includes(query) ||
      speakerName.includes(query)
    );

    return matchesSearch;
  });

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedTopicId("");
  };



  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reden</h1>
          <p className="text-sm text-slate-500">Durchsuchen Sie aktuelle Plenarreden und Debattenbeiträge.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center bg-white p-4 rounded-lg shadow-sm border border-slate-200">
           
           <div className="relative min-w-[200px]">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Filter className="h-4 w-4 text-slate-400" aria-hidden="true" />
            </div>
            <select
              className="block w-full rounded-md border-0 py-1.5 pl-10 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 appearance-none bg-none"
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(e.target.value)}
            >
              <option value="">Alle Themen</option>
              {topics.map(t => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
           </div>

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

          {(searchQuery || selectedTopicId) && (
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

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredSpeeches.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center col-span-full">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-50 text-slate-400 mb-4">
              <Search className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">Keine Reden gefunden</h3>
            <p className="text-slate-500 mt-1">
              Für die gewählten Filter konnten keine Ergebnisse gefunden werden.
            </p>
            <button 
              onClick={clearFilters}
              className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              Alle Filter zurücksetzen
            </button>
          </div>
        ) : (
          filteredSpeeches.map((speech, index) => {
            const showTopic = speech.topic && speech.topic.id !== '-1' && speech.topic.category !== '';
            const speakerName = `${speech.speaker.firstName} ${speech.speaker.lastName} (${speech.speaker.party})`;
            const publisher = formatPublisher(speech.publisher);
            const session = formatSession(speech.session);
            const displayTitle = formatSpeechTitle(
              speech.publisher,
              speech.title,
              speech.speaker.firstName,
              speech.speaker.lastName,
              speech.date,
              speech.topic?.id,
              speech.topic?.category
            );

            // Determine sentiment display
            let sentimentLabel = null;
            let sentimentColor = "";
            
            if (speech.sentiment && speech.sentiment !== "unbekannt") {
              if (speech.sentiment.includes("positiv")) {
                sentimentLabel = "Positiv";
                sentimentColor = "bg-green-100 text-green-700";
              } else if (speech.sentiment.includes("negativ")) {
                sentimentLabel = "Negativ";
                sentimentColor = "bg-red-100 text-red-700";
              } else if (speech.sentiment === "neutral") {
                sentimentLabel = "Neutral";
                sentimentColor = "bg-gray-100 text-gray-700";
              }
            }

            return (
              <Link key={`${speech.id}-${index}`} href={`/speeches/${speech.id}`} className="block group">
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:border-blue-300 hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-blue-600 font-medium mb-1 flex-wrap">
                        {publisher && (
                           <>
                             <span className="bg-blue-50 px-2 py-0.5 rounded text-[10px] uppercase tracking-wide">{publisher}</span>
                             <span className="text-slate-400">•</span>
                           </>
                        )}
                        <span className="text-slate-600 font-semibold">{speech.type}</span>
                        {session && (
                           <>
                             <span className="text-slate-400">•</span>
                             <span className="text-slate-500">{session}</span>
                           </>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors mt-1">
                        {displayTitle}
                      </h3>
                    </div>
                    <div className="flex items-center text-slate-400 text-xs gap-1 bg-slate-50 px-2 py-1 rounded shrink-0">
                      <Calendar className="h-3 w-3" />
                      {new Date(speech.date).toLocaleDateString('de-DE')}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600 border-t border-slate-100 pt-4">
                     <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-slate-400" />
                        <span className="font-medium text-slate-700">{speakerName}</span> 
                     </div>
                     {showTopic && (
                       <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-slate-400" />
                          <span>{speech.topic!.category}</span>
                       </div>
                     )}
                     {sentimentLabel && (
                        <div className="flex items-center gap-2">
                           <div className={`w-2 h-2 rounded-full ${
                             sentimentLabel === 'Positiv' ? 'bg-green-500' : 
                             sentimentLabel === 'Negativ' ? 'bg-red-500' : 'bg-gray-400'
                           }`} />
                           <span className="text-xs font-medium whitespace-nowrap">
                             {sentimentLabel === 'Positiv' ? 'Positive Meinung' : 
                              sentimentLabel === 'Negativ' ? 'Negative Meinung' : 'Neutrale Meinung'}
                           </span>
                        </div>
                     )}
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
      )}

      {/* Infinite scroll trigger */}
      {hasMore && !searchQuery && (
        <div ref={loadMoreRef} className="flex justify-center py-8">
          {loadingMore && <Loader2 className="h-8 w-8 animate-spin text-blue-600" />}
        </div>
      )}

      {!loading && !hasMore && filteredSpeeches.length > 0 && !searchQuery && (
        <div className="text-center py-8 text-sm text-slate-500">
          Alle Reden geladen
        </div>
      )}
    </div>
  );
}