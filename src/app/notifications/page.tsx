"use client";

import { useNotifications } from "@/context/NotificationContext";
import { useWatchlist } from "@/context/WatchlistContext";
import Link from "next/link";
import { Bell, Clock, X, ExternalLink, CheckCheck, Loader2, TrendingUp, TrendingDown, Activity, Mic } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotification } = useNotifications();
  const { bookmarks } = useWatchlist();
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 300);
  }, []);

  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.isRead)
    : notifications;

  const sortedNotifications = [...filteredNotifications].sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'relevance': return <TrendingUp className="h-4 w-4" />;
      case 'sentiment': return <TrendingDown className="h-4 w-4" />;
      case 'volatility': return <Activity className="h-4 w-4" />;
      case 'contribution': return <Activity className="h-4 w-4" />;
      case 'speeches': return <Mic className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getCategoryLabel = (category?: string) => {
    switch (category) {
      case 'relevance': return 'Relevanz';
      case 'sentiment': return 'Stimmung';
      case 'volatility': return 'Volatilität';
      case 'contribution': return 'Beitragsfaktor';
      case 'speeches': return 'Neue Reden';
      case 'inactive': return 'Inaktiv';
      default: return 'Update';
    }
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'relevance': return 'bg-blue-100 text-blue-700';
      case 'sentiment': return 'bg-amber-100 text-amber-700';
      case 'volatility': return 'bg-purple-100 text-purple-700';
      case 'contribution': return 'bg-indigo-100 text-indigo-700';
      case 'speeches': return 'bg-green-100 text-green-700';
      default: return 'bg-slate-100 text-slate-700';
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
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Benachrichtigungen</h1>
          <p className="text-sm text-slate-500">
            Updates zu Ihren beobachteten Themen und Abgeordneten.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-md shadow-sm">
            <button
              onClick={() => setFilter('all')}
              className={cn(
                "px-3 py-2 text-sm font-medium rounded-l-md border transition-colors",
                filter === 'all'
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
              )}
            >
              Alle ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={cn(
                "px-3 py-2 text-sm font-medium rounded-r-md border-t border-r border-b transition-colors",
                filter === 'unread'
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
              )}
            >
              Ungelesen ({unreadCount})
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
            >
              <CheckCheck className="h-4 w-4" />
              Alle als gelesen
            </button>
          )}
        </div>
      </div>

      {sortedNotifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-lg border border-slate-200">
          <div className="bg-slate-100 p-4 rounded-full mb-4">
            <Bell className="h-8 w-8 text-slate-400" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900">
            {filter === 'unread' ? 'Keine ungelesenen Benachrichtigungen' : 'Keine Benachrichtigungen'}
          </h2>
          <p className="mt-2 text-slate-500 max-w-sm">
            {filter === 'unread'
              ? 'Alle Benachrichtigungen wurden gelesen.'
              : 'Sobald Sie Themen oder Abgeordnete beobachten, erscheinen hier Benachrichtigungen über Updates.'
            }
          </p>
          {notifications.length === 0 && (
            <Link
              href="/watchlist"
              className="mt-6 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
            >
              Zur Merkliste
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {sortedNotifications.map((notification) => {
            const bookmark = bookmarks.find(
              b => b.id === notification.bookmarkId && b.type === notification.type
            );

            return (
              <div
                key={notification.id}
                className={cn(
                  "bg-white p-5 rounded-lg shadow-sm border transition-all hover:shadow-md",
                  notification.isRead
                    ? "border-slate-200 opacity-80"
                    : "border-blue-200 bg-blue-50/20 ring-1 ring-blue-100"
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <div className={cn(
                        "flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-medium",
                        notification.type === 'topic'
                          ? "bg-purple-100 text-purple-700"
                          : "bg-green-100 text-green-700"
                      )}>
                        {notification.type === 'topic' ? '📄 Thema' : '👤 Abgeordneter'}
                      </div>

                      {notification.category && (
                        <div className={cn(
                          "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium",
                          getCategoryColor(notification.category)
                        )}>
                          {getCategoryIcon(notification.category)}
                          {getCategoryLabel(notification.category)}
                        </div>
                      )}

                      {!notification.isRead && (
                        <span className="inline-flex items-center rounded-full bg-blue-500 px-2.5 py-0.5 text-[10px] font-semibold text-white">
                          NEU
                        </span>
                      )}

                      <div className="flex items-center gap-1.5 text-xs text-slate-500 ml-auto">
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(notification.timestamp).toLocaleDateString('de-DE', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>

                    <h3 className="font-semibold text-slate-900 mb-1.5 text-lg">
                      {notification.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed mb-3">
                      {notification.message}
                    </p>

                    {/* Show before/after details if available */}
                    {notification.details && (notification.details.before !== undefined || notification.details.after !== undefined) && (
                      <div className="flex items-center gap-3 mb-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <div className="text-center">
                          <p className="text-[10px] text-slate-500 uppercase font-semibold mb-1">Vorher</p>
                          <p className="text-sm font-bold text-slate-700">{notification.details.before}</p>
                        </div>
                        <div className="text-slate-400">→</div>
                        <div className="text-center">
                          <p className="text-[10px] text-blue-600 uppercase font-semibold mb-1">Nachher</p>
                          <p className="text-sm font-bold text-blue-700">{notification.details.after}</p>
                        </div>
                      </div>
                    )}

                    {bookmark && (
                      <div className="text-xs text-slate-500 mb-3 bg-slate-50 px-3 py-2 rounded border border-slate-100">
                        <span className="font-medium">Zuletzt besucht:</span>{' '}
                        {new Date(bookmark.lastVisited).toLocaleDateString('de-DE', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <Link
                        href={notification.targetUrl}
                        onClick={() => markAsRead(notification.id)}
                        className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                      >
                        Jetzt ansehen
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>

                      {!notification.isRead && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors"
                        >
                          Als gelesen markieren
                        </button>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => clearNotification(notification.id)}
                    className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors p-1"
                    title="Benachrichtigung entfernen"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {bookmarks.length > 0 && (
        <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-lg">
          <div className="flex items-start gap-3">
            <Bell className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-blue-900 mb-1">
                Über Benachrichtigungen
              </h3>
              <p className="text-sm text-blue-700">
                Sie erhalten automatisch Benachrichtigungen wenn sich bei Ihren beobachteten Themen
                die Relevanz ({">"} 10%) oder Stimmung ({">"} 0.2) ändert, oder wenn Abgeordnete
                neue Reden halten oder ihr Verhalten (Volatilität, Beitragsfaktor) sich ändert.
              </p>
              <Link
                href="/watchlist"
                className="inline-block mt-2 text-sm font-medium text-blue-600 hover:text-blue-800 underline"
              >
                Zur Merkliste →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
