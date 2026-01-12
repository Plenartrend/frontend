"use client";

import { Bell, Info, AlertTriangle, CheckCircle, ChevronDown, ChevronRight, Calendar, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const ALERT_TYPES = {
  all: "Alle",
  alert: "Warnung",
  info: "Info",
  success: "Erfolg"
};

async function getAlerts() {
  try {
    const res = await fetch('/api/v1/alerts');
    if (!res.ok) return [];
    return res.json();
  } catch (e) {
    return [];
  }
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("all");
  const [groupedNotifications, setGroupedNotifications] = useState<Record<string, any[]>>({});
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({});
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    getAlerts().then(data => {
      setAlerts(data);
      setLoading(false);
    });
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'alert': return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'info': return <Info className="h-5 w-5 text-blue-600" />;
      case 'success': return <CheckCircle className="h-5 w-5 text-green-600" />;
      default: return <Bell className="h-5 w-5 text-slate-500" />;
    }
  };

  const getBgColor = (type: string) => {
     switch (type) {
      case 'alert': return 'bg-red-50';
      case 'info': return 'bg-blue-50';
      case 'success': return 'bg-green-50';
      default: return 'bg-slate-50';
    }
  };

  useEffect(() => {
    if (loading) return;

    const groups = alerts.reduce((acc, notification) => {
      if (filterType !== "all" && notification.type !== filterType) return acc;

      const date = new Date(notification.timestamp);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      let dateKey = date.toLocaleDateString('de-DE');
      if (date.toDateString() === today.toDateString()) dateKey = 'Heute';
      else if (date.toDateString() === yesterday.toDateString()) dateKey = 'Gestern';

      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(notification);
      return acc;
    }, {} as Record<string, any[]>);

    setGroupedNotifications(groups);
    
    const newExpandedState = Object.keys(groups).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {} as Record<string, boolean>);
    
    setExpandedDates(newExpandedState);

  }, [filterType, alerts, loading]);

  const toggleDate = (date: string) => {
    setExpandedDates(prev => ({ ...prev, [date]: !prev[date] }));
  };

  const toggleItem = (id: string) => {
    setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Benachrichtigungen</h1>
          <p className="text-sm text-slate-500">Bleiben Sie auf dem Laufenden über wichtige Änderungen und Updates.</p>
        </div>
        <div className="flex items-center gap-2">
           <div className="relative inline-block text-left">
              <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 pl-3 pr-8 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6 font-sans"
              >
                {Object.entries(ALERT_TYPES).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
           </div>
        </div>
      </div>

      <div className="space-y-4">
        {Object.keys(groupedNotifications).length > 0 ? (
          Object.entries(groupedNotifications).map(([date, notifications]) => (
            <div key={date} className="bg-white shadow rounded-lg border border-slate-200 overflow-hidden">
               <button 
                onClick={() => toggleDate(date)}
                className="w-full px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between hover:bg-slate-100 transition-colors"
               >
                 <div className="flex items-center gap-2 font-semibold text-slate-700">
                    <Calendar className="h-4 w-4 text-slate-500" />
                    {date}
                    <span className="bg-slate-200 text-slate-600 text-xs px-2 py-0.5 rounded-full">{notifications.length}</span>
                 </div>
                 {expandedDates[date] ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
               </button>
               
               {expandedDates[date] && (
                 <ul className="divide-y divide-slate-100">
                  {notifications.map((notification) => {
                    const isBehaviorChange = notification.category === 'Verhalten';
                    const isItemExpanded = expandedItems[notification.id];

                    return (
                    <li key={notification.id} className="flex flex-col">
                      <div 
                        onClick={() => isBehaviorChange && toggleItem(notification.id)}
                        className={cn(
                          "p-4 flex gap-4 transition-colors",
                          isBehaviorChange ? "cursor-pointer hover:bg-slate-50" : "bg-white"
                        )}
                      >
                        <div className={cn("h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0", getBgColor(notification.type))}>
                          {getIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                               <p className="text-sm font-medium text-slate-900">{notification.title}</p>
                               {isBehaviorChange && (
                                 <span className="inline-flex items-center rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                                   Verhaltensänderung
                                 </span>
                               )}
                            </div>
                            <span className="text-xs text-slate-400 whitespace-nowrap ml-2">
                              {new Date(notification.timestamp).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-sm text-slate-500 mt-1">{notification.message}</p>
                          
                          {isBehaviorChange && (
                             <div className="mt-2 flex items-center text-xs text-blue-600 font-medium">
                               {isItemExpanded ? 'Details ausblenden' : 'Klicken für Details zur Änderung'}
                               {isItemExpanded ? <ChevronDown className="ml-1 h-3 w-3" /> : <ChevronRight className="ml-1 h-3 w-3" />}
                             </div>
                          )}
                        </div>
                      </div>

                      {isBehaviorChange && isItemExpanded && (
                        <div className="px-4 pb-5 ml-14">
                           <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Analyse der Positionsänderung</h4>
                              
                              <div className="flex flex-col sm:flex-row items-center gap-3 mb-4">
                                 <div className="flex-1 w-full space-y-1">
                                    <p className="text-[10px] text-slate-500 font-semibold uppercase">Vorher</p>
                                    <div className="p-2 bg-white rounded border border-slate-200 text-sm text-slate-700 shadow-sm">
                                       {notification.details?.before}
                                    </div>
                                 </div>
                                 
                                 <div className="flex flex-col items-center justify-center pt-4">
                                    <ArrowRight className="h-4 w-4 text-slate-300" />
                                 </div>
                                 
                                 <div className="flex-1 w-full space-y-1">
                                    <p className="text-[10px] text-blue-600 font-semibold uppercase">Nachher</p>
                                    <div className="p-2 bg-white rounded border border-slate-200 text-sm text-slate-700 shadow-sm font-medium">
                                       {notification.details?.after}
                                    </div>
                                 </div>
                              </div>

                              <div className="space-y-3 pt-3 border-t border-slate-200">
                                 <div>
                                    <p className="text-[10px] text-slate-500 font-semibold uppercase">Begründung / Indikator</p>
                                    <p className="text-sm text-slate-700 mt-1">{notification.details?.reason}</p>
                                 </div>
                                 <div>
                                    <p className="text-[10px] text-slate-500 font-semibold uppercase">Quelle</p>
                                    {notification.details?.speechId ? (
                                       <Link href={`/speeches/${notification.details.speechId}`} className="text-xs text-blue-600 mt-1 underline cursor-pointer hover:text-blue-800">
                                          {notification.details?.source}
                                       </Link>
                                    ) : (
                                       <p className="text-xs text-blue-600 mt-1 underline cursor-pointer">{notification.details?.source}</p>
                                    )}
                                 </div>
                              </div>
                           </div>
                        </div>
                      )}
                    </li>
                  )})}
                </ul>
               )}
            </div>
          ))
        ) : (
           <div className="text-center py-12 bg-white rounded-lg shadow border border-slate-200">
             <div className="mx-auto h-12 w-12 text-slate-300 flex items-center justify-center bg-slate-50 rounded-full">
                <Bell className="h-6 w-6" />
             </div>
             <h3 className="mt-2 text-sm font-semibold text-slate-900">Keine Benachrichtigungen</h3>
             <p className="mt-1 text-sm text-slate-500">Es gibt keine neuen Meldungen in dieser Kategorie.</p>
           </div>
        )}
      </div>
    </div>
  );
}
