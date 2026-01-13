"use client";

import { TrendChart } from "@/components/ui/TrendChart";
import { ChevronRight, Share2, FileText, Mic, ExternalLink, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { WatchButton } from "@/components/ui/WatchButton";
import { BackButton } from "@/components/ui/BackButton";
import { useEffect, useState } from "react";

export default function TopicDetail() {
  const params = useParams();
  const id = params?.id as string;
  const [topicData, setTopicData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/v1/topics/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then(data => {
        setTopicData(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [id]);

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

  const { legislation, speeches, trendData, positionData, partyPositions, stakeholders } = topicData;

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
            Detaillierte Analyse der legislativen Aktivitäten, Medienerwähnungen und Stakeholder-Positionen zu {topicData.title}.
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-lg bg-white p-6 shadow border border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Relevanz über Zeit</h2>
              <TrendChart data={trendData} yAxisLabel="Erwähnungen" interactive={false} />
            </div>
            <div className="rounded-lg bg-white p-6 shadow border border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Position über Zeit</h2>
               <TrendChart data={positionData} color="#10b981" yAxisLabel="Stimmung (Neg-Pos)" interactive={false} />
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow border border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Position & Relevanz nach Partei</h2>
            <div className="space-y-4">
              {partyPositions.map((p: any) => (
                <div key={p.party} className="flex items-center gap-2 sm:gap-4" title={`Stimmung: ${p.sentiment}, Relevanz: ${p.relevance}%`}>
                  <div className="w-10 sm:w-16 font-semibold text-slate-700 text-xs sm:text-base truncate">{p.party}</div>
                  <div className="flex-1 relative h-8 bg-slate-100 rounded-md overflow-hidden flex items-center">
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-300"></div>
                    <div 
                      className={`h-full opacity-80 ${p.sentiment > 0 ? 'bg-green-500' : 'bg-red-500'}`}
                      style={{ 
                        width: `${Math.abs(p.sentiment)}%`, 
                        marginLeft: p.sentiment > 0 ? '50%' : `calc(50% - ${Math.abs(p.sentiment)}%)`
                      }}
                    ></div>
                     <div 
                      className="absolute h-3 w-3 rounded-full bg-slate-900 border-2 border-white"
                      style={{ left: `${p.relevance}%` }}
                    ></div>
                  </div>
                   <div className="hidden sm:block w-12 text-right text-xs text-slate-500">{p.sentiment > 0 ? '+' : ''}{p.sentiment}</div>
                </div>
              ))}
              <p className="text-xs text-slate-400 mt-2 text-center">Balken: Stimmung (Links=Negativ, Rechts=Positiv) • Punkt: Relevanz innerhalb der Partei</p>
            </div>
          </div>

           <div className="rounded-lg bg-white p-6 shadow border border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-slate-500" />
              Aktuelle Gesetzesinitiativen
            </h2>
            {legislation.length > 0 ? (
              <ul className="divide-y divide-slate-100">
                {legislation.map((leg: any) => (
                  <li key={leg.id} className="py-3">
                    <div className="flex justify-between items-start gap-4">
                       <p className="font-medium text-slate-900">{leg.title}</p>
                       <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap shrink-0 ${leg.status === 'Verabschiedet' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                         {leg.status}
                       </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{new Date(leg.date).toLocaleDateString('de-DE')}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500 text-sm">Keine aktuellen Initiativen gefunden.</p>
            )}
          </div>

           <div className="rounded-lg bg-white p-6 shadow border border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Mic className="h-5 w-5 text-slate-500" />
              Ausschnitte aus Reden
            </h2>
             {speeches.length > 0 ? (
              <ul className="space-y-4">
                {speeches.map((speech: any) => (
                  <li key={speech.id} className="bg-slate-50 p-4 rounded-lg relative hover:bg-slate-100 transition-colors">
                    <Link href={speech.fullSpeechId ? `/speeches/${speech.fullSpeechId}` : '#'}>
                      <p className="text-sm text-slate-700 italic">"{speech.text}"</p>
                      <div className="mt-2 flex items-center justify-between text-xs">
                         <span className="font-semibold text-slate-900">{speech.speaker} ({speech.party})</span>
                         <div className="flex items-center gap-2 text-slate-500">
                            <span>{new Date(speech.date).toLocaleDateString('de-DE')}</span>
                            {speech.fullSpeechId && <ExternalLink className="h-3 w-3" />}
                         </div>
                      </div>
                    </Link>
                  </li>
                ))}
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
                <dd className="font-semibold text-slate-900">{topicData.relevance}/100</dd>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <dt className="text-sm text-slate-500">Gesetzesvorhaben</dt>
                <dd className="font-semibold text-slate-900">{legislation.length} Aktiv</dd>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <dt className="text-sm text-slate-500">Medienerwähnungen</dt>
                <dd className="font-semibold text-slate-900">1.2k (7 Tage)</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-lg bg-white p-6 shadow border border-slate-100">
             <h2 className="text-lg font-bold text-slate-900 mb-4">Wichtige Akteure</h2>
             
             <div className="mb-6">
                <h3 className="text-sm font-semibold text-green-700 mb-2 flex items-center"><span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>Besonders Dafür</h3>
                <ul className="space-y-2">
                   {stakeholders.pro.map((p: any) => (
                     <li key={p.id} className="flex items-center gap-2 text-sm">
                       <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-xs">{p.name[0]}</div>
                       <Link href={`/politicians/${p.id}`} className="hover:underline hover:text-blue-600">{p.name} ({p.party})</Link>
                     </li>
                   ))}
                </ul>
             </div>

             <div>
                <h3 className="text-sm font-semibold text-red-700 mb-2 flex items-center"><span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>Besonders Dagegen</h3>
                <ul className="space-y-2">
                   {stakeholders.contra.map((p: any) => (
                     <li key={p.id} className="flex items-center gap-2 text-sm">
                       <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-xs">{p.name[0]}</div>
                       <Link href={`/politicians/${p.id}`} className="hover:underline hover:text-blue-600">{p.name} ({p.party})</Link>
                     </li>
                   ))}
                </ul>
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
