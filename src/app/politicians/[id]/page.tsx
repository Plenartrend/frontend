"use client";

import { TrendChart } from "@/components/ui/TrendChart";
import { ChevronRight, Share2, Activity, Award, BarChart3, Users, Mic, Calendar, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { WatchButton } from "@/components/ui/WatchButton";
import { useEffect, useState, useRef } from "react";
import { BackButton } from "@/components/ui/BackButton";
import { useWatchlist } from "@/context/WatchlistContext";

// Format volatility: multiply by 100 and display as score/100
const formatVolatility = (volatility: string | null | undefined) => {
  if (!volatility) return 'N/A';
  const val = parseFloat(volatility) * 100;
  return `${Math.round(val)}/100`;
};

export default function PoliticianDetail() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params?.id as string;
  const { updateBookmarkStats, isPoliticianWatched } = useWatchlist();
  const [politicianData, setPoliticianData] = useState<any>(null);
  const [similarPoliticians, setSimilarPoliticians] = useState<any[]>([]);
  const [wordcloud, setWordcloud] = useState<Array<{ word: string; weight: number }>>([]);
  const [wordcloudLoading, setWordcloudLoading] = useState(true);
  const [activityData, setActivityData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSimilar, setLoadingSimilar] = useState(true);
  const [loadingActivity, setLoadingActivity] = useState(true);
  const [electionPeriods, setElectionPeriods] = useState<any[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<number | null>(null);
  const [loadingPeriods, setLoadingPeriods] = useState(true);
  const [timeRange, setTimeRange] = useState<string>('last_year');
  const [copied, setCopied] = useState(false);
    const hasUpdatedVisit = useRef(false);

    useEffect(() => {
        if (id && politicianData && !hasUpdatedVisit.current && isPoliticianWatched(id)) {
            updateBookmarkStats(id, 'politician', {
                name: politicianData.name,
                party: politicianData.party,
                volatility: politicianData.volatility,
                contributionFactor: politicianData.contributionFactor,
                numSpeeches: politicianData.numSpeeches || politicianData.speeches?.length || 0,
            });
            hasUpdatedVisit.current = true;
        }
    }, [id, politicianData, isPoliticianWatched, updateBookmarkStats]);

  const timeRangeOptions = [
    { value: 'last_6_months', label: 'Letzte 6 Monate' },
    { value: 'ytd', label: 'Jahr bis heute' },
    { value: 'last_year', label: 'Letztes Jahr' },
    { value: 'last_2_years', label: 'Letzte 2 Jahre' },
    { value: 'last_5_years', label: 'Letzte 5 Jahre' },
    { value: 'max', label: 'Alle Daten' },
  ];



  // Fetch election periods
  useEffect(() => {
    fetch('/api/v1/election-periods')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const filtered = data.filter(p => p.number > 0);
          setElectionPeriods(filtered);

          // Check for election_period in URL params
          const urlPeriod = searchParams.get('election_period');
          if (urlPeriod) {
            const periodNum = parseInt(urlPeriod);
            if (filtered.some(p => p.number === periodNum)) {
              setSelectedPeriod(periodNum);
            } else if (filtered.length > 0) {
              setSelectedPeriod(filtered[0].number);
            }
          } else if (filtered.length > 0) {
            setSelectedPeriod(filtered[0].number);
          }
        } else {
          setElectionPeriods([]);
        }
        setLoadingPeriods(false);
      })
      .catch(err => {
        console.error('Failed to fetch election periods', err);
        setElectionPeriods([]);
        setLoadingPeriods(false);
      });
  }, [searchParams]);

  useEffect(() => {
    if (!id || selectedPeriod === null) return;

    setLoading(true);
    setLoadingSimilar(true);

    const queryParams = new URLSearchParams();
    queryParams.set('election_period', selectedPeriod.toString());
    queryParams.set('time_range', timeRange);

    // Fetch main politician data
    fetch(`/api/v1/politicians/${id}?${queryParams.toString()}`)
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch politician');
        }
        return res.json();
      })
      .then(data => {
        setPoliticianData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch politician:', err);
        setLoading(false);
      });

    // Fetch similar politicians separately
    const similarParams = new URLSearchParams();
    similarParams.set('election_period', selectedPeriod.toString());

    fetch(`/api/v1/politicians/${id}/similar?${similarParams.toString()}`)
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        setSimilarPoliticians(data || []);
        setLoadingSimilar(false);
      })
      .catch(err => {
        console.error('Failed to fetch similar politicians:', err);
        setSimilarPoliticians([]);
        setLoadingSimilar(false);
      });
  }, [id, selectedPeriod]);

  // Separate effect for activity data that depends on timeRange
  useEffect(() => {
    if (!id || selectedPeriod === null) return;

    setLoadingActivity(true);

    const queryParams = new URLSearchParams();
    queryParams.set('election_period', selectedPeriod.toString());
    queryParams.set('time_range', timeRange);

    // Fetch activity data separately
    fetch(`/api/v1/politicians/${id}/activity?${queryParams.toString()}`)
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        setActivityData(data || []);
        setLoadingActivity(false);
      })
      .catch(err => {
        console.error('Failed to fetch activity data:', err);
        setActivityData([]);
        setLoadingActivity(false);
      });
  }, [id, selectedPeriod, timeRange]);

  // Fetch wordcloud data
  useEffect(() => {
    if (!id) return;

    setWordcloudLoading(true);
    fetch(`/api/v1/politicians/${id}/wordcloud`)
      .then(res => res.json())
      .then(data => {
        // Sort by weight descending (already sorted by backend, but ensure it)
        const sorted = Array.isArray(data)
          ? [...data].sort((a, b) => b.weight - a.weight)
          : [];
        setWordcloud(sorted);
        setWordcloudLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch wordcloud:', err);
        setWordcloud([]);
        setWordcloudLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!politicianData) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-slate-900">Abgeordneter nicht gefunden</h2>
        <p className="text-slate-500 mt-2">Dieser Abgeordnete existiert nicht.</p>
        <div className="mt-6">
          <BackButton />
        </div>
      </div>
    );
  }

  const { speeches: politicianSpeeches, ...politician } = politicianData;

  return (
    <div className="space-y-8">
      <nav className="flex items-center text-sm text-slate-500">
        <Link href="/explorer" className="hover:text-slate-700">Explorer</Link>
        <ChevronRight className="h-4 w-4 mx-1" />
        <span className="font-medium text-slate-900">{politician.name}</span>
      </nav>

      {/* Election Period Selector */}
      <div className="flex justify-start">
        <select
          id="period-select"
          value={selectedPeriod || ''}
          onChange={(e) => {
            const newPeriod = Number(e.target.value);
            setSelectedPeriod(newPeriod);
            // Update URL with new election period
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.set('election_period', newPeriod.toString());
            router.push(newUrl.pathname + newUrl.search);
          }}
          disabled={loadingPeriods}
          className="rounded-md border-0 py-2 px-3 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm bg-white shadow-sm"
        >
          {loadingPeriods ? (
            <option>Laden...</option>
          ) : (
            electionPeriods.map(period => (
              <option key={period.number} value={period.number}>
                {period.number}. Wahlperiode
              </option>
            ))
          )}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow border border-slate-200 p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center relative">
        <div className="hidden md:flex md:absolute md:top-6 md:right-6 flex-row gap-2">
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
          >
            <Share2 className="h-4 w-4" />
            <span>{copied ? 'Kopiert!' : 'Profil Teilen'}</span>
          </button>
          <WatchButton
            id={id}
            type="politician"
            label="Beobachten"
            politicianStats={politicianData ? {
              name: politicianData.name,
              party: politicianData.party,
              volatility: politicianData.volatility,
              contributionFactor: politicianData.contributionFactor,
              numSpeeches: politicianData.numSpeeches || politicianData.speeches?.length || 0,
            } : undefined}
          />
        </div>

        <div className="flex-shrink-0">
          <div className="h-32 w-32 rounded-full bg-slate-200 flex items-center justify-center text-4xl font-bold text-slate-400 border-4 border-white shadow-sm">
             {politician.name.split(',')[0].split(' ').map((n: string) => n[0]).join('')}
          </div>
        </div>
        <div className="flex-1 w-full flex flex-col justify-between">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div className="w-full md:pr-24">
               <div className="flex flex-wrap items-baseline gap-x-3 md:block">
                 <h1 className="text-3xl font-bold text-slate-900">{politician.name}</h1>
                 
                 <div className="contents md:flex md:items-center md:gap-2 md:mt-2 md:text-lg md:text-slate-600">
                   <span className="font-semibold text-lg text-slate-600">{politician.party}</span>
                   {politician.role && (
                     <>
                       <span className="hidden md:inline text-slate-600">•</span>
                       <span className="block w-full md:inline md:w-auto text-lg text-slate-600 mt-1 md:mt-0">
                         {politician.role}
                       </span>
                     </>
                   )}
                 </div>
               </div>
            </div>
          </div>
          
          <div className="flex md:hidden flex-row gap-2 justify-start mt-4">
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
            >
              <Share2 className="h-4 w-4" />
              <span>{copied ? 'Kopiert!' : 'Teilen'}</span>
            </button>
            <WatchButton
              id={id}
              type="politician"
              label="Beobachten"
              politicianStats={politicianData ? {
                name: politicianData.name,
                party: politicianData.party,
                volatility: politicianData.volatility,
                contributionFactor: politicianData.contributionFactor,
                numSpeeches: politicianData.numSpeeches || politicianData.speeches?.length || 0,
              } : undefined}
            />
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
             <p className="text-2xl font-bold text-slate-900">{formatVolatility(politician.volatility)}</p>
           </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-slate-100 flex items-center gap-4">
           <div className={`p-3 rounded-lg ${
             politician.contributionFactor === 'high' ? 'bg-green-50 text-green-600' :
             politician.contributionFactor === 'medium' ? 'bg-yellow-50 text-yellow-600' :
             'bg-red-50 text-red-600'
           }`}>
             <Award className="h-6 w-6" />
           </div>
           <div>
             <p className="text-sm text-slate-500 font-medium">Beitragsfaktor</p>
             <p className={`text-2xl font-bold ${
               politician.contributionFactor === 'high' ? 'text-green-600' :
               politician.contributionFactor === 'medium' ? 'text-yellow-600' :
               'text-red-600'
             }`}>
               {politician.contributionFactor === 'high' ? 'Hoch' : 
                politician.contributionFactor === 'medium' ? 'Mittel' : 
                'Niedrig'}
             </p>
           </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-slate-100 flex items-center gap-4">
           <div className="p-3 bg-purple-50 rounded-lg text-purple-600">
             <BarChart3 className="h-6 w-6" />
           </div>
           <div>
             <p className="text-sm text-slate-500 font-medium">Reden</p>
             <p className="text-2xl font-bold text-slate-900">{politician.numSpeeches || politicianSpeeches?.length || 0}</p>
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
                        {item.speechCount && (
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            {item.speechCount} {item.speechCount === 1 ? 'Rede' : 'Reden'}
                          </span>
                        )}
                      </div>
                      {item.sentiment !== undefined && item.sentiment !== null ? (
                        <>
                          <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${item.sentiment >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                              style={{ width: `${Math.abs(item.sentiment) * 100}%` }}
                            ></div>
                          </div>
                          <div className="mt-2 flex justify-between items-center text-xs">
                             <span className="text-slate-500">Sentiment</span>
                             <span className={`font-semibold ${item.sentiment >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                               {(item.sentiment * 100).toFixed(0)}
                             </span>
                          </div>
                        </>
                      ) : (
                        <div className="mt-3 text-xs text-slate-400">Keine Sentimentdaten verfügbar</div>
                      )}
                    </div>
                  ))}
               </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border border-slate-100">
               <div className="flex justify-between items-center mb-4">
                 <h2 className="text-lg font-bold text-slate-900">Aktivitätstrend über Zeit</h2>
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
               {loadingActivity ? (
                 <div className="flex justify-center items-center h-64">
                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                 </div>
               ) : (
                 <>
                   <TrendChart data={activityData} yAxisLabel="Aktivitätsindex" interactive={false} />
                   <p className="text-xs text-slate-400 mt-2 text-center">Kombinierte Metrik aus Reden, Anfragen und Abstimmungen.</p>
                 </>
               )}
            </div>

             {/* Speeches Section */}
             <div className="bg-white p-6 rounded-lg shadow border border-slate-100">
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Mic className="h-5 w-5 text-slate-500" />
                  Ausschnitte aus Reden
                </h2>
                {politicianSpeeches && politicianSpeeches.length > 0 ? (
                  <ul className="space-y-4">
                    {politicianSpeeches.map((speech: any) => {
                      const fullText = speech.text || '';
                      
                      return (
                        <li key={speech.id} className="bg-slate-50 p-4 rounded-lg relative hover:bg-slate-100 transition-colors">
                          <p className="text-sm text-slate-700 line-clamp-3">
                            "{fullText}"
                          </p>
                          <div className="mt-2 flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-900">{speech.speaker || politician.name}</span>
                            <div className="flex items-center gap-2 text-slate-500">
                              <span>{new Date(speech.date).toLocaleDateString('de-DE')}</span>
                            </div>
                          </div>
                          <Link
                            href={`/speeches/${speech.id}`}
                            className="mt-2 inline-block text-xs text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            Vollständigen Ausschnitt anzeigen
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500">Keine aktuellen Reden gefunden.</p>
                )}
             </div>
         </div>

         <div className="space-y-8">
             <div className="bg-white p-6 rounded-lg shadow border border-slate-100">
               <h2 className="text-lg font-bold text-slate-900 mb-1">Wordcloud</h2>
               <p className="text-sm text-slate-500 mb-4">Häufig in Reden vorkommende Begriffe</p>
               {wordcloudLoading ? (
                 <div className="flex justify-center py-4">
                   <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                 </div>
               ) : wordcloud.length > 0 ? (
                 <div className="flex flex-wrap gap-2 justify-center">
                   {wordcloud.map((item, i) => {
                     // Calculate font size based on weight (normalize to 0.8rem - 1.6rem range)
                     const maxWeight = wordcloud[0]?.weight || 1;
                     const minWeight = wordcloud[wordcloud.length - 1]?.weight || 0;
                     const weightRange = maxWeight - minWeight || 1;
                     const normalizedWeight = (item.weight - minWeight) / weightRange;
                     const fontSize = 0.8 + (normalizedWeight * 0.8); // 0.8rem to 1.6rem

                     return (
                       <span
                         key={`${item.word}-${i}`}
                         className="px-2 py-1 text-slate-700 font-semibold"
                         style={{
                           fontSize: `${fontSize}rem`,
                         }}
                         title={`Gewicht: ${item.weight.toFixed(4)}`}
                       >
                         {item.word}
                       </span>
                     );
                   })}
                 </div>
               ) : (
                 <p className="text-sm text-slate-500 text-center py-4">Keine Wortcluster-Daten verfügbar.</p>
               )}
            </div>


             <div className="bg-white p-6 rounded-lg shadow border border-slate-100">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Ähnliche Abgeordnete</h2>
                <p className="text-sm text-slate-500 mb-4">Abgeordnete mit ähnlicher Haltung zu den Herzensthemen</p>

               {loadingSimilar ? (
                 <div className="flex justify-center items-center h-24">
                   <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                 </div>
               ) : similarPoliticians.length > 0 ? (
                  <ul className="space-y-2">
                     {similarPoliticians.map((sim: any) => (
                       <li key={sim.id} className="flex items-center gap-2 text-sm">
                         <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-xs">{sim.name?.[0] || '?'}</div>
                         <Link href={`/politicians/${sim.id}?election_period=${selectedPeriod}`} className="hover:underline hover:text-blue-600">{sim.name} ({sim.party})</Link>
                       </li>
                     ))}
                  </ul>
               ) : (
                  <p className="text-slate-500 text-sm">Keine ähnlichen Profile gefunden.</p>
               )}
            </div>
         </div>
      </div>
    </div>
  );
}
