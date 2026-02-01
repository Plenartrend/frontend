"use client";

import { useWatchlist } from "@/context/WatchlistContext";
import Link from "next/link";
import { FileText, User, Bell, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export default function WatchlistPage() {
  const { watchedTopics, watchedPoliticians } = useWatchlist();
  const [topics, setTopics] = useState<any[]>([]);
  const [politicians, setPoliticians] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [topicsRes, polsRes] = await Promise.all([
          fetch('/api/v1/topics'),
          fetch('/api/v1/politicians')
        ]);
        const allTopics = await topicsRes.json();
        const allPols = await polsRes.json();

        setTopics(allTopics.filter((t: any) => watchedTopics.includes(t.id)));
        setPoliticians(allPols.filter((p: any) => watchedPoliticians.includes(p.id)));
      } catch (error) {
        console.error("Failed to fetch watchlist data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [watchedTopics, watchedPoliticians]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (topics.length === 0 && politicians.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="bg-slate-100 p-4 rounded-full mb-4">
          <Bell className="h-8 w-8 text-slate-400" />
        </div>
        <h2 className="text-xl font-semibold text-slate-900">Merkliste ist leer</h2>
        <p className="mt-2 text-slate-500 max-w-sm">
          Beobachten Sie Themen und Abgeordnete, um hier schnellen Zugriff und relevante Updates zu erhalten.
        </p>
        <Link 
          href="/explorer"
          className="mt-6 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
        >
          Zum Explorer
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Merkliste</h1>
        <p className="text-sm text-slate-500">Ihre beobachteten Themen und Akteure im Überblick.</p>
        <div className="mt-2 flex items-center gap-2 text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-md border border-blue-100">
           <Bell className="h-3 w-3" />
           <span>Benachrichtigungen zu diesen Einträgen finden Sie im Bereich <Link href="/alerts" className="underline hover:text-blue-800">Benachrichtigungen</Link>.</span>
        </div>
      </div>

      {topics.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-slate-500" />
            Themen ({topics.length})
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {topics.map((topic) => (
              <Link key={topic.id} href={`/topics/${topic.id}`} className="block group">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 mb-2">
                        {topic.category}
                      </span>
                      <h3 className="font-medium text-slate-900 group-hover:text-blue-600">{topic.title}</h3>
                    </div>
                    <div className={cn("h-2 w-2 rounded-full", topic.trend === 'up' ? "bg-green-500" : topic.trend === 'down' ? "bg-red-500" : "bg-slate-300")} />
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
                    <span>Relevanz: {topic.relevance != null ? Math.round(topic.relevance * 100) : "–"}</span>
                    <span>{topic.trend === 'up' ? '↗ Steigend' : '↘ Fallend'}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {politicians.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-slate-500" />
            Abgeordnete ({politicians.length})
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {politicians.map((politician) => (
              <Link key={politician.id} href={`/politicians/${politician.id}`} className="block group">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                      {politician.name.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900 group-hover:text-blue-600">{politician.name}</h3>
                      <p className="text-xs text-slate-500">{politician.party} • {politician.region}</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                     <div>
                       <span className="text-slate-400 block">Beitrag</span>
                       <span className="font-medium text-slate-700">{politician.contributionFactor}</span>
                     </div>
                     <div className="text-right">
                       <span className="text-slate-400 block">Volatilität</span>
                       <span className="font-medium text-slate-700">{politician.volatility}</span>
                     </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}