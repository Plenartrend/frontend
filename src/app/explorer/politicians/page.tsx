"use client";

import { Search, User, X, TrendingUp, TrendingDown, Minus, Loader2, Trophy, TrendingDown as TrendingDownIcon } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";

type TabType = 'overview' | 'ranking';

// Format volatility: multiply by 100 and display as score/100
const formatVolatility = (volatility: string | null | undefined) => {
  if (!volatility) return 'N/A';
  const val = parseFloat(volatility) * 100;
  return `${Math.round(val)}/100`;
};

export default function ExplorerPoliticiansPage() {
  const searchParams = useSearchParams();
  const partyParam = searchParams.get('party');
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [searchQuery, setSearchQuery] = useState("");
  const [electionPeriods, setElectionPeriods] = useState<any[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<number | null>(null);
  const [loadingPeriods, setLoadingPeriods] = useState(true);
  const [parliamentaryGroups, setParliamentaryGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const initialGroupSetRef = useRef(false);
  const isFirstPeriodLoad = useRef(true);
  const [selectedContribution, setSelectedContribution] = useState<string>("");
  const [selectedLetter, setSelectedLetter] = useState<string>("");
  const [politicians, setPoliticians] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [displayCount, setDisplayCount] = useState(20);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const letterScrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  
  const [mostActive, setMostActive] = useState<any[]>([]);
  const [leastActive, setLeastActive] = useState<any[]>([]);
  const [loadingRanking, setLoadingRanking] = useState(false);

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
      // Reset group filter when election period changes (but not on initial load)
      if (!isFirstPeriodLoad.current) {
        setSelectedGroup(null);
      }
      isFirstPeriodLoad.current = false;
      
      fetch(`/api/v1/parliamentary-groups?election_period=${selectedPeriod}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setParliamentaryGroups(data);
            // Set initial group from URL parameter if present and not yet set
            if (partyParam && !initialGroupSetRef.current) {
              const groupId = Number(partyParam);
              const matchingGroup = data.find((g: any) => g.id === groupId);
              if (matchingGroup) {
                setSelectedGroup(groupId);
              }
              initialGroupSetRef.current = true;
            }
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
  }, [selectedPeriod, partyParam]);

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
      
      // Extract last name (last word in name)
      const lastName = p.name?.split(' ').pop() || '';
      const firstLetter = lastName.charAt(0).toUpperCase();
      const matchesLetter = !selectedLetter || firstLetter === selectedLetter;
      
      return matchesSearch && matchesGroup && matchesContribution && matchesLetter;
    });
  }, [searchQuery, politicians, selectedGroup, selectedContribution, selectedLetter, parliamentaryGroups]);

  // Calculate letter counts based on current filters (excluding letter filter)
  const letterCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    
    // Initialize all letters to 0
    alphabet.forEach(letter => counts[letter] = 0);
    
    // Filter politicians by current filters (excluding letter filter)
    const filteredForCounting = politicians.filter(p => {
      const matchesSearch = !searchQuery || 
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.party?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.role?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesGroup = !selectedGroup || p.party === parliamentaryGroups.find(g => g.id === selectedGroup)?.name;
      
      const matchesContribution = !selectedContribution || p.contributionFactor === selectedContribution;
      
      return matchesSearch && matchesGroup && matchesContribution;
    });
    
    // Count politicians by first letter of last name
    filteredForCounting.forEach(p => {
      const lastName = p.name?.split(' ').pop() || '';
      const firstLetter = lastName.charAt(0).toUpperCase();
      if (firstLetter && /[A-Z]/.test(firstLetter)) {
        counts[firstLetter] = (counts[firstLetter] || 0) + 1;
      }
    });
    
    return counts;
  }, [politicians, searchQuery, selectedGroup, selectedContribution, parliamentaryGroups]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedGroup(null);
    setSelectedContribution("");
    setSelectedLetter("");
  };

  // Reset display count when filters change
  useEffect(() => {
    setDisplayCount(20);
  }, [searchQuery, selectedGroup, selectedContribution, selectedLetter]);

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

  // Drag to scroll handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!letterScrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - letterScrollRef.current.offsetLeft);
    setScrollLeft(letterScrollRef.current.scrollLeft);
    letterScrollRef.current.style.cursor = 'grabbing';
  };

  const handleMouseLeave = () => {
    if (!letterScrollRef.current) return;
    setIsDragging(false);
    letterScrollRef.current.style.cursor = 'grab';
  };

  const handleMouseUp = () => {
    if (!letterScrollRef.current) return;
    setIsDragging(false);
    letterScrollRef.current.style.cursor = 'grab';
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !letterScrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - letterScrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Multiply for faster scroll
    letterScrollRef.current.scrollLeft = scrollLeft - walk;
  };

  useEffect(() => {
    if (activeTab === 'ranking' && selectedPeriod) {
      setLoadingRanking(true);
      Promise.all([
        fetch(`/api/v1/politicians/most-active?limit=10&election_period=${selectedPeriod}`)
          .then(res => {
            if (!res.ok) {
              throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
          })
          .then(data => {
            if (Array.isArray(data)) {
              setMostActive(data);
            } else {
              console.error('Most active data is not an array:', data);
              setMostActive([]);
            }
          })
          .catch(err => {
            console.error('Failed to fetch most active', err);
            setMostActive([]);
          }),
        fetch(`/api/v1/politicians/least-active?limit=10&election_period=${selectedPeriod}`)
          .then(res => {
            if (!res.ok) {
              throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
          })
          .then(data => {
            if (Array.isArray(data)) {
              setLeastActive(data);
            } else {
              console.error('Least active data is not an array:', data);
              setLeastActive([]);
            }
          })
          .catch(err => {
            console.error('Failed to fetch least active', err);
            setLeastActive([]);
          })
      ]).finally(() => setLoadingRanking(false));
    }
  }, [activeTab, selectedPeriod]);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('de-DE').format(num);
  };

  if (loading && activeTab === 'overview') {
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

        <div className="border-b border-slate-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`
                whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors
                ${activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                }
              `}
            >
              Übersicht
            </button>
            <button
              onClick={() => setActiveTab('ranking')}
              className={`
                whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors
                ${activeTab === 'ranking'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                }
              `}
            >
              Aktivitäts-Ranking
            </button>
          </nav>
        </div>

        {activeTab === 'overview' && (
          <>
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
                {(searchQuery || selectedGroup || selectedContribution || selectedLetter) && (
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

            {/* Alphabetical Filter */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-sm font-medium text-slate-700 whitespace-nowrap">Nachname:</span>
                {selectedLetter && (
                  <button
                    onClick={() => setSelectedLetter("")}
                    className="text-xs text-blue-600 hover:text-blue-700 underline"
                  >
                    Alle anzeigen
                  </button>
                )}
              </div>
              <div className="relative">
                {/* Left scroll button */}
                <button
                  onClick={() => {
                    const container = document.getElementById('letter-scroll');
                    if (container) container.scrollBy({ left: -200, behavior: 'smooth' });
                  }}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 bg-white rounded-full shadow-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  aria-label="Scroll left"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {/* Scrollable letter container */}
                <div 
                  ref={letterScrollRef}
                  id="letter-scroll"
                  className="flex gap-1.5 overflow-x-auto scrollbar-hide scroll-smooth px-12 select-none cursor-grab active:cursor-grabbing"
                  onMouseDown={handleMouseDown}
                  onMouseLeave={handleMouseLeave}
                  onMouseUp={handleMouseUp}
                  onMouseMove={handleMouseMove}
                >
                  {Object.entries(letterCounts).map(([letter, count]) => (
                    <button
                      key={letter}
                      onClick={() => setSelectedLetter(selectedLetter === letter ? "" : letter)}
                      disabled={count === 0}
                      className={`
                        flex-1 min-w-[44px] px-3 py-2 rounded-md text-sm font-medium transition-all
                        ${count === 0 
                          ? 'bg-slate-50 text-slate-300 cursor-not-allowed' 
                          : selectedLetter === letter
                            ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-600 ring-offset-1'
                            : 'bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:shadow-sm'
                        }
                      `}
                      title={count === 0 ? 'Keine Abgeordnete' : `${count} Abgeordnete`}
                    >
                      <div className="flex flex-col items-center leading-tight">
                        <span className="font-bold">{letter}</span>
                        {count > 0 && (
                          <span className={`text-[10px] ${selectedLetter === letter ? 'text-blue-100' : 'text-slate-500'}`}>
                            {count}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Right scroll button */}
                <button
                  onClick={() => {
                    const container = document.getElementById('letter-scroll');
                    if (container) container.scrollBy({ left: 200, behavior: 'smooth' });
                  }}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 bg-white rounded-full shadow-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  aria-label="Scroll right"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </>
        )}

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
          
          {activeTab === 'overview' && (
            <>
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
            </>
          )}
        </div>
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Results count */}
          <div className="text-sm text-slate-500">
            {filteredPoliticians.length} {filteredPoliticians.length === 1 ? 'Abgeordneter' : 'Abgeordnete'} gefunden
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {displayedPoliticians.map((politician: any) => (
          <Link key={politician.id} href={`/politicians/${politician.id}?election_period=${selectedPeriod}`} className="group">
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
                  <span className="font-bold text-slate-900 text-sm">{formatVolatility(politician.volatility)}</span>
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
        </>
      )}

      {activeTab === 'ranking' && (
        <div className="space-y-8">
          {loadingRanking ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-lg shadow border border-slate-200">
                  <div className="p-6 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                      <Trophy className="h-6 w-6 text-yellow-500" />
                      <h2 className="text-xl font-bold text-slate-900">Aktivste Abgeordnete</h2>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">Top 10 nach Anzahl Reden und gesprochenen Wörtern</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Rang</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Partei</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Reden</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Wörter</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-200">
                        {mostActive.length > 0 ? (
                          mostActive.map((politician: any, index: number) => (
                            <tr key={index} className="hover:bg-slate-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 text-yellow-800 font-bold text-sm">
                                  {index + 1}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-slate-900">{politician.name}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex items-center rounded-md bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700 ring-1 ring-inset ring-slate-500/10">
                                  {politician.party}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-900 font-semibold">
                                {formatNumber(politician.numSpeeches)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-900 font-semibold">
                                {formatNumber(politician.wordCount)}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-500">
                              Keine Daten verfügbar
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow border border-slate-200">
                  <div className="p-6 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                      <TrendingDownIcon className="h-6 w-6 text-slate-400" />
                      <h2 className="text-xl font-bold text-slate-900">Am wenigsten aktive Abgeordnete</h2>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">Bottom 10 nach Anzahl Reden und gesprochenen Wörtern</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Rang</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Partei</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Reden</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Wörter</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-200">
                        {leastActive.length > 0 ? (
                          leastActive.map((politician: any, index: number) => (
                            <tr key={index} className="hover:bg-slate-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold text-sm">
                                  {index + 1}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-slate-900">{politician.name}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex items-center rounded-md bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700 ring-1 ring-inset ring-slate-500/10">
                                  {politician.party}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-900 font-semibold">
                                {formatNumber(politician.numSpeeches)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-900 font-semibold">
                                {formatNumber(politician.wordCount)}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-500">
                              Keine Daten verfügbar
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}