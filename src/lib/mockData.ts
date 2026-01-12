import { 
  Topic, 
  Politician, 
  Campaign, 
  Notification, 
  TrendDataPoint, 
  Legislation, 
  SpeechSnippet, 
  PartyPosition, 
  FullSpeech,
  Report
} from '@/types';

const getDynamicDate = (offsetDays = 0, hour = 10) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};


export const TOPICS: Topic[] = [
  { id: 't1', title: 'Energiegesetz 2025', category: 'Energie', relevance: 85, trend: 'up' },
  { id: 't16', title: 'Stromnetzausbau Süd', category: 'Energie', relevance: 74, trend: 'stable' },
  { id: 't17', title: 'Solarpflicht für Neubauten', category: 'Energie', relevance: 62, trend: 'up' },
  { id: 't18', title: 'Kernkraft Rückbau', category: 'Energie', relevance: 40, trend: 'down' },
  { id: 't22', title: 'Fernwärmeausbau', category: 'Energie', relevance: 55, trend: 'up' },
  { id: 't23', title: 'Geothermie-Förderung', category: 'Energie', relevance: 48, trend: 'stable' },
  { id: 't24', title: 'LNG-Terminals Nordsee', category: 'Energie', relevance: 65, trend: 'down' },
  { id: 't2', title: 'Digitalisierung Schulen', category: 'Bildung', relevance: 60, trend: 'stable' },
  { id: 't3', title: 'Verkehrswende', category: 'Verkehr', relevance: 92, trend: 'up' },
  { id: 't19', title: '49-Euro-Ticket Finanzierung', category: 'Verkehr', relevance: 88, trend: 'stable' },
  { id: 't20', title: 'E-Auto Prämie 2.0', category: 'Verkehr', relevance: 70, trend: 'up' },
  { id: 't21', title: 'Sanierung Brückenbau', category: 'Verkehr', relevance: 79, trend: 'stable' },
  { id: 't4', title: 'Agrarreform', category: 'Landwirtschaft', relevance: 45, trend: 'down' },
  { id: 't5', title: 'Pflegefinanzierung', category: 'Gesundheit', relevance: 78, trend: 'stable' },
  { id: 't6', title: 'Verteidigungshaushalt', category: 'Verteidigung', relevance: 88, trend: 'up' },
  { id: 't7', title: 'Mietpreisbremse', category: 'Wohnen', relevance: 72, trend: 'stable' },
  { id: 't8', title: 'KI-Regulierung', category: 'Technologie', relevance: 65, trend: 'up' },
  { id: 't9', title: 'Bahninfrastruktur', category: 'Verkehr', relevance: 81, trend: 'down' },
  { id: 't10', title: 'Steuerreform', category: 'Finanzen', relevance: 55, trend: 'stable' },
  { id: 't11', title: 'Krankenhausreform', category: 'Gesundheit', relevance: 76, trend: 'up' },
  { id: 't12', title: 'Rentenpaket', category: 'Soziales', relevance: 90, trend: 'stable' },
  { id: 't13', title: 'Wasserstoffstrategie', category: 'Energie', relevance: 68, trend: 'down' },
  { id: 't14', title: 'Bürgergeld Anpassung', category: 'Soziales', relevance: 84, trend: 'up' },
  { id: 't15', title: 'Kita-Ausbau', category: 'Familie', relevance: 58, trend: 'stable' },
];

