import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { campaigns, timeSeriesData, representatives, legislationItems, speechExcerpts } from '../data/mockData';
import { Edit, Share, Bell, AlertCircle, TrendingUp, Users, FileText, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, ZAxis } from 'recharts';

interface CampaignDetailProps {
  campaignId: string;
}

export function CampaignDetail({ campaignId }: CampaignDetailProps) {
  const [editMode, setEditMode] = useState(false);
  const [widgets, setWidgets] = useState({
    meinungstrend: true,
    relevanztrend: true,
    heatmap: true,
    politiker: true,
    gesetze: true,
    reden: true,
  });

  const campaign = campaigns.find(c => c.id === campaignId);

  if (!campaign) {
    return <div>Kampagne nicht gefunden</div>;
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(date);
  };

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 border-red-300 text-red-900';
      case 'medium': return 'bg-yellow-100 border-yellow-300 text-yellow-900';
      case 'low': return 'bg-blue-100 border-blue-300 text-blue-900';
      default: return 'bg-gray-100 border-gray-300 text-gray-900';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'position-change': return <Users className="w-4 h-4" />;
      case 'legislation': return <FileText className="w-4 h-4" />;
      case 'discourse-shift': return <TrendingUp className="w-4 h-4" />;
      case 'activity': return <Activity className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  // Get relevant representatives for the campaign theme
  const relevantReps = representatives
    .map(rep => ({
      ...rep,
      themeData: rep.themes.find(t => t.theme === campaign.theme),
    }))
    .filter(rep => rep.themeData)
    .sort((a, b) => (b.themeData?.relevance || 0) - (a.themeData?.relevance || 0));

  // Create heatmap data
  const heatmapData = relevantReps.map(rep => ({
    name: rep.name,
    party: rep.party,
    haltung: (rep.themeData?.sentiment || 0) * 100,
    relevanz: rep.themeData?.relevance || 0,
    aktivität: rep.activity,
  }));

  const volatileReps = relevantReps
    .sort((a, b) => b.volatility - a.volatility)
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h2 className="text-gray-900 mb-2">{campaign.title}</h2>
          <p className="text-gray-600 mb-4">{campaign.description}</p>

          <div className="flex flex-wrap gap-3">
            <Badge variant="outline">Thema: {campaign.theme}</Badge>
            <Badge variant="outline">
              Ziel: {campaign.goal === 'positive' ? 'Positive Verschiebung' :
                     campaign.goal === 'negative' ? 'Negative Verschiebung' : 'Beobachtung'}
            </Badge>
            <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
              Status: {campaign.status === 'active' ? 'Aktiv' :
                      campaign.status === 'watching' ? 'Beobachten' : 'Beendet'}
            </Badge>
            <Badge variant="outline">Erstellt: {formatDate(campaign.createdAt)}</Badge>
            <Badge variant="outline">Aktualisiert: {formatDate(campaign.lastUpdate)}</Badge>
          </div>

          {campaign.stakeholders.length > 0 && (
            <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              <span>Stakeholder: {campaign.stakeholders.join(', ')}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Share className="w-4 h-4 mr-2" />
            Teilen
          </Button>
          <Button
            variant={editMode ? 'default' : 'outline'}
            size="sm"
            onClick={() => setEditMode(!editMode)}
          >
            <Edit className="w-4 h-4 mr-2" />
            {editMode ? 'Bearbeiten beenden' : 'Bearbeiten'}
          </Button>
        </div>
      </div>

      {editMode && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle>Widget-Einstellungen</CardTitle>
            <CardDescription>Wählen Sie aus, welche Widgets angezeigt werden sollen</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(widgets).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-3 bg-white rounded border">
                  <span className="text-gray-900">
                    {key === 'meinungstrend' && 'Meinungstrend'}
                    {key === 'relevanztrend' && 'Relevanztrend'}
                    {key === 'heatmap' && 'Heatmap'}
                    {key === 'politiker' && 'Wichtige Politiker'}
                    {key === 'gesetze' && 'Gesetzesentwürfe'}
                    {key === 'reden' && 'Redeausschnitte'}
                  </span>
                  <Switch
                    checked={value}
                    onCheckedChange={(checked: unknown) => setWidgets({ ...widgets, [key]: checked })}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="alerts">
            <Bell className="w-4 h-4 mr-2" />
            Alerts ({campaign.alerts.length})
          </TabsTrigger>
          <TabsTrigger value="analysis">Analysen</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Relevanz</p>
                    <p className="text-xl text-gray-900">95%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Users className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Abgeordnete</p>
                    <p className="text-xl text-gray-900">{relevantReps.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Gesetze</p>
                    <p className="text-xl text-gray-900">{legislationItems.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-8 h-8 text-orange-600" />
                  <div>
                    <p className="text-sm text-gray-600">Alerts</p>
                    <p className="text-xl text-gray-900">{campaign.alerts.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          {widgets.meinungstrend && (
            <Card>
              <CardHeader>
                <CardTitle>Meinungstrend</CardTitle>
                <CardDescription>Entwicklung der Haltung zum Thema seit Kampagnenstart</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[-1, 1]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="sentiment" stroke="#10b981" name="Sentiment" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {widgets.relevanztrend && (
            <Card>
              <CardHeader>
                <CardTitle>Relevanztrend</CardTitle>
                <CardDescription>Wie wichtig ist das Thema im politischen Diskurs?</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="relevance" stroke="#3b82f6" name="Relevanz %" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {widgets.heatmap && (
            <Card>
              <CardHeader>
                <CardTitle>Heatmap: Haltung & Aktivität</CardTitle>
                <CardDescription>Abgeordnete nach Haltung und Aktivität zum Thema</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="haltung" name="Haltung" unit="%" domain={[-100, 100]} />
                    <YAxis dataKey="aktivität" name="Aktivität" unit="%" />
                    <ZAxis dataKey="relevanz" range={[50, 400]} name="Relevanz" />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Legend />
                    <Scatter name="Abgeordnete" data={heatmapData} fill="#3b82f6" />
                  </ScatterChart>
                </ResponsiveContainer>
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {heatmapData.slice(0, 8).map((rep, idx) => (
                    <div key={idx} className="text-xs p-2 bg-gray-50 rounded">
                      <p className="text-gray-900">{rep.name}</p>
                      <p className="text-gray-600">{rep.party}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {widgets.politiker && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Wichtigste Unterstützer</CardTitle>
                  <CardDescription>Abgeordnete mit hoher positiver Relevanz</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {relevantReps
                      .filter(rep => (rep.themeData?.sentiment || 0) > 0)
                      .slice(0, 3)
                      .map(rep => (
                        <div key={rep.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <div>
                            <p className="text-gray-900">{rep.name}</p>
                            <p className="text-sm text-gray-600">{rep.party}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline" className="bg-green-100">
                              +{Math.round((rep.themeData?.sentiment || 0) * 100)}%
                            </Badge>
                            <p className="text-xs text-gray-600 mt-1">
                              Relevanz: {rep.themeData?.relevance}%
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Volatile Abgeordnete</CardTitle>
                  <CardDescription>Politiker mit häufigen Positionswechseln</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {volatileReps.map(rep => (
                      <div key={rep.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                        <div>
                          <p className="text-gray-900">{rep.name}</p>
                          <p className="text-sm text-gray-600">{rep.party}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="bg-orange-100">
                            {rep.volatility}% volatil
                          </Badge>
                          <p className="text-xs text-gray-600 mt-1">
                            Aktivität: {rep.activity}%
                            </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {widgets.gesetze && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Passende Gesetzesentwürfe
                </CardTitle>
                <CardDescription>Relevante Gesetzesinitiativen zum Thema</CardDescription>
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
          )}

          {widgets.reden && (
            <Card>
              <CardHeader>
                <CardTitle>Ausschnitte aus Reden</CardTitle>
                <CardDescription>Wichtige Statements zum Kampagnenthema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {speechExcerpts.map(speech => (
                    <div
                      key={speech.id}
                      className="p-4 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
                      onClick={() => window.dispatchEvent(new CustomEvent('view-speech', { detail: speech.id }))}
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
          )}
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alert-Übersicht</CardTitle>
              <CardDescription>Alle Benachrichtigungen für diese Kampagne</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {campaign.alerts.length > 0 ? (
                  campaign.alerts.map(alert => (
                    <div
                      key={alert.id}
                      className={`p-4 border rounded-lg ${getPriorityColor(alert.priority)}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {getAlertIcon(alert.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="mb-1">{alert.title}</p>
                              <p className="text-sm opacity-80">{alert.description}</p>
                            </div>
                            <Badge variant="outline" className="ml-2">
                              {alert.priority === 'high' ? 'Hoch' : alert.priority === 'medium' ? 'Mittel' : 'Niedrig'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-sm opacity-70">
                            <span>{formatDateTime(alert.timestamp)}</span>
                            {alert.relatedPerson && (
                              <>
                                <span>•</span>
                                <span>{alert.relatedPerson}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-8">Keine Benachrichtigungen vorhanden</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detaillierte Analysen</CardTitle>
              <CardDescription>Tiefergehende Einblicke in den Diskurs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-gray-900 mb-3">Parteipositionen</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={timeSeriesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="relevance" stroke="#3b82f6" name="Relevanz" />
                      <Line type="monotone" dataKey="sentiment" stroke="#10b981" name="Sentiment (normalisiert)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div>
                  <h3 className="text-gray-900 mb-3">Netzwerkanalyse</h3>
                  <p className="text-gray-600">
                    Visualisierung der Beziehungen zwischen Abgeordneten mit ähnlichen Positionen wird hier angezeigt.
                  </p>
                  <div className="mt-4 p-6 bg-gray-50 rounded-lg text-center">
                    <Users className="w-16 h-16 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-500">Netzwerk-Visualisierung wird geladen...</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
