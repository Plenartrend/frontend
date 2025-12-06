import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowLeft, MapPin, Users, TrendingUp } from 'lucide-react';
import { representatives, themes } from '../data/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface RegionDetailProps {
  region: string;
  onBack: () => void;
}

export function RegionDetail({ region, onBack }: RegionDetailProps) {
  const regionReps = representatives.filter(r => r.region === region);

  // Calculate region's theme preferences
  const regionThemes = themes.map(theme => {
    const repsWithTheme = regionReps
      .map(rep => rep.themes.find(t => t.theme === theme.name))
      .filter(Boolean);

    const avgSentiment = repsWithTheme.length > 0
      ? repsWithTheme.reduce((acc, t) => acc + (t?.sentiment || 0), 0) / repsWithTheme.length
      : 0;

    const avgRelevance = repsWithTheme.length > 0
      ? repsWithTheme.reduce((acc, t) => acc + (t?.relevance || 0), 0) / repsWithTheme.length
      : 0;

    return {
      theme: theme.name,
      sentiment: avgSentiment,
      relevance: avgRelevance,
    };
  }).sort((a, b) => b.relevance - a.relevance);

  // Party distribution
  const partyDistribution = regionReps.reduce((acc, rep) => {
    acc[rep.party] = (acc[rep.party] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const partyData = Object.entries(partyDistribution).map(([party, count]) => ({
    party,
    anzahl: count,
  }));

  // Mock word cloud for region
  const regionWords = [
    'Infrastruktur', 'Wirtschaft', 'Bildung', 'Entwicklung', 'Innovation',
    'Gemeinschaft', 'Zukunft', 'Investitionen', 'Förderung', 'Regional',
    'Arbeitsplätze', 'Kultur', 'Nachhaltigkeit', 'Digitalisierung'
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Zurück
        </Button>
        <div>
          <h2 className="text-gray-900 flex items-center gap-2">
            <MapPin className="w-6 h-6" />
            {region}
          </h2>
          <p className="text-gray-600">Regionale Politikübersicht</p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Abgeordnete</p>
                <p className="text-xl text-gray-900">{regionReps.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Ø Aktivität</p>
                <p className="text-xl text-gray-900">
                  {Math.round(regionReps.reduce((acc, r) => acc + r.activity, 0) / regionReps.length)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <MapPin className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Parteien</p>
                <p className="text-xl text-gray-900">{Object.keys(partyDistribution).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Representatives */}
      <Card>
        <CardHeader>
          <CardTitle>Abgeordnete aus {region}</CardTitle>
          <CardDescription>Alle Abgeordneten dieser Region</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {regionReps.map(rep => (
              <Card key={rep.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div>
                      <p className="text-gray-900 mb-1">{rep.name}</p>
                      <Badge variant="outline">{rep.party}</Badge>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Aktivität:</span>
                        <span className="text-gray-900">{rep.activity}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Alter:</span>
                        <span className="text-gray-900">{rep.age} Jahre</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Party Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Parteienverteilung</CardTitle>
          <CardDescription>Anzahl der Abgeordneten pro Partei</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={partyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="party" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="anzahl" fill="#3b82f6" name="Anzahl Abgeordnete" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Regional Themes */}
      <Card>
        <CardHeader>
          <CardTitle>Regionale Themenschwerpunkte</CardTitle>
          <CardDescription>Wichtigste Themen und durchschnittliche Haltung</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {regionThemes.slice(0, 5).map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-900">{item.theme}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant={item.sentiment > 0 ? 'default' : 'destructive'}>
                      {item.sentiment > 0 ? '+' : ''}{Math.round(item.sentiment * 100)}%
                    </Badge>
                    <span className="text-sm text-gray-600">
                      Relevanz: {Math.round(item.relevance)}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${item.relevance}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Word Cloud */}
      <Card>
        <CardHeader>
          <CardTitle>Wortcluster der Region</CardTitle>
          <CardDescription>Häufige Begriffe in Reden aus {region}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 p-6 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg">
            {regionWords.map((word, index) => {
              // eslint-disable-next-line react-hooks/purity
              const size = Math.random() * 1.5 + 1;
              const colors = ['text-blue-600', 'text-green-600', 'text-purple-600', 'text-orange-600'];
              const color = colors[index % colors.length];
              return (
                <span
                  key={index}
                  className={`${color} cursor-pointer hover:opacity-70 transition-opacity`}
                  style={{ fontSize: `${size}rem` }}
                >
                  {word}
                </span>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Theme Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Themendetails</CardTitle>
          <CardDescription>Relevanz und Haltung im Vergleich</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={regionThemes.slice(0, 6)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="theme" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="relevance" fill="#3b82f6" name="Relevanz %" />
              <Bar dataKey="sentiment" fill="#10b981" name="Haltung (-100 bis 100)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