export const POLITICIANS: Politician[] = [
  { 
    id: 'p1', 
    name: 'Dr. Maria Schmidt', 
    party: 'CDU', 
    role: 'MdB', 
    region: 'Berlin', 
    age: 54,
    gender: 'Weiblich',
    volatility: 'Niedrig',
    contributionFactor: 8.5,
    image: '/avatars/p1.png',
    topTopics: [
      { topic: 'Energie', stance: 'Stark dafür' },
      { topic: 'Wirtschaft', stance: 'Dafür' },
      { topic: 'EU', stance: 'Neutral' }
    ],
    similar: ['p4', 'p6']
  },
  { 
    id: 'p2', 
    name: 'Thomas Müller', 
    party: 'SPD', 
    role: 'MdB', 
    region: 'München', 
    age: 42,
    gender: 'Männlich',
    volatility: 'Mittel',
    contributionFactor: 7.2,
    image: '/avatars/p2.png',
    topTopics: [
      { topic: 'Soziales', stance: 'Stark dafür' },
      { topic: 'Arbeit', stance: 'Dafür' },
      { topic: 'Familie', stance: 'Dafür' }
    ],
    similar: ['p3', 'p8']
  },
  { 
    id: 'p3', 
    name: 'Julia Weber', 
    party: 'Grüne', 
    role: 'MdB', 
    region: 'Hamburg', 
    age: 36,
    gender: 'Weiblich',
    volatility: 'Hoch',
    contributionFactor: 9.1,
    image: '/avatars/p3.png',
    topTopics: [
      { topic: 'Umwelt', stance: 'Stark dafür' },
      { topic: 'Verkehr', stance: 'Dafür' },
      { topic: 'Digitales', stance: 'Neutral' }
    ],
    similar: ['p2', 'p11']
  },
  { 
    id: 'p4', 
    name: 'Hans Meier', 
    party: 'FDP', 
    role: 'MdB', 
    region: 'Frankfurt', 
    age: 61,
    gender: 'Männlich',
    volatility: 'Niedrig',
    contributionFactor: 6.8,
    image: '/avatars/p4.png',
    topTopics: [
      { topic: 'Finanzen', stance: 'Stark dafür' },
      { topic: 'Steuern', stance: 'Dagegen' },
      { topic: 'Recht', stance: 'Neutral' }
    ],
    similar: ['p1', 'p7']
  },
  { 
    id: 'p5', 
    name: 'Dr. Sahra Wagenknecht', 
    party: 'BSW', 
    role: 'MdB', 
    region: 'Düsseldorf', 
    age: 55,
    gender: 'Weiblich',
    volatility: 'Hoch',
    contributionFactor: 8.9,
    image: '/avatars/p5.png',
    topTopics: [
      { topic: 'Frieden', stance: 'Stark dafür' },
      { topic: 'Wirtschaft', stance: 'Kritisch' },
      { topic: 'Soziales', stance: 'Dafür' }
    ],
    similar: ['p12']
  },
  { 
    id: 'p6', 
    name: 'Friedrich Merz', 
    party: 'CDU', 
    role: 'Fraktionsvorsitzender', 
    region: 'Hochsauerland', 
    age: 68,
    gender: 'Männlich',
    volatility: 'Mittel',
    contributionFactor: 9.5,
    image: '/avatars/p6.png',
    topTopics: [
      { topic: 'Finanzen', stance: 'Stark dafür' },
      { topic: 'Wirtschaft', stance: 'Dafür' },
      { topic: 'Inneres', stance: 'Stark dafür' }
    ],
    similar: ['p1', 'p4']
  },
  { 
    id: 'p7', 
    name: 'Christian Lindner', 
    party: 'FDP', 
    role: 'Bundesminister', 
    region: 'NRW', 
    age: 45,
    gender: 'Männlich',
    volatility: 'Niedrig',
    contributionFactor: 9.2,
    image: '/avatars/p7.png',
    topTopics: [
      { topic: 'Haushalt', stance: 'Stark dafür' },
      { topic: 'Steuern', stance: 'Dagegen' },
      { topic: 'Digitalisierung', stance: 'Dafür' }
    ],
    similar: ['p4', 'p6']
  },
  { 
    id: 'p8', 
    name: 'Kevin Kühnert', 
    party: 'SPD', 
    role: 'MdB', 
    region: 'Berlin', 
    age: 34,
    gender: 'Männlich',
    volatility: 'Mittel',
    contributionFactor: 7.8,
    image: '/avatars/p8.png',
    topTopics: [
      { topic: 'Wohnen', stance: 'Dafür' },
      { topic: 'Arbeit', stance: 'Stark dafür' },
      { topic: 'Soziales', stance: 'Dafür' }
    ],
    similar: ['p2', 'p3']
  },
  { 
    id: 'p9', 
    name: 'Alice Weidel', 
    party: 'AfD', 
    role: 'Fraktionsvorsitzende', 
    region: 'Baden-Württemberg', 
    age: 45,
    gender: 'Weiblich',
    volatility: 'Hoch',
    contributionFactor: 8.1,
    image: '/avatars/p9.png',
    topTopics: [
      { topic: 'Migration', stance: 'Stark dagegen' },
      { topic: 'EU', stance: 'Kritisch' },
      { topic: 'Energie', stance: 'Dagegen' }
    ],
    similar: []
  },
  { 
    id: 'p10', 
    name: 'Robert Habeck', 
    party: 'Grüne', 
    role: 'Bundesminister', 
    region: 'Schleswig-Holstein', 
    age: 54,
    gender: 'Männlich',
    volatility: 'Mittel',
    contributionFactor: 9.4,
    image: '/avatars/p10.png',
    topTopics: [
      { topic: 'Wirtschaft', stance: 'Dafür' },
      { topic: 'Klima', stance: 'Stark dafür' },
      { topic: 'Energie', stance: 'Dafür' }
    ],
    similar: ['p3', 'p11']
  },
  { 
    id: 'p11', 
    name: 'Ricarda Lang', 
    party: 'Grüne', 
    role: 'MdB', 
    region: 'Baden-Württemberg', 
    age: 30,
    gender: 'Weiblich',
    volatility: 'Mittel',
    contributionFactor: 7.5,
    image: '/avatars/p11.png',
    topTopics: [
      { topic: 'Soziales', stance: 'Stark dafür' },
      { topic: 'Frauen', stance: 'Stark dafür' },
      { topic: 'Klima', stance: 'Dafür' }
    ],
    similar: ['p3', 'p10']
  },
  { 
    id: 'p12', 
    name: 'Gregor Gysi', 
    party: 'Die Linke', 
    role: 'MdB', 
    region: 'Berlin', 
    age: 76,
    gender: 'Männlich',
    volatility: 'Niedrig',
    contributionFactor: 8.0,
    image: '/avatars/p12.png',
    topTopics: [
      { topic: 'Außenpolitik', stance: 'Kritisch' },
      { topic: 'Soziales', stance: 'Stark dafür' },
      { topic: 'Kultur', stance: 'Dafür' }
    ],
    similar: ['p5']
  }
];

