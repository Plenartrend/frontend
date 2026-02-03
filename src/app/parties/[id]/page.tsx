"use client";

import { TrendChart } from "@/components/ui/TrendChart";
import { ChevronRight, Share2, Activity, Users, Mic, Calendar, Loader2, BarChart3, FileText } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { BackButton } from "@/components/ui/BackButton";

// Format volatility: multiply by 100 and display as score/100
const formatVolatility = (volatility: string | null | undefined) => {
  if (!volatility) return 'N/A';
  const val = parseFloat(volatility) * 100;
  return `${Math.round(val)}/100`;
};

export default function PartyDetail() {
  const params = useParams();
  const id = params?.id as string;
  const [partyData, setPartyData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [electionPeriods, setElectionPeriods] = useState<any[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<number | null>(null);
  const [loadingPeriods, setLoadingPeriods] = useState(true);
  const [timeRange, setTimeRange] = useState<string>('last_year');

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
          if (filtered.length > 0) {
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
  }, []);

  useEffect(() => {
    if (!id || selectedPeriod === null) return;

    setLoading(true);
    
    const queryParams = new URLSearchParams();
    queryParams.set('election_period', selectedPeriod.toString());
    queryParams.set('time_range', timeRange);
    
    fetch(`/api/v1/parties/${id}?${queryParams.toString()}`)
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch party');
        }
        return res.json();
      })
      .then(data => {
        setPartyData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch party:', err);
        setLoading(false);
      });
  }, [id, selectedPeriod, timeRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!partyData) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-slate-900">Partei nicht gefunden</h2>
        <p className="text-slate-500 mt-2">Die angeforderte Partei konnte nicht geladen werden.</p>
        <div className="mt-6">
          <BackButton />
        </div>
      </div>
    );
  }

  const { recentSpeeches, printedPapers, activityData, members, ...party } = partyData;

  return (
    <div className="space-y-8">
      <nav className="flex items-center text-sm text-slate-500">
        <Link href="/explorer" className="hover:text-slate-700">Explorer</Link>
        <ChevronRight className="h-4 w-4 mx-1" />
        <Link href="/explorer/parties" className="hover:text-slate-700">Parteien</Link>
        <ChevronRight className="h-4 w-4 mx-1" />
        <span className="font-medium text-slate-900">{party.name}</span>
      </nav>

      {/* Election Period Selector */}
      <div className="flex gap-4 flex-wrap">
        <div>
          <label htmlFor="period-select" className="block text-xs font-medium text-slate-700 mb-1">Wahlperiode</label>
          <select
            id="period-select"
            value={selectedPeriod || ''}
            onChange={(e) => setSelectedPeriod(Number(e.target.value))}
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
      </div>

      <div className="bg-white rounded-xl shadow border border-slate-200 p-6 md:p-8 relative flex flex-col">
        <div className="hidden md:flex md:absolute md:top-6 md:right-6 flex-row gap-2">
          <button className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50">
            <Share2 className="h-4 w-4" />
            <span>Teilen</span>
          </button>
        </div>

        <div className="w-full md:pr-32">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">{party.name}</h1>
        </div>
        
        <div className="flex md:hidden flex-row gap-2 justify-start mt-4">
          <button className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50">
            <Share2 className="h-4 w-4" />
            <span>Teilen</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Volatilität</p>
            <p className="text-2xl font-bold text-slate-900">{formatVolatility(party.volatility)}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-slate-100 flex items-center gap-4">
          <div className={`p-3 rounded-lg ${
            party.contributionFactor === 'high' ? 'bg-green-50 text-green-600' :
            party.contributionFactor === 'medium' ? 'bg-yellow-50 text-yellow-600' :
            'bg-red-50 text-red-600'
          }`}>
            <BarChart3 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Beitrag</p>
            <p className={`text-2xl font-bold ${
              party.contributionFactor === 'high' ? 'text-green-600' :
              party.contributionFactor === 'medium' ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {party.contributionFactor === 'high' ? 'Hoch' : 
               party.contributionFactor === 'medium' ? 'Mittel' : 
               'Niedrig'}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-purple-50 rounded-lg text-purple-600">
            <Mic className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Reden (2026)</p>
            <p className="text-2xl font-bold text-slate-900">{party.numSpeeches}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-6 rounded-lg shadow border border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Schwerpunktthemen</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {party.topTopics?.map((item: any, idx: number) => (
                <Link 
                  key={item.id || idx} 
                  href={`/topics/${item.id}`}
                  className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition-colors block"
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-slate-900">{item.title}</h3>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Top {idx + 1}</span>
                  </div>
                  <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600" 
                      style={{ 
                        width: `${90 - (idx * 15)}%`,
                        backgroundColor: party.color 
                      }}
                    ></div>
                  </div>
                  <div className="mt-2 flex justify-between items-center text-xs">
                    <span className="text-slate-500">Hohe Aktivität</span>
                    <span className="font-semibold text-slate-700">
                      {item.stance}
                    </span>
                  </div>
                </Link>
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
            <TrendChart data={activityData} yAxisLabel="Aktivitätsindex" interactive={false} />
            <p className="text-xs text-slate-400 mt-2 text-center">Kombinierte Metrik aus Reden, Anfragen und Abstimmungen.</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-slate-500" />
              Mitglieder ({members?.length || 0})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {members?.slice(0, 6).map((member: any) => (
                <Link 
                  key={member.id} 
                  href={`/politicians/${member.id}`}
                  className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/30 transition-colors"
                >
                  <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500 flex-shrink-0">
                    {member.name.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{member.name}</p>
                    <p className="text-xs text-slate-500 truncate">{member.role}</p>
                    <p className="text-xs text-slate-400 truncate">{member.region}</p>
                  </div>
                </Link>
              ))}
            </div>
            {members && members.length > 6 && (
              <div className="mt-4 text-center">
                <Link 
                  href={`/explorer/politicians?party=${party.id}`}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Alle {members.length} Mitglieder anzeigen →
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-6 rounded-lg shadow border border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-slate-500" />
              Aktuelle Drucksachen
            </h2>
            {printedPapers && printedPapers.length > 0 ? (
              <ul className="divide-y divide-slate-100">
                {printedPapers.map((doc: any) => (
                  <li key={doc.id} className="py-4 hover:bg-slate-50 -mx-4 px-4 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-slate-900 hover:text-blue-600 transition-colors line-clamp-2">
                          {doc.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-slate-500">{doc.type}</p>
                          <span className="text-xs text-slate-400">•</span>
                          <p className="text-xs text-slate-400">{doc.number}</p>
                        </div>
                      </div>
                      <span className="text-xs text-slate-400 flex items-center gap-1 whitespace-nowrap ml-2">
                        <Calendar className="h-3 w-3" />
                        {new Date(doc.date).toLocaleDateString('de-DE')}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">Keine aktuellen Drucksachen gefunden.</p>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Mic className="h-5 w-5 text-slate-500" />
              Kürzliche Reden
            </h2>
            {recentSpeeches && recentSpeeches.length > 0 ? (
              <ul className="divide-y divide-slate-100">
                {recentSpeeches.map((speech: any) => (
                  <li key={speech.id}>
                    <Link 
                      href={`/speeches/${speech.id}`}
                      className="block py-4 hover:bg-slate-50 -mx-4 px-4 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-slate-900 hover:text-blue-600 transition-colors line-clamp-2">
                            {speech.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-slate-500">{speech.type}</p>
                            <span className="text-xs text-slate-400">•</span>
                            <p className="text-xs text-slate-400">{speech.speaker}</p>
                          </div>
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
              <p className="text-sm text-slate-500">Keine kürzlichen Reden gefunden.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
