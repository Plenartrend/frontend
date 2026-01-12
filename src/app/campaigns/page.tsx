"use client";

import { Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

async function getCampaigns() {
  try {
    const res = await fetch('/api/v1/campaigns');
    if (!res.ok) return [];
    return res.json();
  } catch (e) {
    return [];
  }
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCampaigns().then(data => {
      setCampaigns(data);
      setLoading(false);
    });
  }, []);

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
          <h1 className="text-2xl font-bold text-slate-900">Kampagnen</h1>
          <p className="text-sm text-slate-500">Verwalten Sie Ihre Initiativen und verfolgen Sie deren Wirkung.</p>
        </div>
        <Link href="/campaigns/new" className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500">
          <Plus className="h-4 w-4" />
          Kampagne erstellen
        </Link>
      </div>

      <div className="overflow-hidden bg-white shadow sm:rounded-md border border-slate-200">
        <ul role="list" className="divide-y divide-slate-200">
          {campaigns.map((campaign) => (
            <li key={campaign.id}>
              <Link href={`/campaigns/${campaign.id}`} className="block hover:bg-slate-50">
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <p className="truncate text-sm font-medium text-blue-600">{campaign.name}</p>
                    <div className="ml-2 flex flex-shrink-0">
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                        campaign.status === 'aktiv' 
                          ? 'bg-green-50 text-green-700 ring-green-600/20' 
                          : 'bg-yellow-50 text-yellow-800 ring-yellow-600/20'
                      }`}>
                        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-slate-500">
                        Ziel: {campaign.goal}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-slate-500 sm:mt-0">
                      <p>
                        Zuletzt aktualisiert am <time dateTime={campaign.lastUpdate}>{new Date(campaign.lastUpdate).toLocaleDateString('de-DE')}</time>
                      </p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                      <span>Fortschritt</span>
                      <span>{campaign.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-100">
                      <div 
                        className="h-1.5 rounded-full bg-blue-500" 
                        style={{ width: `${campaign.progress}%` }} 
                      />
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