export const FULL_SPEECHES: FullSpeech[] = [
  {
    id: 'sp1',
    speakerId: 'p1',
    title: 'Versorgungssicherheit und Energiewende',
    date: '2025-10-15T10:30:00Z',
    duration: '8 Min',
    type: 'Plenarsitzung',
    session: '20. Wahlperiode, 142. Sitzung',
    topicId: 't1',
    relatedTopics: ['Wirtschaft', 'Infrastruktur'],
    sourceUrl: 'https://www.bundestag.de/dokumente/protokolle/plenarprotokolle/plenarprotokoll/-/20/142',
    content: `Sehr geehrte Frau Präsidentin, meine sehr geehrten Damen und Herren,

wir stehen heute vor einer entscheidenden Weichenstellung. Das Energiegesetz 2025 ist nicht weniger als das Fundament unserer zukünftigen wirtschaftlichen Stärke. Aber, und das muss ich hier in aller Deutlichkeit sagen, gut gemeint ist nicht immer gut gemacht.

[HIGHLIGHT]Wir müssen sicherstellen, dass die Versorgungssicherheit nicht gefährdet wird, während wir den Ausbau vorantreiben.[/HIGHLIGHT] Es kann nicht sein, dass wir sehenden Auges in eine Lücke laufen, in der wir zwar hehre Ziele haben, aber keine Kilowattstunden in den Netzen, wenn der Wind nicht weht.

Die Industrie braucht Planungssicherheit. [HIGHLIGHT]Investitionen in neue Technologien dürfen nicht durch überbordende Bürokratie erstickt werden.[/HIGHLIGHT] Wir schlagen daher vor, die Genehmigungsverfahren drastisch zu verkürzen. Nicht in Jahren denken, sondern in Monaten. Das ist der Takt, den die Weltwirtschaft uns vorgibt.

Lassen Sie uns dieses Gesetz so gestalten, dass es Technologieoffenheit atmet und nicht ideologische Scheuklappen. Vielen Dank.`
  },
  {
    id: 'sp2',
    speakerId: 'p3',
    title: 'Die Zeit drängt beim Klimaschutz',
    date: '2025-10-15T11:15:00Z',
    duration: '12 Min',
    type: 'Plenarsitzung',
    session: '20. Wahlperiode, 142. Sitzung',
    topicId: 't1',
    relatedTopics: ['Umwelt', 'Klima'],
    sourceUrl: 'https://www.bundestag.de/dokumente/protokolle/plenarprotokolle/plenarprotokoll/-/20/142',
    content: `Frau Präsidentin, liebe Kolleginnen und Kollegen,

die Vorrednerin hat von Versorgungssicherheit gesprochen. Ich spreche von Überlebenssicherheit. [HIGHLIGHT]Es gibt keine Alternative zum schnellen Ausstieg aus den Fossilen. Jeder Euro in Gas ist ein verlorener Euro.[/HIGHLIGHT]

Wir sehen doch, was passiert. Die Extremwetterereignisse nehmen zu. Die Kosten des Nichtstuns sind um ein Vielfaches höher als die Investitionen, die wir heute tätigen müssen.

Dieses Gesetz ist ein Meilenstein. Es priorisiert endlich die Erneuerbaren als das, was sie sind: Freiheitsenergien. Wir machen uns unabhängig von Autokraten. Wir schaffen Wertschöpfung hier vor Ort, in unseren Kommunen.

[HIGHLIGHT]Wer jetzt bremst, gefährdet den Standort Deutschland.[/HIGHLIGHT] Die Märkte der Zukunft sind grün. Lassen Sie uns diesen Weg mutig gehen.`
  },
  {
    id: 'sp3',
    speakerId: 'p10',
    title: 'Wasserstoff als Chance für die Industrie',
    date: getDynamicDate(-1, 9),
    duration: '15 Min',
    type: 'Regierungserklärung',
    session: '20. Wahlperiode, 145. Sitzung',
    topicId: 't13',
    relatedTopics: ['Industrie', 'Innovation'],
    sourceUrl: 'https://www.bundestag.de/dokumente/protokolle/plenarprotokolle/plenarprotokoll/-/20/145',
    content: `Herr Präsident, meine Damen und Herren,

wir reden oft über Probleme. Heute möchte ich über Lösungen reden. Wasserstoff ist der Schlüsselstoff für die Dekarbonisierung unserer Industrie.

[HIGHLIGHT]Wir werden die Import-Infrastrukturen massiv ausbauen.[/HIGHLIGHT] Das ist keine Träumerei, das ist konkrete Politik. Wir haben Verträge geschlossen, wir bauen Terminals um.

Aber wir müssen auch die heimische Produktion hochfahren. Elektrolyseure müssen "Made in Germany" sein. Das ist die Chance für unseren Maschinenbau.

Lassen Sie uns nicht kleinklein diskutieren. Lassen Sie uns die großen Linien ziehen. Wasserstoff ist die Brücke in das post-fossile Zeitalter der Stahl- und Chemieindustrie.`
  }
];

