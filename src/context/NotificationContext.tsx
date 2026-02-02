"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { BookmarkItem } from './WatchlistContext';

export interface BookmarkNotification {
  id: string;
  bookmarkId: string;
  type: 'topic' | 'politician';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  targetUrl: string;
  category?: 'relevance' | 'sentiment' | 'volatility' | 'contribution' | 'speeches' | 'inactive';
  details?: {
    before?: string | number;
    after?: string | number;
  };
}

interface NotificationContextType {
  notifications: BookmarkNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  checkForStatChanges: (bookmarks: BookmarkItem[], topicsData: any[], politiciansData: any[]) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

function generateStatChangeNotifications(
  bookmarks: BookmarkItem[],
  topicsData: any[],
  politiciansData: any[],
  existingNotifications: BookmarkNotification[]
): BookmarkNotification[] {
  const now = new Date();
  const newNotifications: BookmarkNotification[] = [];

  bookmarks.forEach(bookmark => {
    const existingUnread = existingNotifications.find(
      n => n.bookmarkId === bookmark.id && n.type === bookmark.type && !n.isRead
    );
    if (existingUnread) return;

    if (bookmark.type === 'topic') {
      const currentTopic = topicsData.find((t: any) => String(t.id) === String(bookmark.id));
      if (!currentTopic) return;

      console.log(currentTopic)

      // Check for relevance change >10%
      if (bookmark.relevance !== undefined && bookmark.relevance !== null) {
        const currentRelevance = currentTopic.relevance || 0;
        const storedRelevance = bookmark.relevance;
        const relevanceChange = Math.abs(currentRelevance - storedRelevance);
        const changePercent = (relevanceChange / (storedRelevance || 0.001)) * 100;

        if (changePercent > 10) {
          const isIncrease = currentRelevance > storedRelevance;
          newNotifications.push({
            id: `topic-relevance-${bookmark.id}-${Date.now()}-${Math.random()}`,
            bookmarkId: bookmark.id,
            type: 'topic',
            title: bookmark.title || currentTopic.title || 'Thema',
            message: `Relevanz ${isIncrease ? 'stieg' : 'fiel'} um ${changePercent.toFixed(1)}%`,
            timestamp: now.toISOString(),
            isRead: false,
            targetUrl: `/topics/${bookmark.id}`,
            category: 'relevance',
            details: {
              before: `${(storedRelevance * 100).toFixed(2)}%`,
              after: `${(currentRelevance * 100).toFixed(2)}%`
            }
          });
        }
      }

      // Check for sentiment change >0.2
      if (bookmark.sentiment !== undefined && bookmark.sentiment !== null) {

        const currentSentiment = currentTopic.sentiment || 0;
        const storedSentiment = bookmark.sentiment;
        const sentimentChange = Math.abs(currentSentiment - storedSentiment);

        console.log(storedSentiment)

        if (sentimentChange > 0.2) {
          const isPositive = currentSentiment > storedSentiment;
          newNotifications.push({
            id: `topic-sentiment-${bookmark.id}-${Date.now()}-${Math.random()}`,
            bookmarkId: bookmark.id,
            type: 'topic',
            title: bookmark.title || currentTopic.title || 'Thema',
            message: `Stimmung wurde ${isPositive ? 'positiver' : 'negativer'}`,
            timestamp: now.toISOString(),
            isRead: false,
            targetUrl: `/topics/${bookmark.id}`,
            category: 'sentiment',
            details: {
              before: storedSentiment.toFixed(2),
              after: currentSentiment.toFixed(2)
            }
          });
        }
      }
    }

    if (bookmark.type === 'politician') {
      const currentPol = politiciansData.find((p: any) => String(p.id) === String(bookmark.id));
      if (!currentPol) return;

      // Check volatility change
      if (bookmark.volatility && bookmark.volatility !== currentPol.volatility) {
        newNotifications.push({
          id: `politician-volatility-${bookmark.id}-${Date.now()}-${Math.random()}`,
          bookmarkId: bookmark.id,
          type: 'politician',
          title: bookmark.name || currentPol.name || 'Abgeordneter',
          message: `Volatilität änderte sich`,
          timestamp: now.toISOString(),
          isRead: false,
          targetUrl: `/politicians/${bookmark.id}`,
          category: 'volatility',
          details: {
            before: bookmark.volatility,
            after: currentPol.volatility
          }
        });
      }

      // Check contribution factor change
      if (bookmark.contributionFactor && bookmark.contributionFactor !== currentPol.contributionFactor) {
        newNotifications.push({
          id: `politician-contribution-${bookmark.id}-${Date.now()}-${Math.random()}`,
          bookmarkId: bookmark.id,
          type: 'politician',
          title: bookmark.name || currentPol.name || 'Abgeordneter',
          message: `Beitragsfaktor änderte sich`,
          timestamp: now.toISOString(),
          isRead: false,
          targetUrl: `/politicians/${bookmark.id}`,
          category: 'contribution',
          details: {
            before: bookmark.contributionFactor,
            after: currentPol.contributionFactor
          }
        });
      }

      // Check new speeches
      if (bookmark.numSpeeches !== undefined && (currentPol.numSpeeches || 0) > bookmark.numSpeeches) {
        const newSpeeches = (currentPol.numSpeeches || 0) - bookmark.numSpeeches;
        newNotifications.push({
          id: `politician-speeches-${bookmark.id}-${Date.now()}-${Math.random()}`,
          bookmarkId: bookmark.id,
          type: 'politician',
          title: bookmark.name || currentPol.name || 'Abgeordneter',
          message: `${newSpeeches} neue Rede${newSpeeches > 1 ? 'n' : ''} hinzugefügt`,
          timestamp: now.toISOString(),
          isRead: false,
          targetUrl: `/politicians/${bookmark.id}`,
          category: 'speeches',
          details: {
            before: bookmark.numSpeeches,
            after: currentPol.numSpeeches || 0
          }
        });
      }
    }
  });

  return newNotifications;
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<BookmarkNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const hasCheckedOnStartup = useRef(false);

  useEffect(() => {
    const storedNotifications = localStorage.getItem('plenartrend_notifications');
    if (storedNotifications) {
      const parsed: BookmarkNotification[] = JSON.parse(storedNotifications);
      setNotifications(parsed);
      setUnreadCount(parsed.filter(n => !n.isRead).length);
    }
  }, []);

  useEffect(() => {
    if (hasCheckedOnStartup.current) return;
    hasCheckedOnStartup.current = true;

    const runStartupCheck = async () => {
      console.log('NotificationProvider: Starting startup check for bookmark updates');
      const storedBookmarks = localStorage.getItem('plenartrend_bookmarks');
      if (!storedBookmarks) return;

      const bookmarks: BookmarkItem[] = JSON.parse(storedBookmarks);
      if (bookmarks.length === 0) return;

      // Load existing notifications
      const storedNotifications = localStorage.getItem('plenartrend_notifications');
      const existingNotifications: BookmarkNotification[] = storedNotifications
        ? JSON.parse(storedNotifications)
        : [];

      console.log('NotificationProvider: Running startup check with', bookmarks.length, 'bookmarks');

      try {
        const [topicsRes, polsRes] = await Promise.all([
          fetch('/api/v1/topics'),
          fetch('/api/v1/politicians')
        ]);

        const topicsData = await topicsRes.json();
        const polsData = await polsRes.json();

        const topics = Array.isArray(topicsData) ? topicsData : (topicsData.data || []);
        const pols = Array.isArray(polsData) ? polsData : (polsData.data || []);

        console.log('NotificationProvider: Fetched', topics.length, 'topics,', pols.length, 'politicians');

        const newNotifications = generateStatChangeNotifications(bookmarks, topics, pols, existingNotifications);

        console.log('NotificationProvider: Generated', newNotifications.length, 'new notifications');

        if (newNotifications.length > 0) {
          const updated = [...newNotifications, ...existingNotifications].slice(0, 100);
          setNotifications(updated);
          localStorage.setItem('plenartrend_notifications', JSON.stringify(updated));
          setUnreadCount(updated.filter(n => !n.isRead).length);
        }
      } catch (error) {
        console.error('NotificationProvider: Failed to check for updates on startup', error);
      }
    };

    setTimeout(runStartupCheck, 200);
  }, []);

  const saveNotifications = useCallback((newNotifications: BookmarkNotification[]) => {
    setNotifications(newNotifications);
    localStorage.setItem('plenartrend_notifications', JSON.stringify(newNotifications));
    setUnreadCount(newNotifications.filter(n => !n.isRead).length);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, isRead: true } : n);
      localStorage.setItem('plenartrend_notifications', JSON.stringify(updated));
      setUnreadCount(updated.filter(n => !n.isRead).length);
      return updated;
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, isRead: true }));
      localStorage.setItem('plenartrend_notifications', JSON.stringify(updated));
      setUnreadCount(0);
      return updated;
    });
  }, []);

  const clearNotification = useCallback((id: string) => {
    setNotifications(prev => {
      const updated = prev.filter(n => n.id !== id);
      localStorage.setItem('plenartrend_notifications', JSON.stringify(updated));
      setUnreadCount(updated.filter(n => !n.isRead).length);
      return updated;
    });
  }, []);

  const checkForStatChanges = useCallback((bookmarks: BookmarkItem[], topicsData: any[], politiciansData: any[]) => {
    const newNotifications = generateStatChangeNotifications(bookmarks, topicsData, politiciansData, notifications);

    if (newNotifications.length > 0) {
      const updated = [...newNotifications, ...notifications].slice(0, 100);
      saveNotifications(updated);
    }
  }, [notifications, saveNotifications]);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      clearNotification,
      checkForStatChanges
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
