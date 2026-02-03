"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';

export interface BookmarkItem {
  id: string;
  type: 'topic' | 'politician';
  bookmarkedAt: string;
  lastVisited: string;

  title?: string;
  relevance?: number;
  sentiment?: number;

  name?: string;
  party?: string;
  volatility?: string;
  contributionFactor?: string;
  numSpeeches?: number;
}

export interface TopicStats {
  title: string;
  relevance: number;
  sentiment: number;
}

export interface PoliticianStats {
  name: string;
  party?: string;
  volatility?: string;
  contributionFactor?: string;
  numSpeeches?: number;
}

interface WatchlistContextType {
  watchedTopics: string[];
  watchedPoliticians: string[];
  bookmarks: BookmarkItem[];
  toggleTopic: (id: string, topicStats?: TopicStats) => void;
  togglePolitician: (id: string, politicianStats?: PoliticianStats) => void;
  isTopicWatched: (id: string) => boolean;
  isPoliticianWatched: (id: string) => boolean;
  updateLastVisited: (id: string, type: 'topic' | 'politician') => void;
  updateBookmarkStats: (id: string, type: 'topic' | 'politician', stats: Partial<BookmarkItem>) => void;
  getBookmark: (id: string, type: 'topic' | 'politician') => BookmarkItem | undefined;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

export function WatchlistProvider({ children }: { children: ReactNode }) {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);

  const watchedTopics = useMemo(() => {
    return bookmarks.filter(b => b.type === 'topic').map(b => b.id);
  }, [bookmarks]);

  const watchedPoliticians = useMemo(() => {
    return bookmarks.filter(b => b.type === 'politician').map(b => b.id);
  }, [bookmarks]);

  useEffect(() => {
    const storedBookmarks = localStorage.getItem('plenartrend_bookmarks');
    if (storedBookmarks) {
      const parsedBookmarks: BookmarkItem[] = JSON.parse(storedBookmarks);
      setBookmarks(parsedBookmarks);
    }
  }, []);

  const toggleTopic = useCallback((id: string, topicStats?: TopicStats) => {
    const now = new Date().toISOString();
    const idStr = String(id);

    setBookmarks(prevBookmarks => {
      const isCurrentlyWatched = prevBookmarks.some(b => b.id === idStr && b.type === 'topic');
      let newBookmarks: BookmarkItem[];

      if (isCurrentlyWatched) {
        newBookmarks = prevBookmarks.filter(b => !(b.id === idStr && b.type === 'topic'));
      } else {
        newBookmarks = [...prevBookmarks, {
          id: idStr,
          type: 'topic',
          bookmarkedAt: now,
          lastVisited: now,
          // Store topic stats when bookmarking
          title: topicStats?.title,
          relevance: topicStats?.relevance,
          sentiment: topicStats?.sentiment,
        }];
      }

      localStorage.setItem('plenartrend_bookmarks', JSON.stringify(newBookmarks));
      return newBookmarks;
    });
  }, []);

  const togglePolitician = useCallback((id: string, politicianStats?: PoliticianStats) => {
    const now = new Date().toISOString();
    const idStr = String(id);

    setBookmarks(prevBookmarks => {
      const isCurrentlyWatched = prevBookmarks.some(b => b.id === idStr && b.type === 'politician');
      let newBookmarks: BookmarkItem[];

      if (isCurrentlyWatched) {
        newBookmarks = prevBookmarks.filter(b => !(b.id === idStr && b.type === 'politician'));
      } else {
        newBookmarks = [...prevBookmarks, {
          id: idStr,
          type: 'politician',
          bookmarkedAt: now,
          lastVisited: now,
          // Store politician stats when bookmarking
          name: politicianStats?.name,
          party: politicianStats?.party,
          volatility: politicianStats?.volatility,
          contributionFactor: politicianStats?.contributionFactor,
          numSpeeches: politicianStats?.numSpeeches,
        }];
      }

      localStorage.setItem('plenartrend_bookmarks', JSON.stringify(newBookmarks));
      return newBookmarks;
    });
  }, []);

  const updateLastVisited = useCallback((id: string, type: 'topic' | 'politician') => {
    const now = new Date().toISOString();
    const idStr = String(id);

    setBookmarks(prevBookmarks => {
      const newBookmarks = prevBookmarks.map(b =>
        b.id === idStr && b.type === type
          ? { ...b, lastVisited: now }
          : b
      );
      localStorage.setItem('plenartrend_bookmarks', JSON.stringify(newBookmarks));
      return newBookmarks;
    });
  }, []);

  const updateBookmarkStats = useCallback((id: string, type: 'topic' | 'politician', stats: Partial<BookmarkItem>) => {
    const idStr = String(id);
    const now = new Date().toISOString();

    setBookmarks(prevBookmarks => {
      const newBookmarks = prevBookmarks.map(b =>
        b.id === idStr && b.type === type
          ? { ...b, ...stats, lastVisited: now }
          : b
      );
      localStorage.setItem('plenartrend_bookmarks', JSON.stringify(newBookmarks));
      return newBookmarks;
    });
  }, []);

  const getBookmark = useCallback((id: string, type: 'topic' | 'politician') => {
    const idStr = String(id);
    return bookmarks.find(b => b.id === idStr && b.type === type);
  }, [bookmarks]);

  const isTopicWatched = useCallback((id: string) => {
    const idStr = String(id);
    return watchedTopics.includes(idStr);
  }, [watchedTopics]);

  const isPoliticianWatched = useCallback((id: string) => {
    const idStr = String(id);
    return watchedPoliticians.includes(idStr);
  }, [watchedPoliticians]);

  return (
    <WatchlistContext.Provider value={{
      watchedTopics,
      watchedPoliticians,
      bookmarks,
      toggleTopic,
      togglePolitician,
      isTopicWatched,
      isPoliticianWatched,
      updateLastVisited,
      updateBookmarkStats,
      getBookmark
    }}>
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
