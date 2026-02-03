"use client";

import { Search, X, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, useMemo, useEffect, useRef } from "react";

// Format volatility: multiply by 100 and display as score/100
const formatVolatility = (volatility: string | null | undefined) => {
  if (!volatility) return 'N/A';
  const val = parseFloat(volatility) * 100;
  return `${Math.round(val)}/100`;
};

export default function ExplorerPartiesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [parties, setParties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayCount, setDisplayCount] = useState(20);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [electionPeriods, setElectionPeriods] = useState<any[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<number | null>(null);
  const [loadingPeriods, setLoadingPeriods] = useState(true);

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

  // Fetch parties data
  useEffect(() => {
    if (selectedPeriod === null) return;

    setLoading(true);
    fetch(`/api/v1/parties?election_period=${selectedPeriod}`)
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch parties');
        }
        return res.json();
      })
      .then(data => {
        setParties(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch parties:', err);
        setParties([]);
        setLoading(false);
      });
  }, [selectedPeriod]);

  const filteredParties = useMemo(() => {
    return parties.filter(p => {
      const matchesSearch = !searchQuery || 
        p.name?.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesSearch;
    });
  }, [searchQuery, parties]);

  const clearFilters = () => {
    setSearchQuery("");
  };

  // Reset display count when filters change
  useEffect(() => {
    setDisplayCount(20);
  }, [searchQuery]);

  // Infinite scroll observer
  useEffect(() => {
    if (!loadMoreRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && displayCount < filteredParties.length) {
          setDisplayCount(prev => Math.min(prev + 20, filteredParties.length));
        }
      },
      { rootMargin: '100px' }
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [displayCount, filteredParties.length]);

  const displayedParties = useMemo(() => {
    return filteredParties.slice(0, displayCount);
  }, [filteredParties, displayCount]);

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
          <h1 className="text-2xl font-bold text-slate-900">Parteien</h1>
          <p className="text-sm text-slate-500">Übersicht über alle Parteien im Bundestag.</p>
        </div>

        {/* Election Period Selector */}
        <div className="flex justify-start">
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

        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <div className="relative flex-1 min-w-0">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-slate-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              className="block w-full rounded-md border-0 py-1.5 pl-10 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
              placeholder="Parteien suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-3">
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
      </div>

      {/* Results count */}
      <div className="text-sm text-slate-500">
        {filteredParties.length} {filteredParties.length === 1 ? 'Partei' : 'Parteien'} gefunden
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {displayedParties.map((party: any) => (
          <Link key={party.id} href={`/parties/${party.id}`} className="group">
            <div className="flex flex-col h-full overflow-hidden rounded-lg bg-white shadow transition-all duration-200 hover:shadow-lg hover:-translate-y-1 border border-slate-100 ring-1 ring-slate-200 hover:ring-blue-500/50">
              <div className="p-5 flex-1">
                <div className="flex flex-col gap-4">
                  <div>
                    <h3 className="text-lg font-bold leading-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                      {party.name}
                    </h3>
                  </div>

                  {party.topTopics && party.topTopics.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Top Themen</span>
                      <div className="flex flex-wrap gap-1.5">
                        {party.topTopics.slice(0, 3).map((t: any, i: number) => (
                          <span 
                            key={i} 
                            className="inline-block rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 hover:bg-blue-100 transition-colors truncate overflow-hidden"
                            title={t.title}
                          >
                            {t.title}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 group-hover:bg-blue-50/30 transition-colors flex justify-between items-center text-xs">
                <div className="flex flex-col">
                  <span className="text-slate-500">Beitrag</span>
                  <span className={`font-bold text-sm ${
                    party.contributionFactor === 'high' ? 'text-green-600' :
                    party.contributionFactor === 'medium' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {party.contributionFactor === 'high' ? 'Hoch' : 
                     party.contributionFactor === 'medium' ? 'Mittel' : 
                     'Niedrig'}
                  </span>
                </div>
                <div className="w-px h-8 bg-slate-200"></div>
                <div className="flex flex-col">
                  <span className="text-slate-500">Volatilität</span>
                  <span className="font-bold text-slate-900 text-sm">{formatVolatility(party.volatility)}</span>
                </div>
                <div className="w-px h-8 bg-slate-200"></div>
                <div className="flex flex-col">
                  <span className="text-slate-500">Reden</span>
                  <span className="font-bold text-slate-900 text-sm">{party.numSpeeches || 0}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Infinite scroll trigger */}
      {displayCount < filteredParties.length && (
        <div ref={loadMoreRef} className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      )}

      {!loading && filteredParties.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          Keine Parteien gefunden
        </div>
      )}

      {!loading && displayCount >= filteredParties.length && filteredParties.length > 0 && (
        <div className="text-center py-8 text-sm text-slate-500">
          Alle {filteredParties.length} Parteien geladen
        </div>
      )}
    </div>
  );
}
