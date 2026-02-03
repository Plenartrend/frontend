"use client";

import { useWatchlist, TopicStats, PoliticianStats } from "@/context/WatchlistContext";
import { Check, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface WatchButtonProps {
  id: string;
  type: 'topic' | 'politician';
  label?: string;
  className?: string;
  topicStats?: TopicStats;
  politicianStats?: PoliticianStats;
}

export function WatchButton({ id, type, label, className, topicStats, politicianStats }: WatchButtonProps) {
  const { toggleTopic, togglePolitician, isTopicWatched, isPoliticianWatched } = useWatchlist();

  const isWatched = type === 'topic' ? isTopicWatched(id) : isPoliticianWatched(id);

  const handleClick = () => {
    if (type === 'topic') {
      toggleTopic(id, topicStats);
    } else {
      togglePolitician(id, politicianStats);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold shadow-sm transition-all duration-200",
        isWatched 
          ? "bg-blue-100 text-blue-700 hover:bg-blue-200 ring-1 ring-inset ring-blue-300" 
          : "bg-blue-600 text-white hover:bg-blue-500",
        className
      )}
    >
      {isWatched ? <Check className="h-4 w-4" /> : <Star className="h-4 w-4" />}
      {label || (isWatched ? "Wird beobachtet" : "Beobachten")}
    </button>
  );
}
