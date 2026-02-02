export interface TrendDataPoint {
  date: string;
  value: number;
}

export interface BookmarkItem {
  id: string;
  type: 'topic' | 'politician';
  bookmarkedAt: string;
  lastVisited: string;
}

export interface BookmarkNotification {
  id: string;
  bookmarkId: string;
  type: 'topic' | 'politician';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  targetUrl: string;
}

export interface SpeechSnippet {
  id: string;
  topicId: string;
  speaker: string;
  party: string;
  text: string;
  date: string;
  sentiment?: "stark positiv" | "positiv" | "neutral" | "negativ" | "stark negativ" | "unbekannt";
  fullSpeechId?: string;
}

export interface PartyPosition {
  party: string;
  relevance: number;
  sentiment: number;
}

export interface TopTopic {
  topic: string;
  stance: string;
  sentiment?: number;
  speechCount?: number;
}

export interface Politician {
  id: string;
  name: string;
  party: string;
  role: string;
  volatility: string;
  contributionFactor: 'low' | 'medium' | 'high';
  topTopics?: TopTopic[];
  numSpeeches?: number;
}

export interface Topic {
  id: string;
  title: string;
  category: string;
  relevance: number;
  trend: 'up' | 'stable' | 'down';
}

export interface TopicDetail extends Topic {
  speeches: SpeechSnippet[];
  partyPositions: PartyPosition[];
  stakeholders: {
    pro: Politician[];
    contra: Politician[];
  };
}

export interface FullSpeech {
  id: string;
  publisher?: string;
  speakerId: string;
  title: string;
  date: string;
  duration?: string;
  type: string;
  session: string;
  topicId?: string;
  relatedTopics: string[];
  content: string;
  sentiment?: "stark positiv" | "positiv" | "neutral" | "negativ" | "stark negativ" | "unbekannt";
  sourceUrl?: string;
}

export interface Speech {
  id: string;
  publisher?: string;
  type: string;
  title: string;
  date: string;
  speaker: PoliticianRef;
  topic?: TopicRef;
  session: string;
}

export interface PaginatedSpeeches {
  data: Speech[];
  total_items: number;
  page: number;
  page_size: number;
}

export interface PoliticianRef {
  id: string;
  firstName: string;
  lastName: string;
  party: string;
}

export interface TopicRef {
  id: string;
  category: string;
}

export interface SpeechDetail extends FullSpeech {
  speaker?: PoliticianRef;
  topic?: TopicRef;
  reason?: string;
}

export interface PoliticianDetail extends Politician {
  speeches: FullSpeech[];
  activityData: TrendDataPoint[];
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

export interface NotificationDetails {
  before?: string;
  after?: string;
  reason?: string;
  source?: string;
  speechId?: string;
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

export interface SearchResults {
  topics: Topic[];
  politicians: Politician[];
  campaigns: Campaign[];
}

export interface Report {
  id: number;
  name: string;
  date: string;
  size: string;
}