"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Compass, Flag, FileText, Bell, Bookmark, Star, CalendarDays, Loader2, ChevronDown, ChevronRight, Mic, User, Hash, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useWatchlist } from "@/context/WatchlistContext";
import { useEffect, useState } from "react";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { watchedTopics, watchedPoliticians } = useWatchlist();
  const [sessionStatus, setSessionStatus] = useState<any>(null);
  const [quickAccess, setQuickAccess] = useState<{topics: any[], politicians: any[]} | null>(null);
  const [isQuickAccessExpanded, setIsQuickAccessExpanded] = useState(true);
  const [isExplorerExpanded, setIsExplorerExpanded] = useState(true);

  const isExplorerActive = pathname.startsWith('/explorer');

  // Close sidebar on navigation (mobile)
  useEffect(() => {
    if (isOpen && onClose) {
      onClose();
    }
  }, [pathname]);

  useEffect(() => {
    fetch('/api/v1/bundestag/status')
      .then(res => res.json())
      .then(setSessionStatus)
      .catch(err => console.error("Status fetch failed", err));

    if (user && (watchedTopics.length > 0 || watchedPoliticians.length > 0)) {
      Promise.all([
        fetch('/api/v1/topics').then(r => r.json()),
        fetch('/api/v1/politicians').then(r => r.json())
      ]).then(([allTopics, allPols]) => {
        setQuickAccess({
          topics: allTopics.filter((t: any) => watchedTopics.includes(t.id)).slice(0, 3),
          politicians: allPols.filter((p: any) => watchedPoliticians.includes(p.id)).slice(0, 3)
        });
      });
    }
  }, [user, watchedTopics, watchedPoliticians]);

  return (
    <>
      {/* Mobile Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 z-40 bg-slate-900/80 backdrop-blur-sm transition-opacity lg:hidden",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      <div className={cn(
        "fixed inset-y-0 left-0 z-50 flex h-full w-72 flex-col bg-slate-900 text-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-800">
          <span className="font-bold text-2xl tracking-wider">PLENARTREND</span>
          <button 
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
        <nav className="flex-1 px-3 py-4 space-y-1">
          
          <div>
            <button
              onClick={() => setIsExplorerExpanded(!isExplorerExpanded)}
              className={cn(
                "w-full group flex items-center justify-between rounded-md px-3 py-2 text-base font-medium transition-colors",
                isExplorerActive ? "text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )}
            >
              <div className="flex items-center">
                <Compass className={cn("mr-3 h-6 w-6 flex-shrink-0", isExplorerActive ? "text-blue-400" : "text-slate-400 group-hover:text-white")} />
                Explorer
              </div>
              {isExplorerExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
            
            {isExplorerExpanded && (
              <div className="mt-1 space-y-1 pl-10">
                <Link
                  href="/explorer/topics"
                  className={cn(
                    "group flex items-center rounded-md px-3 py-2 text-base font-medium transition-colors",
                    pathname.startsWith('/explorer/topics') ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
                  )}
                >
                  <Hash className="mr-3 h-4 w-4 flex-shrink-0 opacity-70" />
                  Themen
                </Link>
                <Link
                  href="/explorer/politicians"
                  className={cn(
                    "group flex items-center rounded-md px-3 py-2 text-base font-medium transition-colors",
                    pathname.startsWith('/explorer/politicians') ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white" 
                  )}
                >
                  <User className="mr-3 h-4 w-4 flex-shrink-0 opacity-70" />
                  Abgeordnete
                </Link>
                <Link
                  href="/explorer/speeches"
                  className={cn(
                    "group flex items-center rounded-md px-3 py-2 text-base font-medium transition-colors",
                    pathname.startsWith('/explorer/speeches') ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
                  )}
                >
                  <Mic className="mr-3 h-4 w-4 flex-shrink-0 opacity-70" />
                  Reden
                </Link>
              </div>
            )}
          </div>

          {user && (
            <>
              <Link
                href="/watchlist"
                className={cn(
                  "group flex items-center rounded-md px-3 py-2 text-base font-medium transition-colors",
                  pathname === '/watchlist' ? "bg-slate-800 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                )}
              >
                <Bookmark className="mr-3 h-6 w-6 flex-shrink-0 text-slate-400 group-hover:text-white" />
                Merkliste
              </Link>
              <Link
                href="/campaigns"
                className={cn(
                  "group flex items-center rounded-md px-3 py-2 text-base font-medium transition-colors",
                  pathname.startsWith('/campaigns') ? "bg-slate-800 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                )}
              >
                <Flag className="mr-3 h-6 w-6 flex-shrink-0 text-slate-400 group-hover:text-white" />
                Kampagnen
              </Link>
              <Link
                href="/alerts"
                className={cn(
                  "group flex items-center rounded-md px-3 py-2 text-base font-medium transition-colors",
                  pathname === '/alerts' ? "bg-slate-800 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                )}
              >
                <Bell className="mr-3 h-6 w-6 flex-shrink-0 text-slate-400 group-hover:text-white" />
                Benachrichtigungen
              </Link>
              <Link
                href="/reports"
                className={cn(
                  "group flex items-center rounded-md px-3 py-2 text-base font-medium transition-colors",
                  pathname === '/reports' ? "bg-slate-800 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                )}
              >
                <FileText className="mr-3 h-6 w-6 flex-shrink-0 text-slate-400 group-hover:text-white" />
                Berichte
              </Link>
            </>
          )}

          {user && quickAccess && (quickAccess.topics.length > 0 || quickAccess.politicians.length > 0) && (
            <div className="pt-6 mt-6 border-t border-slate-800">
              <button 
                onClick={() => setIsQuickAccessExpanded(!isQuickAccessExpanded)}
                className="w-full flex items-center justify-between px-3 text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2 hover:text-slate-300 transition-colors"
              >
                Schnellzugriff
                {isQuickAccessExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              </button>
              
              {isQuickAccessExpanded && (
                <div className="space-y-1">
                                  {quickAccess.topics.map((topic: any) => (
                                    <Link
                                      key={topic.id}
                                      href={`/topics/${topic.id}`}
                                      className="group flex items-center rounded-md px-3 py-2 text-base font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
                                    >
                                      <Star className="mr-3 h-4 w-4 text-slate-500 group-hover:text-yellow-400" />
                                      <span className="truncate">{topic.title}</span>
                                    </Link>
                                  ))}
                                  {quickAccess.politicians.map((pol: any) => (
                                    <Link
                                      key={pol.id}
                                      href={`/politicians/${pol.id}`}
                                      className="group flex items-center rounded-md px-3 py-2 text-base font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
                                    >
                                      <div className="mr-3 h-4 w-4 rounded-full bg-slate-600 flex items-center justify-center text-[8px] text-white">
                                        {pol.name.charAt(0)}
                                      </div>
                                      <span className="truncate">{pol.name}</span>
                                    </Link>
                                  ))}                </div>
              )}
            </div>
          )}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="rounded-lg bg-slate-800 p-4 border border-slate-700">
            {sessionStatus ? (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <span className="relative flex h-2 w-2">
                    <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", sessionStatus.live ? "bg-red-400" : "bg-slate-400")}></span>
                    <span className={cn("relative inline-flex rounded-full h-2 w-2", sessionStatus.live ? "bg-red-500" : "bg-slate-500")}></span>
                  </span>
                  <span className={cn("text-sm font-semibold uppercase tracking-wide", sessionStatus.live ? "text-red-400" : "text-slate-400")}>
                    {sessionStatus.live ? "Live Sitzung" : "Sitzungsfreie Zeit"}
                  </span>
                </div>
                {sessionStatus.nextDatum && !sessionStatus.live ? (
                   <>
                     <p className="text-sm font-medium text-white mb-1">Nächste Sitzung:</p>
                     <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
                        <CalendarDays className="h-3 w-3" />
                        <span>{new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(sessionStatus.nextDatum))}</span>
                     </div>
                   </>
                ) : (
                   <p className="text-sm font-medium text-white mb-3">
                     {sessionStatus.live ? `${sessionStatus.sitzungsnummer}. Sitzung` : `Letzte: ${sessionStatus.sitzungsnummer}. Sitzung`}
                   </p>
                )}
                
                {!sessionStatus.nextDatum && !sessionStatus.live && (
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <CalendarDays className="h-3 w-3" />
                    <span>
                      Stand: {new Intl.DateTimeFormat('de-DE', { 
                        day: '2-digit', 
                        month: '2-digit', 
                        year: 'numeric' 
                      }).format(new Date(sessionStatus.datum))}
                    </span>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 flex-shrink-0 animate-spin text-slate-500" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
