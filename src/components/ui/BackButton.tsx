"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export function BackButton() {
  const router = useRouter();

  return (
    <button 
      onClick={() => router.back()} 
      className="hover:text-slate-700 flex items-center"
    >
      <ArrowLeft className="h-4 w-4 mr-1" /> Zurück
    </button>
  );
}
