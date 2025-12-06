export interface Theme {
  id: string;
  name: string;
  relevance: number;
  sentiment: number; // -1 to 1
  trend: 'up' | 'down' | 'stable';
}

export interface Representative {
  id: string;
  name: string;
  party: string;
  region: string;
  age: number;
  gender: string;
  activity: number;
  volatility: number;
  themes: { theme: string; sentiment: number; relevance: number }[];
}

export interface Campaign {
  id: string;
  title: string;
  theme: string;
  goal: 'observe' | 'positive' | 'negative';
  status: 'active' | 'watching' | 'completed';
  description: string;
  stakeholders: string[];
  createdAt: Date;
  lastUpdate: Date;
  alerts: Alert[];
}

export interface Alert {
  id: string;
  type: 'position-change' | 'legislation' | 'discourse-shift' | 'activity' | 'media';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  timestamp: Date;
  relatedPerson?: string;
}

export const themes: Theme[] = [
  { id: '1', name: 'Klimaschutz', relevance: 95, sentiment: 0.6, trend: 'up' },
  { id: '2', name: 'Digitalisierung', relevance: 82, sentiment: 0.4, trend: 'up' },
  { id: '3', name: 'Gesundheit', relevance: 88, sentiment: 0.2, trend: 'stable' },
  { id: '4', name: 'Bildung', relevance: 75, sentiment: 0.5, trend: 'up' },
  { id: '5', name: 'Migration', relevance: 78, sentiment: -0.3, trend: 'down' },
  { id: '6', name: 'Wirtschaft', relevance: 91, sentiment: 0.1, trend: 'stable' },
  { id: '7', name: 'Soziales', relevance: 69, sentiment: 0.4, trend: 'up' },
  { id: '8', name: 'Verteidigung', relevance: 84, sentiment: -0.2, trend: 'up' },
];

export const representatives: Representative[] = [
  {
    id: '1',
    name: 'Anna Schmidt',
    party: 'SPD',
    region: 'Berlin',
    age: 45,
    gender: 'Weiblich',
    activity: 87,
    volatility: 23,
    themes: [
      { theme: 'Klimaschutz', sentiment: 0.8, relevance: 92 },
      { theme: 'Soziales', sentiment: 0.7, relevance: 85 },
      { theme: 'Bildung', sentiment: 0.6, relevance: 78 },
    ],
  },
  {
    id: '2',
    name: 'Thomas Müller',
    party: 'CDU',
    region: 'Bayern',
    age: 52,
    gender: 'Männlich',
    activity: 92,
    volatility: 15,
    themes: [
      { theme: 'Wirtschaft', sentiment: 0.7, relevance: 95 },
      { theme: 'Digitalisierung', sentiment: 0.5, relevance: 82 },
      { theme: 'Verteidigung', sentiment: 0.4, relevance: 76 },
    ],
  },
  {
    id: '3',
    name: 'Lisa Weber',
    party: 'Grüne',
    region: 'Hamburg',
    age: 38,
    gender: 'Weiblich',
    activity: 95,
    volatility: 31,
    themes: [
      { theme: 'Klimaschutz', sentiment: 0.95, relevance: 98 },
      { theme: 'Bildung', sentiment: 0.8, relevance: 88 },
      { theme: 'Digitalisierung', sentiment: 0.6, relevance: 72 },
    ],
  },
  {
    id: '4',
    name: 'Michael Fischer',
    party: 'FDP',
    region: 'NRW',
    age: 41,
    gender: 'Männlich',
    activity: 78,
    volatility: 42,
    themes: [
      { theme: 'Digitalisierung', sentiment: 0.9, relevance: 94 },
      { theme: 'Wirtschaft', sentiment: 0.8, relevance: 91 },
      { theme: 'Bildung', sentiment: 0.5, relevance: 68 },
    ],
  },
  {
    id: '5',
    name: 'Sarah Hoffmann',
    party: 'Die Linke',
    region: 'Sachsen',
    age: 36,
    gender: 'Weiblich',
    activity: 85,
    volatility: 28,
    themes: [
      { theme: 'Soziales', sentiment: 0.9, relevance: 96 },
      { theme: 'Gesundheit', sentiment: 0.8, relevance: 89 },
      { theme: 'Migration', sentiment: 0.7, relevance: 82 },
    ],
  },
  {
    id: '6',
    name: 'Peter Wagner',
    party: 'AfD',
    region: 'Brandenburg',
    age: 48,
    gender: 'Männlich',
    activity: 81,
    volatility: 19,
    themes: [
      { theme: 'Migration', sentiment: -0.8, relevance: 93 },
      { theme: 'Verteidigung', sentiment: 0.6, relevance: 84 },
      { theme: 'Wirtschaft', sentiment: 0.3, relevance: 71 },
    ],
  },
];

