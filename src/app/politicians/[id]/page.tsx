"use client";

import { TrendChart } from "@/components/ui/TrendChart";
import { ChevronRight, Share2, Activity, Award, BarChart3, Users, Mic, Calendar, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { WatchButton } from "@/components/ui/WatchButton";
import { useEffect, useState } from "react";
import { BackButton } from "@/components/ui/BackButton";

export default function PoliticianDetail() {
  const params = useParams();
  const id = params?.id as string;
  const [politicianData, setPoliticianData] = useState<any>(null);
  const [similarPoliticians, setSimilarPoliticians] = useState<any[]>([]);
  const [allTopics, setAllTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const [polRes, allPolsRes, topicsRes] = await Promise.all([
          fetch(`/api/v1/politicians/${id}`),
          fetch('/api/v1/politicians'),
          fetch('/api/v1/topics')
        ]);

        if (!polRes.ok) throw new Error("Politician not found");

        const polData = await polRes.json();
        const allPols = await allPolsRes.json();
        const topics = await topicsRes.json();

        setPoliticianData(polData);
        setAllTopics(topics);

        if (polData.similar && polData.similar.length > 0) {
          setSimilarPoliticians(allPols.filter((p: any) => polData.similar.includes(p.id)));
        }
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !politicianData) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-slate-900">Abgeordneter nicht gefunden</h2>
        <div className="mt-6">
          <BackButton />
        </div>
      </div>
    );
  }

  const { speeches: politicianSpeeches, activityData, ...politician } = politicianData;

  return (
    <div className="space-y-8">
      <nav className="flex items-center text-sm text-slate-500">
        <Link href="/explorer" className="hover:text-slate-700">Explorer</Link>
        <ChevronRight className="h-4 w-4 mx-1" />
        <span className="font-medium text-slate-900">{politician.name}</span>
      </nav>

      <div className="bg-white rounded-xl shadow border border-slate-200 p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start relative">
        <div className="absolute top-6 right-6 flex gap-2 md:static md:top-auto md:right-auto">
          <button className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50">
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">Profil Teilen</span>
          </button>
          <WatchButton id={id} type="politician" label="Beobachten" />
        </div>

        <div className="flex-shrink-0">
          <div className="h-32 w-32 rounded-full bg-slate-200 flex items-center justify-center text-4xl font-bold text-slate-400 border-4 border-white shadow-sm">
             {politician.name.split(' ').map((n: string) => n[0]).join('')}
          </div>
        </div>
        <div className="flex-1 w-full">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div className="pr-24 md:pr-0">
               <h1 className="text-3xl font-bold text-slate-900">{politician.name}</h1>
               <div className="flex items-center gap-2 mt-2 text-lg text-slate-600">
                 <span className="font-semibold">{politician.party}</span>
                 <span>•</span>
                 <span>{politician.role} ({politician.region})</span>
               </div>
               <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-500">
                  <span>Alter: <strong className="text-slate-700">{politician.age}</strong></span>
                  <span>Geschlecht: <strong className="text-slate-700">{politician.gender}</strong></span>
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border border-slate-100 flex items-center gap-4">
           <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
             <Activity className="h-6 w-6" />
           </div>
           <div>
             <p className="text-sm text-slate-500 font-medium">Volatilität</p>
             <p className="text-2xl font-bold text-slate-900">{politician.volatility}</p>
           </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-slate-100 flex items-center gap-4">
           <div className="p-3 bg-green-50 rounded-lg text-green-600">
             <Award className="h-6 w-6" />
           </div>
           <div>
             <p className="text-sm text-slate-500 font-medium">Beitragsfaktor</p>
             <p className="text-2xl font-bold text-slate-900">{politician.contributionFactor}/10</p>
           </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-slate-100 flex items-center gap-4">
           <div className="p-3 bg-purple-50 rounded-lg text-purple-600">
             <BarChart3 className="h-6 w-6" />
           </div>
           <div>
             <p className="text-sm text-slate-500 font-medium">Reden (2025)</p>
             <p className="text-2xl font-bold text-slate-900">{politicianSpeeches.length || 14}</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-6 rounded-lg shadow border border-slate-100">
               <h2 className="text-lg font-bold text-slate-900 mb-6">Herzensthemen & Haltung</h2>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {politician.topTopics?.map((item: any, idx: number) => (
                    <div key={idx} className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition-colors cursor-pointer">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-slate-900">{item.topic}</h3>
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Top {idx + 1}</span>
                      </div>
                      <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600" style={{ width: `${90 - (idx * 20)}%` }}></div>
                      </div>
                      <div className="mt-2 flex justify-between items-center text-xs">
                         <span className="text-slate-500">Hohe Aktivität</span>
                         <span className={`font-semibold ${item.stance?.includes('dagegen') || item.stance?.includes('Kritisch') ? 'text-red-600' : 'text-green-600'}`}>
                           {item.stance}
                         </span>
                      </div>
                    </div>
                  ))}
                   {allTopics.slice(0, 2).map((t: any) => (
                      <div key={t.id} className="border border-slate-200 rounded-lg p-4 opacity-75">
                         <h3 className="font-medium text-slate-700">{t.title}</h3>
                         <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-slate-400" style={{ width: '30%' }}></div>
                         </div>
                      </div>
                   ))}
               </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border border-slate-100">
               <h2 className="text-lg font-bold text-slate-900 mb-4">Aktivitätstrend über Zeit</h2>
               <TrendChart data={activityData} yAxisLabel="Aktivitätsindex" />
               <p className="text-xs text-slate-400 mt-2 text-center">Kombinierte Metrik aus Reden, Anfragen und Abstimmungen.</p>
            </div>
         </div>

         <div className="space-y-8">
             <div className="bg-white p-6 rounded-lg shadow border border-slate-100">
               <h2 className="text-lg font-bold text-slate-900 mb-4">Wortcluster aus Reden</h2>
               <div className="flex flex-wrap gap-2 justify-center">
                  {['Zukunft', 'Verantwortung', 'Bürger', 'Europa', 'Innovation', 'Sicherheit', 'Wachstum', 'Klimaschutz', 'Zusammenhalt'].map((word, i) => (
                    <span 
                      key={word} 
                      className="px-2 py-1 text-slate-600 font-medium"
                      style={{ fontSize: `${Math.max(0.8, 1.4 - (Math.random() * 0.6))}rem`, color: i % 2 === 0 ? '#1e293b' : '#475569' }}
                    >
                      {word}
                    </span>
                  ))}
               </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border border-slate-100">
               <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                 <Mic className="h-5 w-5 text-slate-500" />
                 Kürzlichste Reden
               </h2>
               {politicianSpeeches.length > 0 ? (
                 <ul className="divide-y divide-slate-100">
                   {politicianSpeeches.map((speech: any) => (
                     <li key={speech.id} className="py-4 hover:bg-slate-50 -mx-4 px-4 transition-colors">
                       <Link href={`/speeches/${speech.id}`}>
                         <div className="flex justify-between items-start">
                           <div>
                             <h3 className="text-sm font-semibold text-slate-900 hover:text-blue-600 transition-colors line-clamp-2">{speech.title}</h3>
                             <p className="text-xs text-slate-500 mt-1">{speech.type}</p>
                           </div>
                           <span className="text-xs text-slate-400 flex items-center gap-1 whitespace-nowrap ml-2">
                             <Calendar className="h-3 w-3" />
                             {new Date(speech.date).toLocaleDateString('de-DE')}
                           </span>
                         </div>
                       </Link>
                     </li>
                   ))}
                 </ul>
               ) : (
                 <p className="text-sm text-slate-500">Keine aktuellen Reden gefunden.</p>
               )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow border border-slate-100">
               <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                 <Users className="h-5 w-5 text-slate-500" />
                 Ähnliche Abgeordnete
               </h2>
               <ul className="space-y-4">
                  {similarPoliticians.length > 0 ? similarPoliticians.map((sim: any) => (
                    <li key={sim.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-md transition-colors">
                       <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500">
                         {sim.name.split(' ').map((n: string) => n[0]).join('')}
                       </div>
                       <div className="flex-1">
                          <Link href={`/politicians/${sim.id}`} className="font-medium text-slate-900 hover:text-blue-600 block">{sim.name}</Link>
                          <p className="text-xs text-slate-500">{sim.party} • {sim.region}</p>
                       </div>
                       <div className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">95%</div>
                    </li>
                  )) : (
                    <p className="text-sm text-slate-500">Keine ähnlichen Profile gefunden.</p>
                  )}
               </ul>
            </div>
         </div>
      </div>
    </div>
  );
}
