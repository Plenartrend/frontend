"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface WatchlistContextType {
  watchedTopics: string[];
  watchedPoliticians: string[];
  toggleTopic: (id: string) => void;
  togglePolitician: (id: string) => void;
  isTopicWatched: (id: string) => boolean;
  isPoliticianWatched: (id: string) => boolean;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

export function WatchlistProvider({ children }: { children: ReactNode }) {
  const [watchedTopics, setWatchedTopics] = useState<string[]>([]);
  const [watchedPoliticians, setWatchedPoliticians] = useState<string[]>([]);

  useEffect(() => {
    const storedTopics = localStorage.getItem('plenartrend_watched_topics');
    const storedPoliticians = localStorage.getItem('plenartrend_watched_politicians');
    
    if (storedTopics) setWatchedTopics(JSON.parse(storedTopics));
    else setWatchedTopics(['t1']);  

    if (storedPoliticians) setWatchedPoliticians(JSON.parse(storedPoliticians));
    else setWatchedPoliticians(['p1']);
  }, []);

  const toggleTopic = (id: string) => {
    setWatchedTopics(prev => {
      const newTopics = prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id];
      localStorage.setItem('plenartrend_watched_topics', JSON.stringify(newTopics));
      return newTopics;
    });
  };

  const togglePolitician = (id: string) => {
    setWatchedPoliticians(prev => {
      const newPoliticians = prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id];
      localStorage.setItem('plenartrend_watched_politicians', JSON.stringify(newPoliticians));
      return newPoliticians;
    });
  };

  const isTopicWatched = (id: string) => watchedTopics.includes(id);
  const isPoliticianWatched = (id: string) => watchedPoliticians.includes(id);

  return (
    <WatchlistContext.Provider value={{ watchedTopics, watchedPoliticians, toggleTopic, togglePolitician, isTopicWatched, isPoliticianWatched }}>
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const context = useContext(WatchlistContext);
  if (context === undefined) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
}
