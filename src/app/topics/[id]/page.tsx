"use client";

import { TrendChart } from "@/components/ui/TrendChart";
import { ChevronRight, Share2, Mic, ExternalLink, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { WatchButton } from "@/components/ui/WatchButton";
import { BackButton } from "@/components/ui/BackButton";
import { useEffect, useState } from "react";

export default function TopicDetail() {
  const params = useParams();
  const id = params?.id as string;
  const [topicData, setTopicData] = useState<any>(null);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [positionData, setPositionData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [expandedSpeeches, setExpandedSpeeches] = useState<Set<string>>(new Set());
  const [timeRange, setTimeRange] = useState<string>('last_6_months');

  const timeRangeOptions = [
    { value: 'last_6_months', label: 'Letzte 6 Monate' },
    { value: 'ytd', label: 'Jahr bis heute' },
    { value: 'last_year', label: 'Letztes Jahr' },
    { value: 'last_2_years', label: 'Letzte 2 Jahre' },
    { value: 'last_5_years', label: 'Letzte 5 Jahre' },
    { value: 'max', label: 'Alle Daten' },
  ];

  const toggleSpeech = (speechId: string) => {
    setExpandedSpeeches(prev => {
      const newSet = new Set(prev);
      if (newSet.has(speechId)) {
        newSet.delete(speechId);
      } else {
        newSet.add(speechId);
      }
      return newSet;
    });
  };

  useEffect(() => {
    if (!id) return;
    
    // Fetch topic details and trend data in parallel
    Promise.all([
      fetch(`/api/v1/topics/${id}`).then(res => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      }),
      fetch(`/api/v1/analysis/time-series?time_range=${timeRange}&topic_id=${id}`).then(res => {
        if (!res.ok) throw new Error("Failed to fetch time-series");
        return res.json();
      })
    ])
    .then(([topic, timeSeries]) => {
      console.log('Topic data received:', topic);
      console.log('Time series received:', timeSeries);
      setTopicData(topic);
      
      // Process time-series data - data should already be oldest-to-newest from backend
      const relevanceSeries = (timeSeries.series || []).map((point: any) => ({
        date: point.period,
        value: (point.relevance || 0) * 100 // Scale 0-1 to 0-100
      }));
      
      const sentimentSeries = (timeSeries.series || []).map((point: any) => ({
        date: point.period,
        value: ((point.sentiment || 0) + 1) * 50 // Scale -1-1 to 0-100
      }));
      
      console.log('Relevance series:', relevanceSeries);
      console.log('Sentiment series:', sentimentSeries);
      
      setTrendData(relevanceSeries);
      setPositionData(sentimentSeries);
      setLoading(false);
    })
    .catch(() => {
      setError(true);
      setLoading(false);
    });
  }, [id, timeRange]); // Re-fetch when timeRange changes

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !topicData) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-slate-900">Thema nicht gefunden</h2>
        <p className="text-slate-500 mt-2">Das angeforderte Thema existiert nicht.</p>
        <div className="mt-6">
          <BackButton />
        </div>
      </div>
    );
  }

  const { speeches, partyPositions, stakeholders } = topicData;
  
  console.log('Speeches:', speeches);
  console.log('Party positions:', partyPositions);
  console.log('Stakeholders:', stakeholders);

  return (
    <div className="space-y-8">
      <nav className="flex items-center text-sm text-slate-500">
        <Link href="/explorer" className="hover:text-slate-700">Explorer</Link>
        <ChevronRight className="h-4 w-4 mx-1" />
        <span className="font-medium text-slate-900">{topicData.title}</span>
      </nav>

      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
              {topicData.category}
            </span>
            <span className={`text-sm font-medium ${topicData.trend === 'up' ? 'text-green-600' : 'text-slate-500'}`}>
              {topicData.trend === 'up' ? 'Starker Trend' : 'Stabiler Trend'}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">{topicData.title}</h1>
          <p className="mt-2 text-lg text-slate-600 max-w-3xl">
            Detaillierte Analyse der legislativen Aktivitäten und Stakeholder-Positionen zu {topicData.title}.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50">
            <Share2 className="h-4 w-4" />
            Teilen
          </button>
          <WatchButton id={id} type="topic" label="Thema folgen" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-900">Zeitliche Entwicklung</h2>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="text-sm border border-slate-300 rounded-md px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {timeRangeOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-lg bg-white p-6 shadow border border-slate-100">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Relevanz über Zeit</h3>
              <TrendChart data={trendData} yAxisLabel="Relevanz" interactive={false} />
            </div>
            <div className="rounded-lg bg-white p-6 shadow border border-slate-100">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Position über Zeit</h3>
               <TrendChart data={positionData} color="#10b981" yAxisLabel="Stimmung (Neg-Pos)" interactive={false} />
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow border border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Position & Relevanz nach Partei</h2>
            <div className="space-y-3">
              {partyPositions && partyPositions.length > 0 ? (
                partyPositions.map((p: any) => (
                  <div key={p.party} className="flex items-center gap-3 sm:gap-4" title={`${p.party}: Stimmung ${p.sentiment > 0 ? '+' : ''}${p.sentiment}, Relevanz ${p.relevance != null ? Math.round(p.relevance * 100) : 0}%`}>
                    <div className="w-12 sm:w-20 font-semibold text-slate-700 text-[11px] sm:text-xs truncate" title={p.party}>{p.party}</div>
                    <div className="flex-1 relative h-7 bg-slate-100 rounded-md overflow-hidden flex items-center">
                      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-300"></div>
                      <div 
                        className={`h-full opacity-80 ${p.sentiment > 0 ? 'bg-green-500' : 'bg-red-500'}`}
                        style={{ 
                          width: `${Math.abs(p.sentiment) / 2}%`,
                          marginLeft: p.sentiment > 0 ? '50%' : `calc(50% - ${Math.abs(p.sentiment) / 2}%)`
                        }}
                      ></div>
                       <div 
                        className="absolute h-2.5 w-2.5 rounded-full bg-slate-900 border-2 border-white"
                        style={{ left: `${(p.relevance ?? 0) * 100}%` }}
                      ></div>
                    </div>
                     <div className="hidden sm:block w-10 text-right text-[11px] text-slate-500">{p.sentiment > 0 ? '+' : ''}{p.sentiment}</div>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 text-sm">Keine Partei-Daten verfügbar.</p>
              )}
              <p className="text-xs text-slate-400 mt-2 text-center">Balken: Stimmung (Links=Negativ, Rechts=Positiv) • Punkt: Relevanz innerhalb der Partei</p>
            </div>
          </div>

           <div className="rounded-lg bg-white p-6 shadow border border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Mic className="h-5 w-5 text-slate-500" />
              Ausschnitte aus Reden
            </h2>
             {speeches.length > 0 ? (
              <ul className="space-y-4">
                {speeches.map((speech: any) => {
                  // Truncate to first 400 characters
                  const fullText = speech.text || '';
                  const isExpanded = expandedSpeeches.has(speech.id);
                  const truncatedText = fullText.length > 400 
                    ? fullText.substring(0, 400).trim() + '...' 
                    : fullText;
                  const isTruncated = fullText.length > 400;
                  
                  return (
                    <li key={speech.id} className="bg-slate-50 p-4 rounded-lg relative hover:bg-slate-100 transition-colors">
                      <p className="text-sm text-slate-700 italic">
                        "{isExpanded ? fullText : truncatedText}"
                      </p>
                      <div className="mt-2 flex items-center justify-between text-xs">
                         <span className="font-semibold text-slate-900">{speech.speaker} ({speech.party})</span>
                         <div className="flex items-center gap-2 text-slate-500">
                            <span>{new Date(speech.date).toLocaleDateString('de-DE')}</span>
                         </div>
                      </div>
                      {isTruncated && (
                        <button
                          onClick={() => toggleSpeech(speech.id)}
                          className="mt-2 text-xs text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {isExpanded ? 'Weniger anzeigen' : 'Vollständige Rede anzeigen'}
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-slate-500 text-sm">Keine relevanten Redebeiträge gefunden.</p>
            )}
          </div>

        </div>

        <div className="space-y-8">
          
          <div className="rounded-lg bg-white p-6 shadow border border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Kennzahlen</h2>
            <dl className="space-y-4">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <dt className="text-sm text-slate-500">Relevanz Score</dt>
                <dd className="font-semibold text-slate-900">{topicData.relevance != null ? Math.round(topicData.relevance * 100) : 0}/100</dd>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <dt className="text-sm text-slate-500">Stimmung</dt>
                <dd className="font-semibold text-slate-900">{topicData.sentiment != null ? Math.round(topicData.sentiment * 100) : 0}/100</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-lg bg-white p-6 shadow border border-slate-100">
             <h2 className="text-lg font-bold text-slate-900 mb-4">Wichtige Akteure</h2>
             
             <div className="mb-6">
                <h3 className="text-sm font-semibold text-green-700 mb-2 flex items-center"><span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>Besonders Dafür</h3>
                {stakeholders?.pro && stakeholders.pro.length > 0 ? (
                  <ul className="space-y-2">
                     {stakeholders.pro.map((p: any) => (
                       <li key={p.id} className="flex items-center gap-2 text-sm">
                         <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-xs">{p.name?.[0] || '?'}</div>
                         <Link href={`/politicians/${p.id}`} className="hover:underline hover:text-blue-600">{p.name} ({p.party})</Link>
                       </li>
                     ))}
                  </ul>
                ) : (
                  <p className="text-slate-500 text-sm">Keine Pro-Akteure verfügbar.</p>
                )}
             </div>

             <div>
                <h3 className="text-sm font-semibold text-red-700 mb-2 flex items-center"><span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>Besonders Dagegen</h3>
                {stakeholders?.contra && stakeholders.contra.length > 0 ? (
                  <ul className="space-y-2">
                     {stakeholders.contra.map((p: any) => (
                       <li key={p.id} className="flex items-center gap-2 text-sm">
                         <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-xs">{p.name?.[0] || '?'}</div>
                         <Link href={`/politicians/${p.id}`} className="hover:underline hover:text-blue-600">{p.name} ({p.party})</Link>
                       </li>
                     ))}
                  </ul>
                ) : (
                  <p className="text-slate-500 text-sm">Keine Contra-Akteure verfügbar.</p>
                )}
             </div>
          </div>
          
          <div className="rounded-lg bg-white p-6 shadow border border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Schlagwörter</h2>
            <div className="flex flex-wrap gap-2">
              {['Gesetzgebung', 'Haushalt', 'Reform', 'Opposition', 'Ausschuss', 'Abstimmung', 'Änderungsantrag', 'Anhörung', 'EU-Ebene', 'Bundesrat'].map((word, i) => (
                <span 
                  key={word} 
                  className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-sm hover:bg-slate-200 cursor-pointer"
                  style={{ fontSize: `${Math.max(0.8, 1.3 - i * 0.08)}rem`, opacity: Math.max(0.5, 1 - i * 0.08) }}
                >
                  {word}
                </span>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
