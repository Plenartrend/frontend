"use client";

import { Search, TrendingUp, TrendingDown, Minus, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, useMemo } from "react";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

export default function ExplorerTopicsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: topics, loading, loadingMore, hasMore, loadMoreRef, totalItems } = useInfiniteScroll<any>({
    fetchUrl: "/api/v1/topics",
    pageSize: 20,
  });

  const filteredTopics = useMemo(() => {
    if (!searchQuery.trim()) return topics;
    const q = searchQuery.toLowerCase();
    return topics.filter((t) => (t.title ?? "").toLowerCase().includes(q));
  }, [searchQuery, topics]);

  const sortedTopics = useMemo(() => {
    return [...filteredTopics].sort((a, b) => {
      const ra = a.relevance ?? 0;
      const rb = b.relevance ?? 0;
      return rb - ra;
    });
  }, [filteredTopics]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-3 w-3 mr-1" />;
      case "down":
        return <TrendingDown className="h-3 w-3 mr-1" />;
      default:
        return <Minus className="h-3 w-3 mr-1" />;
    }
  };

  // Relevance from backend is already 0–100
  const relevancePercent = (r: number | null | undefined) => {
    if (r == null) return 0;
    return Math.min(100, Math.round(r));
  };
  const relevanceDisplay = (r: number | null | undefined) => {
    const pct = relevancePercent(r);
    return `${pct}/100`;
  };

  // Sentiment from API is -1 to 1; multiply by 100 for -100 to +100 display
  const sentimentScore = (s: number | null | undefined) => {
    if (s == null) return 0;
    return Math.max(-100, Math.min(100, Math.round(s * 100)));
  };
  const sentimentDisplay = (s: number | null | undefined) => {
    const score = sentimentScore(s);
    return score > 0 ? `+${score}` : `${score}`;
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
          <h1 className="text-2xl font-bold text-slate-900">Themen</h1>
          <p className="text-sm text-slate-500">
            Aktuelle politische Debatten und ihre Relevanz.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <div className="relative flex-1 min-w-0">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-slate-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              className="block w-full rounded-md border-0 py-1.5 pl-10 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
              placeholder="Themen durchsuchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-slate-500">
        {searchQuery ? (
          <>{sortedTopics.length} von {totalItems} {totalItems === 1 ? 'Thema' : 'Themen'} gefunden</>
        ) : (
          <>{totalItems} {totalItems === 1 ? 'Thema' : 'Themen'} gefunden</>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sortedTopics.map((topic: any, index: number) => (
          <Link key={`${topic.id}-${index}`} href={`/topics/${topic.id}`} className="group">
            <div className="flex flex-col h-full overflow-hidden rounded-lg bg-white shadow transition-all duration-200 hover:shadow-lg hover:-translate-y-1 border border-slate-100 ring-1 ring-slate-200 hover:ring-blue-500/50">
              <div className="p-5 flex-1">
                <h3 className="text-lg font-semibold leading-6 text-slate-900 group-hover:text-blue-600 transition-colors">
                  {topic.title}
                </h3>
                <p className="mt-2 text-sm text-slate-500 line-clamp-2">
                  Analyse des aktuellen legislativen Diskurses zu {topic.title}.
                </p>
                <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
                </div>
              </div>
              <div className="bg-slate-50 px-5 py-2.5 border-t border-slate-100 group-hover:bg-blue-50/30 transition-colors">
                <div className="grid grid-cols-2 gap-4">
                  {/* Relevanz */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-500">Relevanz</span>
                      <span className="text-xs font-semibold text-slate-900">
                        {relevanceDisplay(topic.relevance)}
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-200">
                      <div
                        className="h-1.5 rounded-full bg-blue-500"
                        style={{ width: `${relevancePercent(topic.relevance)}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* Stimmung */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-500">Stimmung</span>
                      <span className="text-xs font-semibold text-slate-900">
                        {sentimentDisplay(topic.sentiment)}
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-200 relative overflow-hidden">
                      {sentimentScore(topic.sentiment) !== 0 ? (
                        <div
                          className={`absolute left-0 top-0 bottom-0 h-full rounded-full ${
                            sentimentScore(topic.sentiment) > 0 ? "bg-green-400" : "bg-red-400"
                          }`}
                          style={{
                            width: `${Math.abs(sentimentScore(topic.sentiment))}%`,
                          }}
                        />
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Infinite scroll trigger */}
      {hasMore && (
        <div ref={loadMoreRef} className="flex justify-center py-8">
          {loadingMore && <Loader2 className="h-8 w-8 animate-spin text-blue-600" />}
        </div>
      )}

      {!loading && !hasMore && sortedTopics.length > 0 && (
        <div className="text-center py-8 text-sm text-slate-500">
          Alle Themen geladen
        </div>
      )}
    </div>
  );
}
