import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { ArrowLeft, TrendingUp, Activity, Zap, Users, Shapes } from 'lucide-react';
import { Representative, representatives } from '../data/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface RepresentativeDetailProps {
  representative: Representative;
  onBack: () => void;
}

export function RepresentativeDetail({ representative, onBack }: RepresentativeDetailProps) {
  // Find similar representatives based on themes
  const similarReps = representatives
    .filter(r => r.id !== representative.id)
    .map(rep => {
      const similarity = rep.themes.reduce((acc, theme) => {
        const repTheme = representative.themes.find(t => t.theme === theme.theme);
        if (repTheme) {
          const sentimentDiff = Math.abs(theme.sentiment - repTheme.sentiment);
          return acc + (1 - sentimentDiff);
        }
        return acc;
      }, 0);
      return { ...rep, similarity };
    })
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 3);

  const radarData = representative.themes.map(theme => ({
    theme: theme.theme,
    relevance: theme.relevance,
    sentiment: (theme.sentiment + 1) * 50, // Convert -1 to 1 to 0 to 100
  }));

  // Mock word cloud data (simulated frequent words)
  const wordCloudWords = [
    'Klimaschutz', 'Nachhaltigkeit', 'Erneuerbare', 'CO2', 'Energiewende',
    'Zukunft', 'Verantwortung', 'Investitionen', 'Innovation', 'Gesellschaft',
    'Wirtschaft', 'Sozial', 'Gerechtigkeit', 'Politik', 'Bürger'
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Zurück
        </Button>
        <div>
          <h2 className="text-gray-900">{representative.name}</h2>
          <p className="text-gray-600">{representative.party} • {representative.region}</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Beitragsfaktor</p>
                <p className="text-xl text-gray-900">{representative.activity}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Zap className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Volatilität</p>
                <p className="text-xl text-gray-900">{representative.volatility}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Alter</p>
                <p className="text-xl text-gray-900">{representative.age} Jahre</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Shapes className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Geschlecht</p>
                <p className="text-xl text-gray-900">{representative.gender}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Themes and Positions */}
      <Card>
        <CardHeader>
          <CardTitle>Herzensthemen & Haltungen</CardTitle>
          <CardDescription>Die wichtigsten Themen und Positionen</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {representative.themes.map((theme, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-900">{theme.theme}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant={theme.sentiment > 0 ? 'default' : 'destructive'}>
                      {theme.sentiment > 0 ? 'Pro' : 'Contra'} {Math.abs(Math.round(theme.sentiment * 100))}%
                    </Badge>
                    <span className="text-sm text-gray-600">{theme.relevance}% Relevanz</span>
                  </div>
                </div>
                <Progress value={theme.relevance} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Radar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Themenübersicht</CardTitle>
          <CardDescription>Visualisierung der Themenschwerpunkte</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="theme" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar name="Relevanz" dataKey="relevance" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
              <Radar name="Haltung" dataKey="sentiment" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
              <Legend />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Word Cloud (simulated) */}
      <Card>
        <CardHeader>
          <CardTitle>Wortcluster aus Reden</CardTitle>
          <CardDescription>Häufig verwendete Begriffe in jüngsten Reden</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
            {wordCloudWords.map((word, index) => {
              // eslint-disable-next-line react-hooks/purity
              const size = Math.random() * 2 + 1;
              const colors = ['text-blue-600', 'text-purple-600', 'text-green-600', 'text-orange-600'];
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

      {/* Similar Representatives */}
      <Card>
        <CardHeader>
          <CardTitle>Ähnliche Abgeordnete</CardTitle>
          <CardDescription>Abgeordnete mit ähnlichen Haltungen und Themen</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {similarReps.map(rep => (
              <Card key={rep.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="text-center space-y-2">
                    <p className="text-gray-900">{rep.name}</p>
                    <p className="text-sm text-gray-600">{rep.party}</p>
                    <Badge variant="outline" className="mt-2">
                      {Math.round(rep.similarity * 100)}% Ähnlichkeit
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Aktivitätstrend</CardTitle>
          <CardDescription>Beiträge und Aktivität über Zeit</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={[
                { month: 'Jul', beiträge: 12 },
                { month: 'Aug', beiträge: 15 },
                { month: 'Sep', beiträge: 18 },
                { month: 'Okt', beiträge: 22 },
                { month: 'Nov', beiträge: 19 },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="beiträge" fill="#3b82f6" name="Anzahl Beiträge" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
