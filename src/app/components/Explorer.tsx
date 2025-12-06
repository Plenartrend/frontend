import { useState } from 'react';
import { ThemeOverview } from './ThemeOverview';
import { ThemeDetail } from './ThemeDetail';
import { RepresentativeDetail } from './RepresentativeDetail';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { themes, representatives, fullSpeeches } from '../data/mockData';
import { TrendingUp, Users, FileText, Calendar } from 'lucide-react';

type ExplorerView = 'overview' | 'theme-detail' | 'representative-detail';

export function Explorer() {
  const [view, setView] = useState<ExplorerView>('overview');
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null);
  const [selectedRepId, setSelectedRepId] = useState<string | null>(null);

  const handleThemeClick = (themeId: string) => {
    setSelectedThemeId(themeId);
    setView('theme-detail');
  };

  const handleRepClick = (repId: string) => {
    setSelectedRepId(repId);
    setView('representative-detail');
  };

  const handleBack = () => {
    setView('overview');
  };

  // Handler for speech clicks - will be passed down to child components
  const handleSpeechClick = (speechId: string) => {
    // This will be handled by parent App component
    window.dispatchEvent(new CustomEvent('view-speech', { detail: speechId }));
  };

  if (view === 'theme-detail' && selectedThemeId) {
    const theme = themes.find(t => t.id === selectedThemeId);
    return theme ? <ThemeDetail theme={theme} onBack={handleBack} onViewSpeech={handleSpeechClick} /> : null;
  }

  if (view === 'representative-detail' && selectedRepId) {
    const rep = representatives.find(r => r.id === selectedRepId);
    return rep ? <RepresentativeDetail representative={rep} onBack={handleBack} /> : null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-gray-900 mb-2">Explorer</h2>
        <p className="text-gray-600">Erkunden Sie verschiedene Themen, Abgeordnete und Regionen</p>
      </div>

      <Tabs defaultValue="themes" className="w-full">
        <TabsList>
          <TabsTrigger value="themes" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Themen
          </TabsTrigger>
          <TabsTrigger value="representatives" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Abgeordnete
          </TabsTrigger>
          <TabsTrigger value="speeches" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Reden
          </TabsTrigger>
        </TabsList>

        <TabsContent value="themes" className="space-y-4">
          <ThemeOverview themes={themes} onThemeClick={handleThemeClick} />
        </TabsContent>

        <TabsContent value="representatives" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Abgeordnete im Bundestag</CardTitle>
              <CardDescription>Filtern Sie nach Partei, Region oder Themen</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {representatives.map((rep) => (
                  <Card
                    key={rep.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => handleRepClick(rep.id)}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-gray-900 mb-1">{rep.name}</p>
                          <p className="text-gray-600">{rep.party}</p>
                        </div>
                        <div className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          {rep.region}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Aktivität:</span>
                          <span className="text-gray-900">{rep.activity}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Volatilität:</span>
                          <span className="text-gray-900">{rep.volatility}%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="speeches" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Letzte Reden
              </CardTitle>
              <CardDescription>Die neuesten Bundestagsreden im Überblick</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {fullSpeeches.slice(0, 3).map((speech) => (
                  <Card
                    key={speech.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleSpeechClick(speech.id)}
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Users className="w-4 h-4 text-gray-600" />
                            <span className="text-gray-900">{speech.speaker}</span>
                            <Badge variant="outline" className="text-xs">{speech.party}</Badge>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">{speech.topic}</p>
                          <p className="text-sm text-gray-600 italic line-clamp-2">
                            "{speech.highlightedExcerpt}...&#34;
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(speech.date).toLocaleDateString('de-DE')}
                            </div>
                            <span>•</span>
                            <Badge variant="secondary" className="text-xs">{speech.type}</Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('view-speech-overview'))}
                className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700 hover:underline"
              >
                Alle Reden anzeigen →
              </button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
