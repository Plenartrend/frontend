"use client";

import { Search, FileText, X, TrendingUp, TrendingDown, Minus, Loader2, Zap, Leaf, Shield, Home, Cpu, Train, Wallet, Activity, Heart, Users, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { useState, useMemo, useEffect } from "react";

const CATEGORY_ICONS: Record<string, any> = { // TODO: add more
  'Energie': Zap,
  'Landwirtschaft': Leaf,
  'Verteidigung': Shield,
  'Wohnen': Home,
  'Technologie': Cpu,
  'Verkehr': Train,
  'Finanzen': Wallet,
  'Gesundheit': Activity,
  'Soziales': Users,
  'Familie': Heart,
  'Bildung': FileText 
};

export default function ExplorerTopicsPage() {
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch('/api/v1/topics')
      .then(res => res.json())
      .then(data => {
        setTopics(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch topics", err);
        setLoading(false);
      });
  }, []);

  const filteredTopics = useMemo(() => {
    return topics.filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            t.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [searchQuery, topics]);

  const groupedTopics = useMemo(() => {
    const groups = filteredTopics.reduce((acc, topic) => {
      if (!acc[topic.category]) acc[topic.category] = [];
      acc[topic.category].push(topic);
      return acc;
    }, {} as Record<string, any[]>);

    Object.keys(groups).forEach(key => {
      groups[key].sort((a: any, b: any) => b.relevance - a.relevance);
    });
    return groups;
  }, [filteredTopics]);

  const sortedCategories = useMemo(() => Object.keys(groupedTopics).sort(), [groupedTopics]);

  const toggleCategoryExpansion = (category: string) => {
    setExpandedCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  const getTrendIcon = (trend: string) => {
    switch(trend) {
      case 'up': return <TrendingUp className="h-3 w-3 mr-1" />;
      case 'down': return <TrendingDown className="h-3 w-3 mr-1" />;
      default: return <Minus className="h-3 w-3 mr-1" />;
    }
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
          <h1 className="text-2xl font-bold text-slate-900">Themen</h1>
          <p className="text-sm text-slate-500">Entdecken Sie aktuelle politische Debatten nach Kategorien.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center bg-white p-4 rounded-lg shadow-sm border border-slate-200">
           <div className="relative flex-1 min-w-0">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-slate-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              className="block w-full rounded-md border-0 py-1.5 pl-10 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
              placeholder="Themen durchsuchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {/* Fixed width for results count to prevent layout shift */}
          <div className="w-full sm:w-auto px-2 text-sm text-slate-500 italic whitespace-nowrap shrink-0 text-right">
             {filteredTopics.length} Ergebnisse
          </div>
        </div>
      </div>

      <div className="space-y-10">
        {sortedCategories.map((category) => {
          const Icon = CATEGORY_ICONS[category] || FileText;
          const allItems = groupedTopics[category];
          const isExpanded = expandedCategories[category];
          const displayedItems = isExpanded ? allItems : allItems.slice(0, 6);
          const hasMore = allItems.length > 6;

          return (
            <div key={category}>
              <div className="flex items-center gap-2 mb-4 border-b border-slate-200 pb-2">
                <Icon className="h-5 w-5 text-slate-400" />
                <h2 className="text-lg font-semibold text-slate-800">{category}</h2>
                <span className="text-xs text-slate-400 font-normal bg-slate-100 px-2 py-0.5 rounded-full ml-2">
                  {allItems.length}
                </span>
              </div>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {displayedItems.map((topic: any) => (
                  <Link key={topic.id} href={`/topics/${topic.id}`} className="group">
                    <div className="flex flex-col h-full overflow-hidden rounded-lg bg-white shadow transition-all duration-200 hover:shadow-lg hover:-translate-y-1 border border-slate-100 ring-1 ring-slate-200 hover:ring-blue-500/50">
                      <div className="p-5 flex-1">
                        <h3 className="text-lg font-semibold leading-6 text-slate-900 group-hover:text-blue-600 transition-colors">
                          {topic.title}
                        </h3>
                        <p className="mt-2 text-sm text-slate-500 line-clamp-2">
                          Analyse des aktuellen legislativen Diskurses zu {topic.title}.
                        </p>
                        
                        <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
                           <div className="flex items-center">
                              {getTrendIcon(topic.trend)}
                              <span>Relevanz: {topic.trend === 'up' ? 'Steigend' : topic.trend === 'down' ? 'Fallend' : 'Stabil'}</span>
                           </div>
                        </div>
                      </div>
                      <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 group-hover:bg-blue-50/30 transition-colors">
                        <div className="flex items-center justify-between text-sm text-slate-500">
                          <span>Relevanz-Score</span>
                          <span className="font-semibold text-slate-900">{topic.relevance}/100</span>
                        </div>
                        <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200">
                          <div 
                            className="h-1.5 rounded-full bg-blue-600" 
                            style={{ width: `${topic.relevance}%` }} 
                          />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {hasMore && (
                <div className="mt-4 flex justify-center">
                  <button
                    onClick={() => toggleCategoryExpansion(category)}
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