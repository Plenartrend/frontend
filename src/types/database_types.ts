// Types that directly map to database tables/columns

export interface BasePolitician {
  id: string;
  name: string;
  party: string;
  role: string;
  numSpeeches?: number;
}

export interface SpeechSnippet {
  id: string;
  topicId: string;
  speaker: string;
  party: string;
  text: string;
  date: string;
  sentiment?: string;
  fullSpeechId?: string;
}

export interface FullSpeech {
  id: string;
  speakerId: string;
  title: string;
  date: string;
  duration: string;
  type: string;
  session: string;
  topicId?: string;
  relatedTopics: string[];
  content: string;
  sentiment?: string;
  sourceUrl?: string;
}

export interface Topic {
  id: string;
  title: string;
  category: string;
  relevance: number;
  trend: 'up' | 'stable' | 'down';
}

export interface Campaign {
  id: string;
  name: string;
  status: string;
  goal: string;
  topicId: string;
  progress: number;
  lastUpdate: string;
}

export interface CampaignInput {
  name: string;
  topicId: string;
  goal: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'alert' | 'info' | 'success';
  category?: string;
  timestamp: string;
  details?: NotificationDetails;
}

export interface NotificationDetails {
  before?: string;
  after?: string;
  reason?: string;
  source?: string;
  speechId?: string;
}

export interface SessionStatus {
  wahlperiode: number;
  sitzungsnummer: string;
  datum: string;
  titel?: string;
  live: boolean;
  label?: string;
  nextDatum?: string | null;
  error?: boolean;
}

export interface Report {
  id: number;
  name: string;
  date: string;
  size: string;
}
