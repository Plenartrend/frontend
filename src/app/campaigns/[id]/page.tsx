"use client";

import { ChevronRight, Settings, Bell, BarChart2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { TrendChart } from "@/components/ui/TrendChart";
import { TREND_DATA } from "@/lib/mockData";
import { useEffect, useState } from "react";

export default function CampaignDetail() {
  const params = useParams();
  const id = params?.id as string;
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/v1/campaigns/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then(data => {
        setCampaign(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-slate-900">Kampagne nicht gefunden</h2>
      </div>
    );
  }

  const campaignTrend = TREND_DATA;

  return (
    <div className="space-y-6">
      <div>
        <nav className="flex items-center text-sm text-slate-500 mb-2">
          <Link href="/campaigns" className="hover:text-slate-700">Kampagnen</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="font-medium text-slate-900">{campaign.name}</span>
        </nav>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">{campaign.name}</h1>
          <div className="flex space-x-3">
             <button className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50">
              <Settings className="h-4 w-4" />
              Bearbeiten
            </button>
            <button className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500">
              <BarChart2 className="h-4 w-4" />
              Bericht erstellen
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-slate-500">Status</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-slate-900 capitalize">{campaign.status}</dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-slate-500">Fortschritt</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">{campaign.progress}%</dd>
        </div>
         <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-slate-500">Laufzeit (Tage)</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">45</dd>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg bg-white shadow">
          <div className="border-b border-slate-200 px-4 py-5 sm:px-6 flex justify-between items-center">
             <h3 className="text-base font-semibold leading-6 text-slate-900">Themenresonanz</h3>
             <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">Live</span>
          </div>
          <div className="p-6">
             <TrendChart data={campaignTrend} />
          </div>
        </div>

         <div className="rounded-lg bg-white shadow">
          <div className="border-b border-slate-200 px-4 py-5 sm:px-6">
             <h3 className="text-base font-semibold leading-6 text-slate-900">Wichtige Stakeholder</h3>
          </div>
          <ul className="divide-y divide-slate-200">
             <li className="flex items-center justify-between py-4 px-6 hover:bg-slate-50">
               <div className="flex items-center">
                 <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold">MS</div>
                 <div className="ml-3">
                   <p className="text-sm font-medium text-slate-900">Maria Schmidt (CDU)</p>
                   <p className="text-xs text-slate-500">Kritisch • Hoher Einfluss</p>
                 </div>
               </div>
               <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">Dagegen</span>
             </li>
              <li className="flex items-center justify-between py-4 px-6 hover:bg-slate-50">
               <div className="flex items-center">
                 <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold">JW</div>
                 <div className="ml-3">
                   <p className="text-sm font-medium text-slate-900">Julia Weber (Grüne)</p>
                   <p className="text-xs text-slate-500">Verbündete • Mittlerer Einfluss</p>
                 </div>
               </div>
               <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/10">Dafür</span>
             </li>
              <li className="flex items-center justify-between py-4 px-6 hover:bg-slate-50">
               <div className="flex items-center">
                 <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold">TM</div>
                 <div className="ml-3">
                   <p className="text-sm font-medium text-slate-900">Thomas Müller (SPD)</p>
                   <p className="text-xs text-slate-500">Neutral • Hoher Einfluss</p>
                 </div>
               </div>
               <span className="inline-flex items-center rounded-full bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">Neutral</span>
             </li>
          </ul>
        </div>

        <div className="rounded-lg bg-white shadow lg:col-span-2">
           <div className="border-b border-slate-200 px-4 py-5 sm:px-6 flex justify-between items-center">
             <h3 className="text-base font-semibold leading-6 text-slate-900">Aktuelle Alarme</h3>
             <Bell className="h-4 w-4 text-slate-400"/>
          </div>
          <div className="p-6 text-sm text-slate-500">
             <p>Keine kritischen Alarme in den letzten 24 Stunden.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