export const CAMPAIGNS: Campaign[] = [
  { 
    id: 'c1', 
    name: 'Stoppt Fossile Subventionen', 
    status: 'aktiv', 
    goal: 'Subventionen um 50% senken', 
    topicId: 't1',
    progress: 65,
    lastUpdate: '2025-11-01'
  },
  { 
    id: 'c2', 
    name: 'Bessere Schulen Initiative', 
    status: 'entwurf', 
    goal: '1000 Unterschriften sammeln', 
    topicId: 't2',
    progress: 10,
    lastUpdate: '2025-10-20'
  }
];

export const NOTIFICATIONS: Notification[] = [
  { 
    id: 'n1', 
    title: 'Neue Haltung erkannt', 
    message: 'Maria Schmidt hat ihre Position zu Energie geändert', 
    type: 'alert', 
    category: 'Verhalten',
    timestamp: getDynamicDate(0, 10),
    details: {
      before: 'Neutral / Kritisch',
      after: 'Befürwortend (Pro)',
      reason: 'Rede im Plenum vom 09.01.2026 deutet auf Kurswechsel hin.',
      source: 'Plenarprotokoll 20/142',
      speechId: 'sp1'
    }
  },
  { 
    id: 'n2', 
    title: 'Kampagnen Meilenstein', 
    message: 'Stoppt Fossile Subventionen hat 60% Sichtbarkeit erreicht', 
    type: 'info', 
    category: 'Kampagne',
    timestamp: getDynamicDate(-1, 14) 
  },
  { 
    id: 'n3', 
    title: 'Haltungsänderung erkannt', 
    message: 'Robert Habeck hat seine Position zu Wasserstoffstrategie präzisiert', 
    type: 'alert', 
    category: 'Verhalten',
    timestamp: getDynamicDate(-1, 9),
    details: {
      before: 'Unklar / In Prüfung',
      after: 'Stark Befürwortend',
      reason: 'Regierungserklärung zur Wasserstoffstrategie.',
      source: 'Regierungserklärung',
      speechId: 'sp3'
    }
  },
  { 
    id: 'n4', 
    title: 'Gesetzesentwurf veröffentlicht', 
    message: 'Neuer Entwurf zum Digitalpakt 2.0 verfügbar', 
    type: 'info', 
    category: 'Gesetzgebung',
    timestamp: getDynamicDate(-2, 9) 
  },
];

