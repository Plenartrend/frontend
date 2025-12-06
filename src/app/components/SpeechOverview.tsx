import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Calendar, Clock, FileText, TrendingUp, Users } from 'lucide-react';
import { sessions, fullSpeeches } from '../data/mockData';

interface SpeechOverviewProps {
  onViewSpeech: (speechId: string) => void;
}

export function SpeechOverview({ onViewSpeech }: SpeechOverviewProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-gray-900 mb-2">Reden im Bundestag</h2>
        <p className="text-gray-600">Alle Reden gruppiert nach Sitzung mit Themenzusammenfassungen</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Sitzungen</p>
                <p className="text-xl text-gray-900">{sessions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Reden gesamt</p>
                <p className="text-xl text-gray-900">
                  {sessions.reduce((acc, s) => acc + s.speechCount, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Top Thema</p>
                <p className="text-gray-900">Klimaschutz</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Gesamtdauer</p>
                <p className="text-gray-900">19 Std.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sessions List */}
      <div className="space-y-6">
        {sessions.map((session) => {
          const sessionSpeeches = fullSpeeches.filter(s => s.session === `${session.period}, ${session.number}. Sitzung`);

          return (
            <Card key={session.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-3 mb-2">
                      <Calendar className="w-5 h-5" />
                      {session.number}. Sitzung - {session.period}
                    </CardTitle>
                    <CardDescription>
                      {new Date(session.date).toLocaleDateString('de-DE', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        weekday: 'long'
                      })}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="mb-2">{session.speechCount} Reden</Badge>
                    <p className="text-sm text-gray-600">{session.duration}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Main Topics Summary */}
                <div>
                  <p className="text-sm text-gray-600 mb-2">Hauptthemen dieser Sitzung:</p>
                  <div className="flex flex-wrap gap-2">
                    {session.mainTopics.map((topic, idx) => (
                      <Badge key={idx} variant="secondary">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Speeches from this session */}
                {sessionSpeeches.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-3">Verfügbare Reden:</p>
                    <div className="space-y-3">
                      {sessionSpeeches.map((speech) => (
                        <Card
                          key={speech.id}
                          className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => onViewSpeech(speech.id)}
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
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <Badge>{speech.type}</Badge>
                                <div className="flex items-center gap-1 text-xs text-gray-600">
                                  <Clock className="w-3 h-3" />
                                  {speech.duration}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Theme Analysis */}
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-blue-900 mb-1">Themenzusammenfassung</p>
                        <p className="text-sm text-blue-700">
                          {session.number === 142 && 'Schwerpunkt auf Klimaschutz mit intensiven Debatten über das neue Klimaschutzgesetz. Weitere wichtige Themen: Haushaltsberatungen für 2025 und Digitalisierungsstrategien.'}
                          {session.number === 141 && 'Wirtschafts- und Energiepolitik dominierten die Sitzung. Diskussionen über Wettbewerbsfähigkeit im Kontext der Energiewende und Bildungsreformen.'}
                          {session.number === 140 && 'Sozialpolitische Debatten mit Fokus auf sozial gerechten Klimaschutz. Arbeitsmarktpolitik und Migrationspolitik wurden ebenfalls intensiv diskutiert.'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* All Speeches Quick Access */}
      <Card>
        <CardHeader>
          <CardTitle>Alle verfügbaren Reden</CardTitle>
          <CardDescription>Chronologische Übersicht aller dokumentierten Reden</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {fullSpeeches.map((speech) => (
              <Card
                key={speech.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onViewSpeech(speech.id)}
              >
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-gray-900">{speech.speaker}</span>
                        <Badge variant="outline" className="text-xs">{speech.party}</Badge>
                        <span className="text-sm text-gray-600">•</span>
                        <span className="text-sm text-gray-600">
                          {new Date(speech.date).toLocaleDateString('de-DE')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{speech.topic}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Ansehen
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
