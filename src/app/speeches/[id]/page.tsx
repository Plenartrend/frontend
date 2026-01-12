"use client";

import { ChevronRight, Calendar, Clock, FileText, Share2, Loader2, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { BackButton } from "@/components/ui/BackButton";
import { useEffect, useState } from "react";

export default function SpeechDetail() {
  const params = useParams();
  const id = params?.id as string;
  const [speechData, setSpeechData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/v1/speeches/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then(data => {
        setSpeechData(data);
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

  if (error || !speechData) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-slate-900">Rede nicht gefunden</h2>
        <div className="mt-6">
          <BackButton />
        </div>
      </div>
    );
  }

  const { speaker, topic, ...speech } = speechData;

  const renderContent = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(\[HIGHLIGHT\].*?\[\/HIGHLIGHT\])/g);
    return parts.map((part, index) => {
      if (part.startsWith('[HIGHLIGHT]')) {
        const content = part.replace('[HIGHLIGHT]', '').replace('[/HIGHLIGHT]', '');
        return <mark key={index} className="bg-yellow-100 text-slate-900 px-1 rounded">{content}</mark>;
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="space-y-8">
      {/* Navigation */}
      <nav className="flex items-center text-sm text-slate-500">
        <BackButton />
        <ChevronRight className="h-4 w-4 mx-1" />
        <span className="font-medium text-slate-900">Rede</span>
      </nav>

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <div className="flex flex-col md:flex-row gap-6 justify-between items-center">
           <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2 text-sm text-blue-600 font-medium">
                 <span className="bg-blue-50 px-2 py-1 rounded-md">{speech.type}</span>
                 <span>•</span>
                 <span>{speech.session}</span>
              </div>
              <h1 className="text-3xl font-bold text-slate-900 leading-tight">{speech.title}</h1>
           </div>

           {/* Speaker Card */}
           {speaker && (
             <div className="bg-slate-50 rounded-lg p-4 flex items-center gap-4 min-w-[250px] border border-slate-100">
                <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center text-lg font-bold text-slate-600 border-2 border-white shadow-sm">
                   {speaker.name.split(' ').map((n: string) => n[0]).join('')}
                </div>
                <div>
                   <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Redner</p>
                   <Link href={`/politicians/${speaker.id}`} className="font-bold text-slate-900 hover:text-blue-600 block">
                     {speaker.name}
                   </Link>
                   <p className="text-xs text-slate-500">{speaker.party}</p>
                </div>
             </div>
           )}
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Main Content Column (Left) */}
         <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
               <h2 className="text-lg font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Transkript</h2>
               <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed whitespace-pre-line">
                  {renderContent(speech.content)}
               </div>
            </div>
         </div>

         {/* Info Column (Right Sidebar) */}
         <div className="space-y-6">
            {/* Meta Details Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
               <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">Details zur Rede</h3>
               <dl className="space-y-4">
                  <div className="flex items-start gap-3">
                     <Calendar className="h-5 w-5 text-slate-400 mt-0.5" />
                     <div>
                        <dt className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Datum</dt>
                        <dd className="text-sm font-medium text-slate-900">
                           {new Date(speech.date).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </dd>
                     </div>
                  </div>
                  <div className="flex items-start gap-3">
                     <Clock className="h-5 w-5 text-slate-400 mt-0.5" />
                     <div>
                        <dt className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Dauer</dt>
                        <dd className="text-sm font-medium text-slate-900">{speech.duration}</dd>
                     </div>
                  </div>
                  {topic && (
                     <div className="flex items-start gap-3">
                        <FileText className="h-5 w-5 text-slate-400 mt-0.5" />
                        <div>
                           <dt className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Hauptthema</dt>
                           <dd className="text-sm font-medium">
                              <Link href={`/topics/${topic.id}`} className="text-blue-600 hover:text-blue-800 transition-colors">
                                 {topic.title}
                              </Link>
                           </dd>
                        </div>
                     </div>
                  )}
                  <div className="flex items-start gap-3 pt-2 border-t border-slate-100">
                     <ExternalLink className="h-5 w-5 text-blue-500 mt-0.5" />
                     <div>
                        <dt className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Originalquelle</dt>
                        <dd className="text-sm font-medium">
                           <a 
                              href={speech.sourceUrl || 'https://www.bundestag.de'} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
                           >
                              Bundestag.de <Share2 className="h-3 w-3" />
                           </a>
                        </dd>
                     </div>
                  </div>
               </dl>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
               <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">Verwandte Themen</h3>
               <div className="flex flex-wrap gap-2">
                  {speech.relatedTopics?.map((t: string) => (
                    <span key={t} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm font-medium hover:bg-slate-200 cursor-pointer">
                      {t}
                    </span>
                  ))}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}