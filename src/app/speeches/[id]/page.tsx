"use client";

import { ChevronRight, Calendar, Clock, FileText, Share2, Loader2, ExternalLink, ThumbsUp, ThumbsDown, Minus, Info, Landmark } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { BackButton } from "@/components/ui/BackButton";
import { useEffect, useState } from "react";
import { SpeechDetail as SpeechDetailType } from "@/types";
import { formatPublisher, formatSession, formatSpeechTitle } from "@/lib/utils";

export default function SpeechDetail() {
  const params = useParams();
  const id = params?.id as string;
  const [speechData, setSpeechData] = useState<SpeechDetailType | null>(null);
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

  const { speaker, topic, reason, ...speech } = speechData;

  const showSentiment = speech.sentiment && speech.sentiment !== 'unbekannt';
  const showReason = showSentiment && reason && reason !== "";
  const showTopic = topic && topic.id !== '-1' && topic.category !== '';
  const showRelatedTopics = speech.relatedTopics && speech.relatedTopics.length > 0;

  const speakerName = speaker ? `${speaker.firstName} ${speaker.lastName}` : '';
  // Handle initials safely
  const speakerInitials = speaker 
    ? (speaker.firstName.charAt(0) + speaker.lastName.charAt(0)).toUpperCase()
    : '?';

  const publisher = formatPublisher(speech.publisher);
  const session = formatSession(speech.session);
  const displayTitle = formatSpeechTitle(
    speech.publisher,
    speech.title,
    speaker?.firstName || "",
    speaker?.lastName || "",
    speech.date,
    topic?.id,
    topic?.category
  );

  const renderContent = (text: string) => {
    if (!text) return null;

    const isolatedText = text.replace(/(\r?\n)(\([^)]*\))/g, '\n\n$2\n\n');

    const paragraphs = isolatedText.split(/\r?\n\s*\r?\n/);

    return paragraphs.map((paragraph, pIndex) => {
      const cleanedParagraph = paragraph.replace(/\r?\n/g, ' ').trim();
      if (!cleanedParagraph) return null;

      const parts = cleanedParagraph.split(/(\[HIGHLIGHT\].*?\[\/HIGHLIGHT\])/g);
      
      return (
        <p key={pIndex} className="mb-4 last:mb-0">
          {parts.map((part, index) => {
            if (part.startsWith('[HIGHLIGHT]')) {
              const content = part.replace('[HIGHLIGHT]', '').replace('[/HIGHLIGHT]', '');
              return <mark key={index} className="bg-yellow-100 text-slate-900 px-1 rounded">{content}</mark>;
            }
            return <span key={index}>{part}</span>;
          })}
        </p>
      );
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
              <div className="flex flex-wrap items-center gap-y-1 gap-x-2 text-xs sm:text-sm text-blue-600 font-medium">
                 <span className="bg-blue-50 px-2 py-1 rounded-md">{speech.type}</span>
                 {session && (
                    <>
                       <span className="hidden sm:inline">•</span>
                       <span className="w-full sm:w-auto">{session}</span>
                    </>
                 )}
              </div>
              <h1 className="text-xl sm:text-3xl font-bold text-slate-900 leading-tight">{displayTitle}</h1>
           </div>

           {/* Speaker Card */}
           {speaker && (
             <div className="bg-slate-50 rounded-lg p-4 flex items-center gap-4 min-w-[250px] border border-slate-100">
                <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center text-lg font-bold text-slate-600 border-2 border-white shadow-sm">
                   {speakerInitials}
                </div>
                <div>
                   <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Redner</p>
                   <Link href={`/politicians/${speaker.id}`} className="font-bold text-slate-900 hover:text-blue-600 block">
                     {speakerName}
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
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 py-12 px-20">
               <h2 className="text-lg font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Transkript</h2>
               <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed">
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
                  {publisher && (
                     <div className="flex items-start gap-3">
                        <Landmark className="h-5 w-5 text-slate-400 mt-0.5" />
                        <div>
                           <dt className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Herausgeber</dt>
                           <dd className="text-sm font-medium text-slate-900">{publisher}</dd>
                        </div>
                     </div>
                  )}
                  <div className="flex items-start gap-3">
                     <Calendar className="h-5 w-5 text-slate-400 mt-0.5" />
                     <div>
                        <dt className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Datum</dt>
                        <dd className="text-sm font-medium text-slate-900">
                           {new Date(speech.date).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </dd>
                     </div>
                  </div>
                  {speech.duration && (
                     <div className="flex items-start gap-3">
                        <Clock className="h-5 w-5 text-slate-400 mt-0.5" />
                        <div>
                           <dt className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Dauer</dt>
                           <dd className="text-sm font-medium text-slate-900">{speech.duration}</dd>
                        </div>
                     </div>
                  )}
                  {showTopic && topic && (
                     <div className="flex items-start gap-3">
                        <FileText className="h-5 w-5 text-slate-400 mt-0.5" />
                        <div>
                           <dt className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Hauptthema</dt>
                           <dd className="text-sm font-medium">
                              <Link href={`/topics/${topic.id}`} className="text-blue-600 hover:text-blue-800 transition-colors">
                                 {/* TopicRef doesn't have title, only id and category. 
                                     Assuming category is what we want to display or id if category is generic.
                                     Actually, checking spec: TopicRef has category. It does NOT have title.
                                     The old Topic had title. The new TopicRef only has id and category.
                                     This might be a degradation or intended. 
                                     I will display category as the text since title is missing in TopicRef.
                                  */}
                                 {topic.category}
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

            {showSentiment && (() => {
               const getSentimentConfig = (sentiment: string) => {
                  switch (sentiment?.toLowerCase()) {
                    case 'stark positiv': return { color: 'text-green-700 bg-green-50 ring-green-600/20', icon: ThumbsUp, label: 'Stark Positiv' };
                    case 'positiv': return { color: 'text-green-600 bg-green-50 ring-green-600/10', icon: ThumbsUp, label: 'Positiv' };
                    case 'neutral': return { color: 'text-slate-600 bg-slate-50 ring-slate-500/10', icon: Minus, label: 'Neutral' };
                    case 'negativ': return { color: 'text-red-600 bg-red-50 ring-red-600/10', icon: ThumbsDown, label: 'Negativ' };
                    case 'stark negativ': return { color: 'text-red-700 bg-red-50 ring-red-600/20', icon: ThumbsDown, label: 'Stark Negativ' };
                    default: return null;
                  }
               };
               const config = getSentimentConfig(speech.sentiment!);
               if (!config) return null;
               const Icon = config.icon;
               return (
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                     <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">Grundstimmung</h3>
                     <div className={`flex items-center gap-3 p-3 rounded-lg ring-1 ring-inset ${config.color}`}>
                        <Icon className="h-5 w-5" />
                        <span className="font-semibold text-sm">{config.label}</span>
                     </div>
                     {showReason && (
                         <div className="mt-4 pt-4 border-t border-slate-100">
                             <div className="flex gap-2">
                                <Info className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-slate-600 italic">
                                   "{reason}"
                                </p>
                             </div>
                         </div>
                     )}
                  </div>
               );
            })()}

            {showRelatedTopics && (
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
            )}
         </div>
      </div>
    </div>
  );
}