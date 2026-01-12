"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, ChevronLeft, Save, Check, FileText, Target, Users, Upload, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, title: 'Basisdaten', icon: FileText },
  { id: 2, title: 'Thema', icon: Search },
  { id: 3, title: 'Ziele', icon: Target },
  { id: 4, title: 'Stakeholder & Alerts', icon: Users },
  { id: 5, title: 'Dokumente', icon: Upload },
];

export default function NewCampaignPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [topics, setTopics] = useState<any[]>([]);
  const [politicians, setPoliticians] = useState<any[]>([]);
  
  useEffect(() => {
    fetch('/api/v1/topics').then(res => res.json()).then(setTopics);
    fetch('/api/v1/politicians').then(res => res.json()).then(setPoliticians);
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    motivation: '',
    topicId: '',
    goalType: '',
    goalDescription: '',
    selectedStakeholders: [] as string[],
    alertTypes: [] as string[],
    files: null as FileList | null
  });

  const canProceed = () => {
    switch (currentStep) {
      case 1: return formData.name.trim().length > 0;
      case 2: return formData.topicId !== '';
      case 3: return formData.goalType !== '';
      default: return true;
    }
  };

  const handleNext = () => {
    if (canProceed() && currentStep < 5) setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    router.push('/campaigns');
  };

  const toggleStakeholder = (id: string) => {
    setFormData(prev => ({
      ...prev,
      selectedStakeholders: prev.selectedStakeholders.includes(id)
        ? prev.selectedStakeholders.filter(s => s !== id)
        : [...prev.selectedStakeholders, id]
    }));
  };

  const toggleAlert = (type: string) => {
    setFormData(prev => ({
      ...prev,
      alertTypes: prev.alertTypes.includes(type)
        ? prev.alertTypes.filter(a => a !== type)
        : [...prev.alertTypes, type]
    }));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <nav className="flex items-center text-sm text-slate-500">
        <Link href="/campaigns" className="hover:text-slate-700">Kampagnen</Link>
        <ChevronRight className="h-4 w-4 mx-1" />
        <span className="font-medium text-slate-900">Neue Kampagne</span>
      </nav>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">Kampagne erstellen</h1>
        <p className="text-sm text-slate-500">Definieren Sie Ihre Initiative in 5 Schritten.</p>
      </div>

      <div className="relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -z-10" />
        <div className="flex justify-between">
          {STEPS.map((step) => {
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            return (
              <div key={step.id} className="flex flex-col items-center gap-2 bg-slate-50 px-2">
                <div 
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors",
                    isCompleted ? "bg-blue-600 border-blue-600 text-white" :
                    isCurrent ? "bg-white border-blue-600 text-blue-600" :
                    "bg-white border-slate-300 text-slate-400"
                  )}
                >
                  {isCompleted ? <Check className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
                </div>
                <span className={cn("text-xs font-medium", isCurrent ? "text-blue-600 block" : "text-slate-500 hidden sm:block")}>
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white shadow-sm ring-1 ring-slate-900/5 sm:rounded-xl p-8">
        
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-slate-900">Basisinformationen</h2>
            <div>
              <label className="block text-sm font-medium text-slate-900">Kampagnen Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="mt-2 block w-full rounded-md border-0 py-1.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600 sm:text-sm"
                placeholder="z.B. Energie Initiative 2025"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-900">Motivation & Hintergrund</label>
              <textarea
                rows={4}
                value={formData.motivation}
                onChange={e => setFormData({...formData, motivation: e.target.value})}
                className="mt-2 block w-full rounded-md border-0 py-1.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600 sm:text-sm"
                placeholder="Warum starten Sie diese Kampagne?"
              />
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-slate-900">Thema wählen *</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {topics.map(topic => (
                <div 
                  key={topic.id}
                  onClick={() => setFormData({...formData, topicId: topic.id})}
                  className={cn(
                    "p-4 rounded-lg border-2 cursor-pointer transition-all hover:border-blue-300",
                    formData.topicId === topic.id ? "border-blue-600 bg-blue-50" : "border-slate-200"
                  )}
                >
                  <h3 className="font-medium text-slate-900">{topic.title}</h3>
                  <span className="text-xs text-slate-500">{topic.category}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentStep === 3 && (
           <div className="space-y-6">
            <h2 className="text-lg font-semibold text-slate-900">Zieldefinition *</h2>
            <div className="grid grid-cols-1 gap-4">
               {[
                 { id: 'observe', label: 'Beobachtung', desc: 'Nur Daten sammeln und Trends verfolgen.' },
                 { id: 'influence_pos', label: 'Positive Beeinflussung', desc: 'Unterstützung fördern und Zustimmung gewinnen.' },
                 { id: 'influence_neg', label: 'Negative Beeinflussung', desc: 'Gegenmaßnahmen ergreifen und Kritik üben.' }
               ].map(opt => (
                 <div 
                   key={opt.id}
                   onClick={() => setFormData({...formData, goalType: opt.id})}
                   className={cn(
                     "p-4 rounded-lg border-2 cursor-pointer flex items-center justify-between transition-all",
                     formData.goalType === opt.id ? "border-blue-600 bg-blue-50" : "border-slate-200 hover:border-blue-300"
                   )}
                 >
                    <div>
                      <p className="font-medium text-slate-900">{opt.label}</p>
                      <p className="text-sm text-slate-500">{opt.desc}</p>
                    </div>
                    {formData.goalType === opt.id && <Check className="h-5 w-5 text-blue-600" />}
                 </div>
               ))}
            </div>
             <div>
              <label className="block text-sm font-medium text-slate-900">Konkretes Ziel (Optional)</label>
              <textarea
                rows={2}
                value={formData.goalDescription}
                onChange={e => setFormData({...formData, goalDescription: e.target.value})}
                className="mt-2 block w-full rounded-md border-0 py-1.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600 sm:text-sm"
                placeholder="z.B. 50% Zustimmung im Ausschuss erreichen"
              />
            </div>
           </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-8">
            <div>
               <h2 className="text-lg font-semibold text-slate-900 mb-4">Relevante Stakeholder</h2>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-1">
                 {politicians.map(p => (
                   <div 
                     key={p.id}
                     onClick={() => toggleStakeholder(p.id)}
                     className={cn(
                       "flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-colors",
                       formData.selectedStakeholders.includes(p.id) ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500" : "border-slate-200 hover:bg-slate-50"
                     )}
                   >
                      <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                        {p.name.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">{p.name}</p>
                        <p className="text-xs text-slate-500">{p.party}</p>
                      </div>
                      {formData.selectedStakeholders.includes(p.id) && <Check className="h-4 w-4 text-blue-600" />}
                   </div>
                 ))}
               </div>
            </div>

            <div>
               <h2 className="text-lg font-semibold text-slate-900 mb-4">Benachrichtigungen</h2>
               <div className="space-y-3">
                 {[
                   { id: 'stance_change', label: 'Haltungsänderung', desc: 'Benachrichtigung bei Positionswechseln von Stakeholdern' },
                   { id: 'new_legislation', label: 'Neue Gesetze', desc: 'Updates zu neuen Entwürfen im Themenbereich' },
                   { id: 'media_spike', label: 'Mediale Aufmerksamkeit', desc: 'Wenn das Thema plötzlich stark diskutiert wird' }
                 ].map(alert => (
                   <div key={alert.id} className="flex items-start">
                     <div className="flex h-6 items-center">
                       <input
                         type="checkbox"
                         checked={formData.alertTypes.includes(alert.id)}
                         onChange={() => toggleAlert(alert.id)}
                         className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                       />
                     </div>
                     <div className="ml-3">
                       <label className="text-sm font-medium text-slate-900">{alert.label}</label>
                       <p className="text-sm text-slate-500">{alert.desc}</p>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        )}

        {currentStep === 5 && (
          <div className="space-y-6">
             <h2 className="text-lg font-semibold text-slate-900">Dokumente hochladen</h2>
             <div className="mt-2 flex justify-center rounded-lg border border-dashed border-slate-900/25 px-6 py-10">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-slate-300" aria-hidden="true" />
                  <div className="mt-4 flex text-sm leading-6 text-slate-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md bg-white font-semibold text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:text-blue-500"
                    >
                      <span>Datei auswählen</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={(e) => setFormData({...formData, files: e.target.files})} />
                    </label>
                    <p className="pl-1">oder hierher ziehen</p>
                  </div>
                  <p className="text-xs leading-5 text-slate-600">PDF, DOCX bis zu 10MB</p>
                  {formData.files && (
                     <p className="mt-2 text-sm text-green-600 font-medium">
                       {formData.files.length} Datei(en) ausgewählt
                     </p>
                  )}
                </div>
              </div>
          </div>
        )}

      </div>

      <div className="flex justify-between">
        <button
          onClick={handleBack}
          disabled={currentStep === 1}
          className="rounded-md px-4 py-2 text-sm font-semibold text-slate-900 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:invisible flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" /> Zurück
        </button>
        
        {currentStep < 5 ? (
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Weiter <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 flex items-center gap-2 disabled:opacity-50"
          >
             {isSubmitting ? 'Wird erstellt...' : (
               <>
                 <Save className="h-4 w-4" /> Fertigstellen
               </>
             )}
          </button>
        )}
      </div>
    </div>
  );
}