export const campaigns: Campaign[] = [
  {
    id: '1',
    title: 'Klimaschutzgesetz 2025',
    theme: 'Klimaschutz',
    goal: 'positive',
    status: 'active',
    description: 'Unterstützung für verschärfte CO2-Reduktionsziele',
    stakeholders: ['Anna Schmidt', 'Lisa Weber'],
    createdAt: new Date('2024-10-15'),
    lastUpdate: new Date('2024-11-14'),
    alerts: [
      {
        id: 'a1',
        type: 'position-change',
        priority: 'high',
        title: 'Thomas Müller zeigt positive Tendenz',
        description: 'CDU-Abgeordneter hat in jüngster Rede positiver über Klimaziele gesprochen',
        timestamp: new Date('2024-11-14'),
        relatedPerson: 'Thomas Müller',
      },
      {
        id: 'a2',
        type: 'legislation',
        priority: 'high',
        title: 'Neuer Gesetzesentwurf eingereicht',
        description: 'Grüne haben Änderungsantrag mit schärferen Zielen eingebracht',
        timestamp: new Date('2024-11-13'),
      },
    ],
  },
  {
    id: '2',
    title: 'Digitalisierung Bildung',
    theme: 'Digitalisierung',
    goal: 'observe',
    status: 'watching',
    description: 'Beobachtung der Diskussion um digitale Bildungsinfrastruktur',
    stakeholders: ['Michael Fischer'],
    createdAt: new Date('2024-09-20'),
    lastUpdate: new Date('2024-11-12'),
    alerts: [
      {
        id: 'a3',
        type: 'activity',
        priority: 'medium',
        title: 'Ausschusssitzung angekündigt',
        description: 'Bildungsausschuss plant Sondersitzung zum Thema',
        timestamp: new Date('2024-11-12'),
      },
    ],
  },
];

export const timeSeriesData = [
  { date: 'Jan', relevance: 65, sentiment: 0.3 },
  { date: 'Feb', relevance: 68, sentiment: 0.35 },
  { date: 'Mär', relevance: 72, sentiment: 0.4 },
  { date: 'Apr', relevance: 75, sentiment: 0.45 },
  { date: 'Mai', relevance: 78, sentiment: 0.5 },
  { date: 'Jun', relevance: 82, sentiment: 0.52 },
  { date: 'Jul', relevance: 85, sentiment: 0.55 },
  { date: 'Aug', relevance: 88, sentiment: 0.58 },
  { date: 'Sep', relevance: 91, sentiment: 0.6 },
  { date: 'Okt', relevance: 93, sentiment: 0.62 },
  { date: 'Nov', relevance: 95, sentiment: 0.65 },
];

export const partyPositions = [
  { party: 'SPD', position: 0.6, relevance: 85 },
  { party: 'CDU/CSU', position: 0.2, relevance: 78 },
  { party: 'Grüne', position: 0.9, relevance: 98 },
  { party: 'FDP', position: 0.3, relevance: 72 },
  { party: 'Die Linke', position: 0.7, relevance: 81 },
  { party: 'AfD', position: -0.6, relevance: 65 },
];

export const legislationItems = [
  {
    id: 'l1',
    title: 'Klimaschutzgesetz Änderungsantrag 2025',
    status: 'In Beratung',
    date: '2024-11-10',
    party: 'Grüne',
  },
  {
    id: 'l2',
    title: 'CO2-Steuer Reformgesetz',
    status: 'Erste Lesung',
    date: '2024-11-05',
    party: 'SPD',
  },
  {
    id: 'l3',
    title: 'Erneuerbare Energien Förderung',
    status: 'Ausschuss',
    date: '2024-10-28',
    party: 'Grüne',
  },
];

