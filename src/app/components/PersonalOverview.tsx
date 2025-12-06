import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { campaigns } from '../data/mockData';
import { PlayCircle, Eye, CheckCircle, Bell, Calendar, Users, AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface PersonalOverviewProps {
  onViewCampaign: (campaignId: string) => void;
}

export function PersonalOverview({ onViewCampaign }: PersonalOverviewProps) {
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'watching' | 'completed'>('all');

  const activeCampaigns = campaigns.filter(c => c.status === 'active');
  const watchingCampaigns = campaigns.filter(c => c.status === 'watching');
  const completedCampaigns = campaigns.filter(c => c.status === 'completed');

  // Aggregate all alerts from all campaigns
  const allAlerts = campaigns.flatMap(c =>
    c.alerts.map(alert => ({ ...alert, campaignTitle: c.title, campaignId: c.id }))
  ).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <PlayCircle className="w-4 h-4 text-green-600" />;
      case 'watching': return <Eye className="w-4 h-4 text-blue-600" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-gray-600" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      watching: 'secondary',
      completed: 'outline',
    };
    const labels = {
      active: 'Aktiv',
      watching: 'Beobachten',
      completed: 'Beendet',
    };
    return <Badge variant={variants[status as keyof typeof variants] as never}>{labels[status as keyof typeof labels]}</Badge>;
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
      case 'legislation': return <AlertCircle className="w-4 h-4" />;
      case 'activity': return <Bell className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: 'short',
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

  // Filter campaigns based on selected filter
  const filteredCampaigns = filterStatus === 'all'
    ? campaigns
    : campaigns.filter(c => c.status === filterStatus);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-gray-900 mb-2">Meine Übersicht</h2>
        <p className="text-gray-600">Kampagnen und Benachrichtigungen</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card
          className={`cursor-pointer transition-all hover:shadow-lg ${
            filterStatus === 'active' ? 'ring-2 ring-green-600 bg-green-50' : ''
          }`}
          onClick={() => setFilterStatus('active')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <PlayCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Aktive Kampagnen</p>
                <p className="text-xl text-gray-900">{activeCampaigns.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all hover:shadow-lg ${
            filterStatus === 'watching' ? 'ring-2 ring-blue-600 bg-blue-50' : ''
          }`}
          onClick={() => setFilterStatus('watching')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Eye className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Beobachtet</p>
                <p className="text-xl text-gray-900">{watchingCampaigns.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all hover:shadow-lg ${
            filterStatus === 'all' ? 'ring-2 ring-orange-600 bg-orange-50' : ''
          }`}
          onClick={() => setFilterStatus('all')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Bell className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Neue Alerts</p>
                <p className="text-xl text-gray-900">{allAlerts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all hover:shadow-lg ${
            filterStatus === 'completed' ? 'ring-2 ring-gray-600 bg-gray-50' : ''
          }`}
          onClick={() => setFilterStatus('completed')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Beendet</p>
                <p className="text-xl text-gray-900">{completedCampaigns.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="campaigns" className="w-full">
        <TabsList>
          <TabsTrigger value="campaigns">Kampagnen</TabsTrigger>
          <TabsTrigger value="notifications">Benachrichtigungen</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Meine Kampagnen</CardTitle>
              <CardDescription>
                {filterStatus === 'all' && 'Übersicht aller laufenden und vergangenen Kampagnen'}
                {filterStatus === 'active' && 'Alle aktiven Kampagnen'}
                {filterStatus === 'watching' && 'Kampagnen in Beobachtung'}
                {filterStatus === 'completed' && 'Abgeschlossene Kampagnen'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredCampaigns.length > 0 ? (
                  filteredCampaigns.map(campaign => (
                    <Card
                      key={campaign.id}
                      className="cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => onViewCampaign(campaign.id)}
                    >
                      <CardContent className="pt-6">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              {getStatusIcon(campaign.status)}
                              <div>
                                <h3 className="text-gray-900 mb-1">{campaign.title}</h3>
                                <p className="text-sm text-gray-600">{campaign.description}</p>
                              </div>
                            </div>
                            {getStatusBadge(campaign.status)}
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Erstellt: {formatDate(campaign.createdAt)}
                            </Badge>
                            <Badge variant="outline">
                              Thema: {campaign.theme}
                            </Badge>
                            <Badge variant="outline">
                              Ziel: {campaign.goal === 'positive' ? 'Positive Verschiebung' :
                                     campaign.goal === 'negative' ? 'Negative Verschiebung' : 'Beobachtung'}
                            </Badge>
                          </div>

                          {campaign.alerts.length > 0 && (
                            <div className="flex items-center gap-2 p-2 bg-orange-50 rounded">
                              <Bell className="w-4 h-4 text-orange-600" />
                              <span className="text-sm text-orange-900">
                                {campaign.alerts.length} neue {campaign.alerts.length === 1 ? 'Benachrichtigung' : 'Benachrichtigungen'}
                              </span>
                            </div>
                          )}

                          {campaign.stakeholders.length > 0 && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Users className="w-4 h-4" />
                              <span>Stakeholder: {campaign.stakeholders.join(', ')}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-gray-600">Keine Kampagnen gefunden.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Benachrichtigungen & Updates</CardTitle>
              <CardDescription>Sortierter Feed aktueller Updates aus allen Kampagnen</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {allAlerts.map(alert => (
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
                          <span>•</span>
                          <span>{alert.campaignTitle}</span>
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
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
