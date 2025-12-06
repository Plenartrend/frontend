import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { ArrowLeft, Users, FileText } from 'lucide-react';
import { Theme, timeSeriesData, partyPositions, legislationItems, speechExcerpts, representatives } from '../data/mockData';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ThemeDetailProps {
  theme: Theme;
  onBack: () => void;
  onViewSpeech: (speechId: string) => void;
}

export function ThemeDetail({ theme, onBack, onViewSpeech }: ThemeDetailProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState('6m');
  const [chartMode, setChartMode] = useState<'position' | 'relevance'>('position');
  const [partyFilter, setPartyFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');

  // Get representatives most interested in this theme
  const themeReps = representatives
    .map(rep => ({
      ...rep,
      themeData: rep.themes.find(t => t.theme === theme.name),
    }))
    .filter(rep => rep.themeData)
    .sort((a, b) => (b.themeData?.relevance || 0) - (a.themeData?.relevance || 0))
    .slice(0, 6);

  const proReps = themeReps
    .filter(rep => (rep.themeData?.sentiment || 0) > 0.5)
    .slice(0, 3);

  const contraReps = themeReps
    .filter(rep => (rep.themeData?.sentiment || 0) < -0.5)
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Zurück
        </Button>
        <div>
          <h2 className="text-gray-900">{theme.name}</h2>
          <p className="text-gray-600">Detailansicht und Analysen</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm text-gray-600 mb-2 block">Partei</label>
              <Select value={partyFilter} onValueChange={setPartyFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Parteien</SelectItem>
                  <SelectItem value="SPD">SPD</SelectItem>
                  <SelectItem value="CDU">CDU/CSU</SelectItem>
                  <SelectItem value="Grüne">Grüne</SelectItem>
                  <SelectItem value="FDP">FDP</SelectItem>
                  <SelectItem value="Die Linke">Die Linke</SelectItem>
                  <SelectItem value="AfD">AfD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm text-gray-600 mb-2 block">Region</label>
              <Select value={regionFilter} onValueChange={setRegionFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Regionen</SelectItem>
                  <SelectItem value="Berlin">Berlin</SelectItem>
                  <SelectItem value="Bayern">Bayern</SelectItem>
                  <SelectItem value="Hamburg">Hamburg</SelectItem>
                  <SelectItem value="NRW">NRW</SelectItem>
                  <SelectItem value="Sachsen">Sachsen</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time Series Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Relevanz über Zeit</CardTitle>
            <CardDescription>Wie wichtig ist das Thema im Diskurs?</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="relevance" stroke="#3b82f6" name="Relevanz %" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Haltung über Zeit</CardTitle>
            <CardDescription>Wie positiv wird das Thema bewertet?</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[-1, 1]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="sentiment" stroke="#10b981" name="Sentiment" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Party Positions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Positionen nach Partei</CardTitle>
              <CardDescription>Haltung und Relevanz pro Partei</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={chartMode === 'position' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartMode('position')}
              >
                Position
              </Button>
              <Button
                variant={chartMode === 'relevance' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartMode('relevance')}
              >
                Relevanz
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={partyPositions}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="party" />
              <YAxis domain={chartMode === 'position' ? [-1, 1] : [0, 100]} />
              <Tooltip />
              <Legend />
              {chartMode === 'position' ? (
                <Bar dataKey="position" fill="#10b981" name="Position (-1 bis 1)" />
              ) : (
                <Bar dataKey="relevance" fill="#3b82f6" name="Relevanz %" />
              )}
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Pro and Contra Representatives */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Besonders Pro</CardTitle>
            <CardDescription>Abgeordnete mit starker Unterstützung</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {proReps.length > 0 ? (
                proReps.map(rep => (
                  <div key={rep.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="text-gray-900">{rep.name}</p>
                      <p className="text-sm text-gray-600">{rep.party}</p>
                    </div>
                    <Badge variant="outline" className="bg-green-100">
                      +{Math.round((rep.themeData?.sentiment || 0) * 100)}%
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">Keine stark unterstützenden Abgeordneten</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Besonders Contra</CardTitle>
            <CardDescription>Abgeordnete mit starker Ablehnung</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {contraReps.length > 0 ? (
                contraReps.map(rep => (
                  <div key={rep.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                      <p className="text-gray-900">{rep.name}</p>
                      <p className="text-sm text-gray-600">{rep.party}</p>
                    </div>
                    <Badge variant="outline" className="bg-red-100">
                      {Math.round((rep.themeData?.sentiment || 0) * 100)}%
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">Keine stark ablehnenden Abgeordneten</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Legislation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Aktuelle Gesetzesinitiativen
          </CardTitle>
          <CardDescription>Relevante Gesetzesentwürfe und Anträge</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {legislationItems.map(item => (
              <div key={item.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-gray-900">{item.title}</p>
                  <Badge variant="outline">{item.status}</Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>{item.party}</span>
                  <span>•</span>
                  <span>{item.date}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Speech Excerpts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Ausschnitte aus Reden
          </CardTitle>
          <CardDescription>Wichtige Statements zum Thema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {speechExcerpts.map(speech => (
              <div
                key={speech.id}
                className="p-4 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
                onClick={() => onViewSpeech(speech.id)}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div>
                    <p className="text-gray-900">{speech.speaker}</p>
                    <p className="text-sm text-gray-600">{speech.party} • {speech.date}</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">&#34;{speech.excerpt}&#34;</p>
                <p className="text-xs text-blue-600 mt-2">Klicken für vollständige Rede →</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