export const speechExcerpts = [
  {
    id: 's1',
    speaker: 'Lisa Weber',
    party: 'Grüne',
    date: '2024-11-12',
    excerpt: 'Wir müssen jetzt handeln, um unsere Klimaziele zu erreichen. Die Wissenschaft ist eindeutig...',
  },
  {
    id: 's2',
    speaker: 'Thomas Müller',
    party: 'CDU',
    date: '2024-11-08',
    excerpt: 'Klimaschutz ist wichtig, aber wir dürfen die Wirtschaft nicht überfordern...',
  },
  {
    id: 's3',
    speaker: 'Anna Schmidt',
    party: 'SPD',
    date: '2024-11-06',
    excerpt: 'Ein sozial gerechter Klimaschutz muss auch die Arbeitsplätze berücksichtigen...',
  },
];

export interface FullSpeech {
  id: string;
  speaker: string;
  party: string;
  date: string;
  session: string;
  topic: string;
  committee?: string;
  duration: string;
  type: 'Plenarsitzung' | 'Ausschuss' | 'Anhörung';
  fullText: string;
  highlightedExcerpt: string;
  relatedThemes: string[];
  videoUrl?: string;
}

export const fullSpeeches: FullSpeech[] = [
  {
    id: 's1',
    speaker: 'Lisa Weber',
    party: 'Grüne',
    date: '2024-11-12',
    session: '20. Wahlperiode, 142. Sitzung',
    topic: 'Klimaschutzgesetz - Zweite Beratung',
    duration: '12 Min.',
    type: 'Plenarsitzung',
    highlightedExcerpt: 'Wir müssen jetzt handeln, um unsere Klimaziele zu erreichen. Die Wissenschaft ist eindeutig',
    relatedThemes: ['Klimaschutz', 'Umwelt', 'Nachhaltigkeit'],
    fullText: `Frau Präsidentin! Meine sehr geehrten Damen und Herren! Liebe Kolleginnen und Kollegen!

Wir stehen heute vor einer der wichtigsten Entscheidungen dieser Legislaturperiode. Das Klimaschutzgesetz, das wir heute in zweiter Lesung beraten, ist nicht nur ein Gesetzestext – es ist ein Versprechen an die nächste Generation.

Wir müssen jetzt handeln, um unsere Klimaziele zu erreichen. Die Wissenschaft ist eindeutig: Jedes Zehntelgrad zählt. Der IPCC-Bericht hat uns schwarz auf weiß vor Augen geführt, dass wir nur noch ein sehr begrenztes CO2-Budget haben, wenn wir die 1,5-Grad-Grenze nicht überschreiten wollen.

Und was bedeutet das konkret? Es bedeutet, dass wir unsere CO2-Emissionen bis 2030 um mindestens 65 Prozent gegenüber 1990 reduzieren müssen. Es bedeutet, dass wir den Ausbau der erneuerbaren Energien massiv beschleunigen müssen. Und es bedeutet, dass wir endlich einen sozial gerechten Übergang gestalten müssen.

Ich höre immer wieder das Argument, dass Klimaschutz zu teuer sei. Aber ich sage Ihnen: Kein Klimaschutz ist deutlich teurer! Die Flutkatastrophe im Ahrtal hat uns das dramatisch vor Augen geführt. Die Schäden gehen in die Milliarden. Von dem menschlichen Leid ganz zu schweigen.

Deshalb ist dieses Gesetz so wichtig. Es gibt uns einen klaren Pfad vor, es schafft Planungssicherheit für die Wirtschaft und es zeigt, dass Deutschland seiner Verantwortung gerecht wird.

Vielen Dank!`,
  },
  {
    id: 's2',
    speaker: 'Thomas Müller',
    party: 'CDU',
    date: '2024-11-08',
    session: '20. Wahlperiode, 141. Sitzung',
    topic: 'Wirtschaftspolitik und Klimaschutz',
    committee: 'Wirtschaftsausschuss',
    duration: '8 Min.',
    type: 'Ausschuss',
    highlightedExcerpt: 'Klimaschutz ist wichtig, aber wir dürfen die Wirtschaft nicht überfordern',
    relatedThemes: ['Klimaschutz', 'Wirtschaft', 'Energie'],
    fullText: `Sehr geehrter Herr Vorsitzender! Liebe Kolleginnen und Kollegen!

Lassen Sie mich zunächst eines klarstellen: Klimaschutz ist wichtig, aber wir dürfen die Wirtschaft nicht überfordern. Wir brauchen einen ausgewogenen Ansatz, der sowohl ökologische als auch ökonomische Realitäten berücksichtigt.

Die mittelständischen Unternehmen in meinem Wahlkreis fragen mich: Wie sollen wir die ambitionierten Klimaziele erreichen und gleichzeitig wettbewerbsfähig bleiben? Diese Frage müssen wir ernst nehmen.

Natürlich müssen wir den CO2-Ausstoß reduzieren. Aber wir brauchen dafür realistische Zeitpläne und ausreichende Förderung für die Transformation. Kleine und mittlere Unternehmen können nicht von heute auf morgen ihre komplette Produktion umstellen.

Was wir brauchen, ist technologieoffene Förderung, Planungssicherheit und faire Wettbewerbsbedingungen im internationalen Vergleich. Wenn wir unsere Industrie abwürgen, während andere Länder ihre Emissionen weiter erhöhen, ist niemandem geholfen.

Deshalb plädiere ich für einen pragmatischen Ansatz: Ja zu Klimaschutz, aber mit Augenmaß und unter Berücksichtigung der wirtschaftlichen Folgen.`,
  },
  {
    id: 's3',
    speaker: 'Anna Schmidt',
    party: 'SPD',
    date: '2024-11-06',
    session: '20. Wahlperiode, 140. Sitzung',
    topic: 'Sozial gerechter Klimaschutz',
    duration: '10 Min.',
    type: 'Plenarsitzung',
    highlightedExcerpt: 'Ein sozial gerechter Klimaschutz muss auch die Arbeitsplätze berücksichtigen',
    relatedThemes: ['Klimaschutz', 'Soziales', 'Arbeit'],
    fullText: `Frau Präsidentin! Liebe Kolleginnen und Kollegen!

Ein sozial gerechter Klimaschutz muss auch die Arbeitsplätze berücksichtigen. Das ist die Kernbotschaft, die ich heute hier vermitteln möchte.

Wir als Sozialdemokratie stehen für beides: Für ambitionierten Klimaschutz UND für den Schutz der Beschäftigten. Das ist kein Widerspruch, sondern eine Notwendigkeit.

Die Transformation hin zu einer klimaneutralen Wirtschaft wird gelingen, wenn wir die Menschen mitnehmen. Das bedeutet konkret: Qualifizierungsoffensiven für die Beschäftigten in der Automobilindustrie, in der Stahlindustrie, im Maschinenbau. Wir müssen heute die Fachkräfte ausbilden, die morgen die Windräder bauen und die Solaranlagen installieren.

Das bedeutet auch: Strukturwandel aktiv gestalten. In den Braunkohlerevieren haben wir gezeigt, wie das geht. Mit Strukturwandelmitteln, mit Ansiedlung neuer Industrien, mit Investitionen in Infrastruktur.

Und das bedeutet schließlich: Klimaschutz darf nicht zu Lasten der kleinen Einkommen gehen. Deshalb brauchen wir das Klimageld. Deshalb brauchen wir Förderprogramme für energetische Sanierung. Deshalb brauchen wir bezahlbare Mobilität.

Nur so wird Klimaschutz zum Gemeinschaftsprojekt. Nur so werden wir erfolgreich sein.

Vielen Dank!`,
  },
];

