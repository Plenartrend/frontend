import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Theme } from '../data/mockData';

interface ThemeOverviewProps {
  themes: Theme[];
  onThemeClick: (themeId: string) => void;
}

export function ThemeOverview({ themes, onThemeClick }: ThemeOverviewProps) {
  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0.5) return 'bg-green-500';
    if (sentiment > 0) return 'bg-green-300';
    if (sentiment > -0.5) return 'bg-red-300';
    return 'bg-red-500';
  };

  const getSentimentLabel = (sentiment: number) => {
    if (sentiment > 0.5) return 'Sehr positiv';
    if (sentiment > 0) return 'Positiv';
    if (sentiment === 0) return 'Neutral';
    if (sentiment > -0.5) return 'Negativ';
    return 'Sehr negativ';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aktuelle Diskursübersicht</CardTitle>
        <CardDescription>
          Die wichtigsten politischen Themen und ihre aktuelle Relevanz
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {themes.map((theme) => (
            <Card
              key={theme.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => onThemeClick(theme.id)}
            >
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <h3 className="text-gray-900">{theme.name}</h3>
                    {getTrendIcon(theme.trend)}
                  </div>

                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Relevanz</span>
                        <span className="text-gray-900">{theme.relevance}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${theme.relevance}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Haltung</span>
                        <span className="text-gray-900">
                          {getSentimentLabel(theme.sentiment)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getSentimentColor(theme.sentiment)}`}
                          style={{
                            width: `${Math.abs(theme.sentiment) * 100}%`,
                            marginLeft: theme.sentiment < 0 ? 'auto' : '0',
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <Badge variant="outline" className="w-full justify-center">
                    Details anzeigen
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
