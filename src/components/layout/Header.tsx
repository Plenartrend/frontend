"use client";

import { Bell, Search, X, ChevronRight, FileText, User as UserIcon, Flag, LogOut, Settings, Menu } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{
    topics: any[];
    politicians: any[];
    campaigns: any[];
  } | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (user) {
      fetch('/api/v1/alerts')
        .then(res => res.json())
        .then(data => setNotifications(data))
        .catch(err => console.error("Failed to fetch notifications", err));
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setSearchResults(null);
      setShowResults(false);
      return;
    }

    try {
      const res = await fetch(`/api/v1/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
        setShowResults(true);
      }
    } catch (err) {
      console.error("Search failed", err);
    }
  };

  const handleResultClick = (path: string) => {
    setShowResults(false);
    setSearchQuery("");
    router.push(path);
  };

  const hasResults = searchResults && (searchResults.topics.length > 0 || searchResults.politicians.length > 0 || searchResults.campaigns.length > 0);

  return (
    <header className="flex h-16 items-center gap-x-3 sm:gap-x-6 border-b border-slate-200 bg-white px-4 sm:px-6 shadow-sm relative z-20">
      <button 
        type="button" 
        className="text-slate-500 lg:hidden hover:text-slate-700 flex-none"
        onClick={onMenuClick}
      >
        <Menu className="h-6 w-6" />
      </button>

      <div className="relative flex-1 min-w-0 max-w-md" ref={searchRef}>
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-5 w-5 text-slate-400" aria-hidden="true" />
        </div>
        <input
          type="text"
          className="block w-full rounded-md border-0 py-1.5 pl-10 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
          placeholder={isMobile ? "Suche..." : "Suche nach Themen, Politikern oder Kampagnen..."}
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => { if (searchQuery) setShowResults(true); }}
        />

        {showResults && (
          <div className="absolute top-full left-0 w-full mt-1 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 max-h-[80vh] overflow-y-auto z-50">
            {hasResults ? (
              <div className="py-2">
                {searchResults.topics.length > 0 && (
                  <div className="px-2 py-2">
                    <h3 className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Themen</h3>
                    {searchResults.topics.map((topic: any) => (
                      <button
                        key={topic.id}
                        onClick={() => handleResultClick(`/topics/${topic.id}`)}
                        className="w-full text-left px-2 py-2 hover:bg-slate-50 rounded-md flex items-center gap-3 group"
                      >
                        <div className="p-1.5 bg-blue-50 text-blue-600 rounded">
                          <FileText className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600">{topic.title}</span>
                        <ChevronRight className="h-4 w-4 text-slate-300 ml-auto" />
                      </button>
                    ))}
                  </div>
                )}

                {searchResults.politicians.length > 0 && (
                  <div className="px-2 py-2 border-t border-slate-100">
                    <h3 className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Abgeordnete</h3>
                    {searchResults.politicians.map((politician: any) => (
                      <button
                        key={politician.id}
                        onClick={() => handleResultClick(`/politicians/${politician.id}`)}
                        className="w-full text-left px-2 py-2 hover:bg-slate-50 rounded-md flex items-center gap-3 group"
                      >
                        <div className="p-1.5 bg-green-50 text-green-600 rounded">
                          <UserIcon className="h-4 w-4" />
                        </div>
                        <div>
                           <p className="text-sm font-medium text-slate-700 group-hover:text-blue-600">{politician.name}</p>
                           <p className="text-xs text-slate-500">{politician.party}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-300 ml-auto" />
                      </button>
                    ))}
                  </div>
                )}

                {searchResults.campaigns.length > 0 && (
                  <div className="px-2 py-2 border-t border-slate-100">
                    <h3 className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Kampagnen</h3>
                    {searchResults.campaigns.map((campaign: any) => (
                      <button
                        key={campaign.id}
                        onClick={() => handleResultClick(`/campaigns/${campaign.id}`)}
                        className="w-full text-left px-2 py-2 hover:bg-slate-50 rounded-md flex items-center gap-3 group"
                      >
                        <div className="p-1.5 bg-amber-50 text-amber-600 rounded">
                          <Flag className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600">{campaign.name}</span>
                        <ChevronRight className="h-4 w-4 text-slate-300 ml-auto" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="px-4 py-6 text-center text-sm text-slate-500">
                Keine Ergebnisse gefunden für "{searchQuery}"
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-x-4 relative flex-none ml-auto">
        {mounted && user && (
          <div className="relative">
            <button 
              type="button" 
              className={`-m-2.5 p-2.5 text-slate-400 hover:text-slate-500 relative ${showNotifications ? 'text-blue-600' : ''}`}
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <span className="sr-only">Benachrichtigungen anzeigen</span>
              <Bell className="h-6 w-6" aria-hidden="true" />
              {notifications.length > 0 && (
                <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-[-40px] sm:right-0 top-full mt-2 w-[calc(100vw-2rem)] sm:w-80 max-w-xs sm:max-w-none origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                 <div className="px-4 py-2 border-b border-slate-100 flex justify-between items-center">
                   <span className="font-semibold text-sm text-slate-900">Benachrichtigungen</span>
                   <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-slate-600">
                     <X className="h-4 w-4" />
                   </button>
                 </div>
                 <div className="max-h-96 overflow-y-auto">
                   {notifications.slice(0, 5).map((n: any) => (
                     <div key={n.id} className="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0">
                       <p className="text-sm font-medium text-slate-900">{n.title}</p>
                       <p className="text-xs text-slate-500 mt-1">{n.message}</p>
                       <p className="text-xs text-slate-400 mt-1">{new Date(n.timestamp).toLocaleDateString('de-DE')}</p>
                     </div>
                   ))}
                 </div>
                 <div className="px-4 py-2 border-t border-slate-100 text-center">
                   <Link href="/alerts" onClick={() => setShowNotifications(false)} className="text-xs font-medium text-blue-600 hover:text-blue-500 block w-full">Alle anzeigen</Link>
                 </div>
              </div>
            )}
          </div>
        )}

        <div className="relative" ref={profileRef}>
          <div 
            className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-sm font-medium text-slate-600 cursor-pointer hover:ring-2 hover:ring-slate-300" 
            title={user?.name || "Gast"}
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            {user?.avatar || "G"}
          </div>

          {showProfileMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
              {user ? (
                <>
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-sm font-medium text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  </div>
                  <div className="block px-4 py-2 text-sm text-slate-400 cursor-not-allowed flex items-center gap-2" title="In Kürze verfügbar">
                    <Settings className="h-4 w-4" /> Einstellungen
                  </div>
                  <button 
                    onClick={() => { logout(); setShowProfileMenu(false); }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" /> Abmelden
                  </button>
                </>
              ) : (
                <Link href="/login" onClick={() => setShowProfileMenu(false)} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                  Anmelden
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