export const sessions = [
  {
    id: 'session-142',
    number: 142,
    date: '2024-11-12',
    period: '20. Wahlperiode',
    mainTopics: ['Klimaschutzgesetz', 'Haushaltsberatungen', 'Digitalisierung'],
    speechCount: 48,
    duration: '6 Std. 32 Min.',
  },
  {
    id: 'session-141',
    number: 141,
    date: '2024-11-08',
    period: '20. Wahlperiode',
    mainTopics: ['Wirtschaftspolitik', 'Energiepolitik', 'Bildung'],
    speechCount: 42,
    duration: '5 Std. 18 Min.',
  },
  {
    id: 'session-140',
    number: 140,
    date: '2024-11-06',
    period: '20. Wahlperiode',
    mainTopics: ['Sozialpolitik', 'Klimaschutz', 'Migration'],
    speechCount: 51,
    duration: '7 Std. 12 Min.',
  },
];

export const availableAlertTypes = [
  { id: 'position-change', label: 'Positionsveränderungen relevanter Abgeordneter' },
  { id: 'legislation', label: 'Neue Gesetzesentwürfe oder Änderungsanträge' },
  { id: 'discourse-shift', label: 'Signifikante Diskursveränderungen' },
  { id: 'activity', label: 'Erhöhte Aktivität (z.B. Ausschüsse)' },
  { id: 'media', label: 'Medienevents' },
];