"use client";

import { Search, User, X, TrendingUp, TrendingDown, Minus, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { useState, useMemo, useEffect } from "react";

export default function ExplorerPoliticiansPage() {
  const [politicians, setPoliticians] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedParties, setExpandedParties] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch('/api/v1/politicians')
      .then(res => res.json())
      .then(data => {
        setPoliticians(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch politicians", err);
        setLoading(false);
      });
  }, []);

  const filteredPoliticians = useMemo(() => {
    return politicians.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.party.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.role.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [searchQuery, politicians]);

  const groupedPoliticians = useMemo(() => {
    const groups = filteredPoliticians.reduce((acc, pol) => {
      if (!acc[pol.party]) acc[pol.party] = [];
      acc[pol.party].push(pol);
      return acc;
    }, {} as Record<string, any[]>);

    Object.keys(groups).forEach(key => {
      groups[key].sort((a: any, b: any) => b.contributionFactor - a.contributionFactor);
    });
    return groups;
  }, [filteredPoliticians]);

  const PARTY_ORDER = ['SPD', 'CDU', 'CSU', 'Grüne', 'FDP', 'AfD', 'Die Linke', 'BSW'];

  const sortedParties = useMemo(() => {
    return Object.keys(groupedPoliticians).sort((a, b) => {
      const indexA = PARTY_ORDER.indexOf(a);
      const indexB = PARTY_ORDER.indexOf(b);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [groupedPoliticians]);

  const togglePartyExpansion = (party: string) => {
    setExpandedParties(prev => ({ ...prev, [party]: !prev[party] }));
  };

  const clearFilters = () => {
    setSearchQuery("");
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

          <div className="w-full sm:w-auto px-2 text-sm text-slate-500 italic whitespace-nowrap shrink-0 text-right">
             {filteredPoliticians.length} Ergebnisse
          </div>

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

      <div className="space-y-10">
        {sortedParties.map((party) => {
          const allItems = groupedPoliticians[party];
          const isExpanded = expandedParties[party];
          const displayedItems = isExpanded ? allItems : allItems.slice(0, 6);
          const hasMore = allItems.length > 6;

          return (
            <div key={party}>
              <div className="flex items-center gap-2 mb-4 border-b border-slate-200 pb-2">
                <h2 className="text-lg font-semibold text-slate-800">{party}</h2>
                <span className="text-xs text-slate-400 font-normal bg-slate-100 px-2 py-0.5 rounded-full ml-2">
                  {allItems.length}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {displayedItems.map((politician: any) => (
                  <Link key={politician.id} href={`/politicians/${politician.id}`} className="group">
                    <div className="flex flex-col h-full overflow-hidden rounded-lg bg-white shadow transition-all duration-200 hover:shadow-lg hover:-translate-y-1 border border-slate-100 ring-1 ring-slate-200 hover:ring-blue-500/50">
                      <div className="p-5 flex-1">
                         <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 sm:gap-0">
                            <div className="flex items-center gap-4">
                               <div className="h-16 w-16 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center text-xl font-bold text-slate-600 overflow-hidden border-2 border-white shadow-sm ring-1 ring-slate-100">
                                 {politician.name.split(' ').map((n: string) => n[0]).join('')}
                               </div>
                               <div>
                                  <h3 className="text-lg font-bold leading-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                                    {politician.name}
                                  </h3>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="inline-flex items-center rounded-md bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-700 ring-1 ring-inset ring-slate-500/10">
                                       {politician.party}
                                    </span>
                                    <span className="text-xs text-slate-500">{politician.region}</span>
                                  </div>
                               </div>
                            </div>

                            <div className="flex flex-col items-start sm:items-end gap-1.5 w-full sm:w-auto sm:max-w-[45%]">
                               <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Top Themen</span>
                               <div className="flex flex-wrap justify-start sm:justify-end gap-1.5 w-full">
                                  {politician.topTopics?.slice(0, 3).map((t: any, i: number) => (
                                    <span key={i} className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 hover:bg-blue-100 transition-colors whitespace-nowrap">
                                      {t.topic}
                                    </span>
                                  ))}
                               </div>
                            </div>
                         </div>
                      </div>
                      
                      <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 group-hover:bg-blue-50/30 transition-colors flex justify-between items-center text-xs">
                           <div className="flex flex-col">
                             <span className="text-slate-500">Beitrag</span>
                             <span className="font-bold text-slate-900 text-sm">{politician.contributionFactor}/10</span>
                           </div>
                           <div className="w-px h-8 bg-slate-200"></div>
                           <div className="flex flex-col">
                             <span className="text-slate-500">Volatilität</span>
                             <span className="font-bold text-slate-900 text-sm">{politician.volatility}</span>
                           </div>
                           <div className="w-px h-8 bg-slate-200"></div>
                           <div className="flex flex-col">
                             <span className="text-slate-500">Reden</span>
                             <span className="font-bold text-slate-900 text-sm">14</span>
                           </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {hasMore && (
                <div className="mt-4 flex justify-center">
                  <button
                    onClick={() => togglePartyExpansion(party)}
                    className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-md"
                  >
                    {isExpanded ? (
                      <>
                        Weniger anzeigen <ChevronUp className="h-4 w-4" />
                      </>
                    ) : (
                      <>
                        {allItems.length - 6} weitere anzeigen <ChevronDown className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}