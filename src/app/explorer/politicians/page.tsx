"use client";

import { Search, User, X, TrendingUp, TrendingDown, Minus, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";

export default function ExplorerPoliticiansPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [electionPeriods, setElectionPeriods] = useState<any[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<number | null>(null);
  const [loadingPeriods, setLoadingPeriods] = useState(true);
  const [parliamentaryGroups, setParliamentaryGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [selectedContribution, setSelectedContribution] = useState<string>("");
  const [politicians, setPoliticians] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [displayCount, setDisplayCount] = useState(20);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Fetch election periods
  useEffect(() => {
    fetch('/api/v1/election-periods')
      .then(res => res.json())
      .then(data => {
        // Ensure data is an array
        if (Array.isArray(data)) {
          // Filter to only show periods with number > 0
          const filtered = data.filter(p => p.number > 0);
          setElectionPeriods(filtered);
          // Preselect the newest (first in list, since ordered DESC)
          if (filtered.length > 0) {
            setSelectedPeriod(filtered[0].number);
          }
        } else {
          console.error('Election periods response is not an array:', data);
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

  // Fetch parliamentary groups when election period changes
  useEffect(() => {
    if (selectedPeriod) {
      // Reset group filter when election period changes
      setSelectedGroup(null);
      
      fetch(`/api/v1/parliamentary-groups?election_period=${selectedPeriod}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setParliamentaryGroups(data);
          } else {
            console.error('Parliamentary groups response is not an array:', data);
            setParliamentaryGroups([]);
          }
        })
        .catch(err => {
          console.error('Failed to fetch parliamentary groups', err);
          setParliamentaryGroups([]);
        });
    }
  }, [selectedPeriod]);

  // Fetch all politicians when election period changes
  useEffect(() => {
    if (!selectedPeriod) return;

    setLoading(true);
    // No page_size parameter - backend returns all politicians
    fetch(`/api/v1/politicians?election_period=${selectedPeriod}`)
      .then(res => res.json())
      .then(data => {
        if (data.data && Array.isArray(data.data)) {
          setPoliticians(data.data);
        } else {
          console.error('Politicians response is invalid:', data);
          setPoliticians([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch politicians', err);
        setPoliticians([]);
        setLoading(false);
      });
  }, [selectedPeriod]);

  const filteredPoliticians = useMemo(() => {
    return politicians.filter(p => {
      const matchesSearch = !searchQuery || 
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.party?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.role?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesGroup = !selectedGroup || p.party === parliamentaryGroups.find(g => g.id === selectedGroup)?.name;
      
      const matchesContribution = !selectedContribution || p.contributionFactor === selectedContribution;
      
      return matchesSearch && matchesGroup && matchesContribution;
    });
  }, [searchQuery, politicians, selectedGroup, selectedContribution, parliamentaryGroups]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedGroup(null);
    setSelectedContribution("");
  };

  // Reset display count when filters change
  useEffect(() => {
    setDisplayCount(20);
  }, [searchQuery, selectedGroup, selectedContribution]);

  // Infinite scroll observer
  useEffect(() => {
    if (!loadMoreRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && displayCount < filteredPoliticians.length) {
          setDisplayCount(prev => Math.min(prev + 20, filteredPoliticians.length));
        }
      },
      { rootMargin: '100px' }
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [displayCount, filteredPoliticians.length]);

  const displayedPoliticians = useMemo(() => {
    return filteredPoliticians.slice(0, displayCount);
  }, [filteredPoliticians, displayCount]);

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
          <h1 className="text-2xl font-bold text-slate-900">Abgeordnete</h1>
          <p className="text-sm text-slate-500">Finden Sie Politiker nach Fraktion und Aktivität.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center bg-white p-4 rounded-lg shadow-sm border border-slate-200">
           <div className="relative flex-1 min-w-0">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-slate-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              className="block w-full rounded-md border-0 py-1.5 pl-10 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
              placeholder="Abgeordnete suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-3">
            <div className="w-full sm:w-auto px-2 text-sm text-slate-500 italic whitespace-nowrap shrink-0 text-right">
              {filteredPoliticians.length} Ergebnisse
            </div>

            {(searchQuery || selectedGroup || selectedContribution) && (
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

        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <select
            value={selectedPeriod || ''}
            onChange={(e) => setSelectedPeriod(parseInt(e.target.value))}
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
          
          <select
            value={selectedGroup || ""}
            onChange={(e) => setSelectedGroup(e.target.value ? Number(e.target.value) : null)}
            className="rounded-md border-0 py-2 px-3 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm bg-white shadow-sm"
          >
            <option value="">Alle Fraktionen</option>
            {parliamentaryGroups.map(group => (
              <option key={group.id} value={group.id}>{group.name}</option>
            ))}
          </select>

          <select
            value={selectedContribution}
            onChange={(e) => setSelectedContribution(e.target.value)}
            className="rounded-md border-0 py-2 px-3 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm bg-white shadow-sm"
          >
            <option value="">Alle Beiträge</option>
            <option value="low">Gering</option>
            <option value="medium">Mittel</option>
            <option value="high">Hoch</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {displayedPoliticians.map((politician: any) => (
          <Link key={politician.id} href={`/politicians/${politician.id}`} className="group">
            <div className="flex flex-col h-full overflow-hidden rounded-lg bg-white shadow transition-all duration-200 hover:shadow-lg hover:-translate-y-1 border border-slate-100 ring-1 ring-slate-200 hover:ring-blue-500/50">
              <div className="p-5 flex-1">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 sm:gap-0">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center text-xl font-bold text-slate-600 overflow-hidden border-2 border-white shadow-sm ring-1 ring-slate-100">
                      {politician.name?.split(' ').map((n: string) => n[0]).join('') || '?'}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold leading-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                        {politician.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center rounded-md bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-700 ring-1 ring-inset ring-slate-500/10">
                          {politician.party}
                        </span>
                      </div>
                    </div>
                  </div>

                  {politician.topTopics && politician.topTopics.length > 0 && (
                    <div className="flex flex-col items-start sm:items-end gap-1.5 w-full sm:w-auto sm:max-w-[45%]">
                      <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Top Themen</span>
                      <div className="flex flex-wrap justify-start sm:justify-end gap-1.5 w-full">
                        {politician.topTopics.slice(0, 3).map((t: any, i: number) => (
                          <span 
                            key={i} 
                            className="inline-block rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 hover:bg-blue-100 transition-colors max-w-[120px] truncate overflow-hidden"
                            title={t.topic}
                          >
                            {t.topic}
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
                    politician.contributionFactor === 'high' ? 'text-green-600' :
                    politician.contributionFactor === 'medium' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {politician.contributionFactor === 'high' ? 'Hoch' :
                     politician.contributionFactor === 'medium' ? 'Mittel' :
                     'Gering'}
                  </span>
                </div>
                <div className="w-px h-8 bg-slate-200"></div>
                <div className="flex flex-col">
                  <span className="text-slate-500">Volatilität</span>
                  <span className="font-bold text-slate-900 text-sm">{politician.volatility || 'N/A'}</span>
                </div>
                <div className="w-px h-8 bg-slate-200"></div>
                <div className="flex flex-col">
                  <span className="text-slate-500">Reden</span>
                  <span className="font-bold text-slate-900 text-sm">{politician.numSpeeches || 0}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Infinite scroll trigger */}
      {displayCount < filteredPoliticians.length && (
        <div ref={loadMoreRef} className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      )}

      {!loading && filteredPoliticians.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          Keine Abgeordnete gefunden
        </div>
      )}

      {!loading && displayCount >= filteredPoliticians.length && filteredPoliticians.length > 0 && (
        <div className="text-center py-8 text-sm text-slate-500">
          Alle {filteredPoliticians.length} Abgeordnete geladen
        </div>
      )}
    </div>
  );
}