export const TREND_DATA: TrendDataPoint[] = [
  { date: 'Nov 24', value: 20 },
  { date: 'Dez 24', value: 22 },
  { date: 'Jan 25', value: 25 },
  { date: 'Feb 25', value: 28 },
  { date: 'Mär 25', value: 35 },
  { date: 'Apr 25', value: 30 },
  { date: 'Mai 25', value: 45 },
  { date: 'Jun 25', value: 60 },
  { date: 'Jul 25', value: 55 },
  { date: 'Aug 25', value: 50 },
  { date: 'Sep 25', value: 65 },
  { date: 'Okt 25', value: 75 },
];

export const LEGISLATION: Legislation[] = [
  { id: 'l1', topicId: 't1', title: 'Entwurf eines Gesetzes zur Änderung des Erneuerbare-Energien-Gesetzes', status: 'In Beratung', date: '2025-10-15' },
  { id: 'l2', topicId: 't1', title: 'Antrag der CDU/CSU: Energieversorgung sichern', status: 'Abgelehnt', date: '2025-09-22' },
  { id: 'l3', topicId: 't2', title: 'Digitalpakt 2.0', status: 'Verabschiedet', date: '2025-08-10' },
];

export const SPEECHES: SpeechSnippet[] = [
  { id: 's1', topicId: 't1', speaker: 'Dr. Maria Schmidt', party: 'CDU', text: '...müssen wir sicherstellen, dass die Versorgungssicherheit nicht gefährdet wird, während wir den Ausbau vorantreiben...', date: '2025-10-15', fullSpeechId: 'sp1' },
  { id: 's2', topicId: 't1', speaker: 'Julia Weber', party: 'Grüne', text: '...es gibt keine Alternative zum schnellen Ausstieg aus den Fossilen. Jeder Euro in Gas ist ein verlorener Euro...', date: '2025-10-15', fullSpeechId: 'sp2' },
];

export const PARTY_POSITIONS: PartyPosition[] = [
  { party: 'SPD', relevance: 80, sentiment: 20 },
  { party: 'CDU', relevance: 90, sentiment: -30 },
  { party: 'Grüne', relevance: 95, sentiment: 80 },
  { party: 'FDP', relevance: 70, sentiment: 10 },
  { party: 'AfD', relevance: 60, sentiment: -80 },
  { party: 'BSW', relevance: 50, sentiment: -40 },
  { party: 'Linke', relevance: 40, sentiment: 15 }, // Neutral/Positive
];

export const REPORTS: Report[] = [
  { id: 1, name: 'Monatlicher Wirkungsbericht - Oktober 2025', date: '2025-11-01', size: '2.4 MB' },
  { id: 2, name: 'Kampagnenanalyse: Erneuerbare Energien', date: '2025-10-15', size: '1.8 MB' },
  { id: 3, name: 'Zusammenfassung Stakeholder-Engagement Q3', date: '2025-10-01', size: '3.1 MB' },
];
