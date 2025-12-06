import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Checkbox } from './ui/checkbox';
import { themes, availableAlertTypes, representatives } from '../data/mockData';
import { ArrowRight, ArrowLeft, Check, Target, TrendingUp, TrendingDown, Eye, Sparkles, AlertCircle, Users, Bell, Upload, FileText, X } from 'lucide-react';

interface CreateCampaignProps {
  onCreateCampaign: (data: unknown) => void;
}

export function CreateCampaign({ onCreateCampaign }: CreateCampaignProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    theme: '',
    goal: '' as '' | 'observe' | 'positive' | 'negative',
    description: '',
    stakeholders: [] as string[],
    alerts: [] as string[],
    customDocuments: [] as { name: string; size: number; type: string }[],
  });
  const [isDragging, setIsDragging] = useState(false);

  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;

  // Calculate suggestions based on selected theme
  const selectedTheme = themes.find(t => t.name === formData.theme);
  const themeSupporters = selectedTheme ? representatives
    .filter(rep => {
      const themeData = rep.themes.find(t => t.theme === selectedTheme.name);
      return themeData && themeData.sentiment > 0.5;
    })
    .slice(0, 5) : [];

  const themeOpponents = selectedTheme ? representatives
    .filter(rep => {
      const themeData = rep.themes.find(t => t.theme === selectedTheme.name);
      return themeData && themeData.sentiment < -0.3;
    })
    .slice(0, 5) : [];

  // Calculate goal probability based on current data
  const getGoalProbability = (goal: 'positive' | 'negative' | 'observe') => {
    if (!selectedTheme) return 0;

    if (goal === 'observe') return 70; // Always reasonable

    const avgSentiment = selectedTheme.sentiment;
    const trend = selectedTheme.trend;

    if (goal === 'positive') {
      if (avgSentiment > 0.3 && trend === 'up') return 85;
      if (avgSentiment > 0 && trend === 'up') return 70;
      if (avgSentiment > 0) return 55;
      if (trend === 'up') return 45;
      return 30;
    }

    if (goal === 'negative') {
      if (avgSentiment < -0.3 && trend === 'down') return 85;
      if (avgSentiment < 0 && trend === 'down') return 70;
      if (avgSentiment < 0) return 55;
      if (trend === 'down') return 45;
      return 30;
    }

    return 0;
  };

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    onCreateCampaign({
      ...formData,
      createdAt: new Date(),
      lastUpdate: new Date(),
      status: 'active',
    });
  };

  const toggleStakeholder = (name: string) => {
    setFormData(prev => ({
      ...prev,
      stakeholders: prev.stakeholders.includes(name)
        ? prev.stakeholders.filter(s => s !== name)
        : [...prev.stakeholders, name],
    }));
  };

  const handleAlertToggle = (alertId: string) => {
    setFormData(prev => ({
      ...prev,
      alerts: prev.alerts.includes(alertId)
        ? prev.alerts.filter(id => id !== alertId)
        : [...prev.alerts, alertId],
    }));
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      files.forEach(file => {
        setFormData(prev => ({
          ...prev,
          customDocuments: [
            ...prev.customDocuments,
            { name: file.name, size: file.size, type: file.type },
          ],
        }));
      });
    }
  };

  const removeDocument = (index: number) => {
    setFormData(prev => ({
      ...prev,
      customDocuments: prev.customDocuments.filter((_, i) => i !== index),
    }));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.title.trim() !== '' && formData.description.trim() !== '';
      case 2:
        return formData.theme !== '';
      case 3:
        return formData.goal !== '';
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-gray-900 mb-1">Neue Kampagne erstellen</h2>
            <p className="text-gray-600">Schritt {step} von {totalSteps}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 mb-2">{Math.round(progress)}% abgeschlossen</p>
            <Progress value={progress} className="w-48" />
          </div>
        </div>

        {/* Step Indicators */}
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  s < step
                    ? 'bg-green-600 text-white'
                    : s === step
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {s < step ? <Check className="w-4 h-4" /> : s}
              </div>
              {s < 5 && (
                <div
                  className={`flex-1 h-1 mx-2 ${
                    s < step ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Basic Information */}
      {step === 1 && (
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="text-2xl">Grundinformationen</CardTitle>
            <CardDescription>
              Geben Sie Ihrer Kampagne einen Namen und beschreiben Sie Ihr Vorhaben
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-lg">Kampagnentitel</Label>
              <Input
                id="title"
                placeholder="z.B. Klimaschutzgesetz 2025 - Verschärfung der CO2-Ziele"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="text-lg h-12"
              />
              <p className="text-sm text-gray-500">
                Wählen Sie einen prägnanten, aussagekräftigen Titel
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-lg">Beschreibung & Motivation</Label>
              <Textarea
                id="description"
                placeholder="Beschreiben Sie die Motivation und den Hintergrund Ihrer Kampagne. Was möchten Sie erreichen? Warum ist dieses Thema wichtig?"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={6}
                className="text-base"
              />
              <p className="text-sm text-gray-500">
                Eine gute Beschreibung hilft Ihnen und Ihrem Team, fokussiert zu bleiben
              </p>
            </div>

            {formData.title && formData.description && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-900">
                  <Check className="w-5 h-5" />
                  <span>Sieht gut aus! Bereit für den nächsten Schritt.</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 2: Theme Selection */}
      {step === 2 && (
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Target className="w-6 h-6" />
              Themenauswahl
            </CardTitle>
            <CardDescription>
              Wählen Sie das politische Thema, das im Zentrum Ihrer Kampagne steht
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {themes.map((theme) => (
                <Card
                  key={theme.id}
                  className={`cursor-pointer transition-all ${
                    formData.theme === theme.name
                      ? 'border-2 border-blue-600 shadow-lg bg-blue-50'
                      : 'hover:border-blue-300 hover:shadow-md'
                  }`}
                  onClick={() => setFormData({ ...formData, theme: theme.name })}
                >
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <h3 className="text-lg text-gray-900">{theme.name}</h3>
                        {formData.theme === theme.name && (
                          <Check className="w-5 h-5 text-blue-600" />
                        )}
                      </div>

                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-600">Aktuelle Relevanz</span>
                            <Badge variant="outline">{theme.relevance}%</Badge>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${theme.relevance}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Trend</span>
                          <Badge
                            variant={theme.trend === 'up' ? 'default' : theme.trend === 'down' ? 'destructive' : 'secondary'}
                          >
                            {theme.trend === 'up' && <TrendingUp className="w-3 h-3 mr-1" />}
                            {theme.trend === 'down' && <TrendingDown className="w-3 h-3 mr-1" />}
                            {theme.trend === 'up' ? 'Steigend' : theme.trend === 'down' ? 'Fallend' : 'Stabil'}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Durchschnittliche Haltung</span>
                          <Badge variant={theme.sentiment > 0 ? 'default' : 'destructive'}>
                            {theme.sentiment > 0 ? 'Positiv' : theme.sentiment < 0 ? 'Negativ' : 'Neutral'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {formData.theme && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-blue-900 mb-1">Thema ausgewählt: {formData.theme}</p>
                    <p className="text-sm text-blue-700">
                      Basierend auf der aktuellen Relevanz von {selectedTheme?.relevance}% und dem {selectedTheme?.trend === 'up' ? 'steigenden' : selectedTheme?.trend === 'down' ? 'fallenden' : 'stabilen'} Trend ist dies ein {selectedTheme?.relevance && selectedTheme.relevance > 80 ? 'sehr wichtiges' : 'relevantes'} Thema für eine Kampagne.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 3: Goal Selection with AI Suggestions */}
      {step === 3 && (
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Sparkles className="w-6 h-6" />
              Zieldefinition
            </CardTitle>
            <CardDescription>
              Basierend auf {formData.theme} haben wir wahrscheinliche Erfolgschancen berechnet
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Observe Goal */}
            <Card
              className={`cursor-pointer transition-all ${
                formData.goal === 'observe'
                  ? 'border-2 border-blue-600 shadow-lg bg-blue-50'
                  : 'hover:border-blue-300 hover:shadow-md'
              }`}
              onClick={() => setFormData({ ...formData, goal: 'observe' })}
            >
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Eye className="w-6 h-6 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg text-gray-900 mb-1">Beobachtung</h3>
                        <p className="text-sm text-gray-600">
                          Verfolgen Sie die Entwicklung ohne aktives Beeinflussungsziel
                        </p>
                      </div>
                      {formData.goal === 'observe' && (
                        <Check className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm text-gray-600">Erfolgswahrscheinlichkeit</span>
                        <Badge variant="outline">{getGoalProbability('observe')}%</Badge>
                      </div>
                      <Progress value={getGoalProbability('observe')} className="h-2" />
                      <p className="text-xs text-gray-500 mt-2">
                        Ideal für neue Themen oder wenn Sie zunächst die Lage analysieren möchten
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Positive Goal */}
            <Card
              className={`cursor-pointer transition-all ${
                formData.goal === 'positive'
                  ? 'border-2 border-green-600 shadow-lg bg-green-50'
                  : 'hover:border-green-300 hover:shadow-md'
              }`}
              onClick={() => setFormData({ ...formData, goal: 'positive' })}
            >
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg text-gray-900 mb-1">Positive Verschiebung</h3>
                        <p className="text-sm text-gray-600">
                          Mehr Unterstützung und positive Haltungen erreichen
                        </p>
                      </div>
                      {formData.goal === 'positive' && (
                        <Check className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm text-gray-600">Erfolgswahrscheinlichkeit</span>
                        <Badge
                          variant={getGoalProbability('positive') > 60 ? 'default' : 'outline'}
                          className={getGoalProbability('positive') > 60 ? 'bg-green-600' : ''}
                        >
                          {getGoalProbability('positive')}%
                        </Badge>
                      </div>
                      <Progress value={getGoalProbability('positive')} className="h-2" />
                      <p className="text-xs text-gray-500 mt-2">
                        {getGoalProbability('positive') > 70
                          ? 'Sehr günstige Ausgangslage - das Thema hat bereits positive Dynamik!'
                          : getGoalProbability('positive') > 50
                          ? 'Moderate Chancen - erfordert strategische Arbeit'
                          : 'Herausfordernd - starke Opposition oder negativer Trend'}
                      </p>
                    </div>

                    {themeSupporters.length > 0 && (
                      <div className="mt-4 p-3 bg-white rounded border border-green-200">
                        <p className="text-sm text-gray-900 mb-2">Potenzielle Unterstützer:</p>
                        <div className="flex flex-wrap gap-2">
                          {themeSupporters.map(rep => (
                            <Badge key={rep.id} variant="outline" className="bg-green-50">
                              {rep.name} ({rep.party})
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Negative Goal */}
            <Card
              className={`cursor-pointer transition-all ${
                formData.goal === 'negative'
                  ? 'border-2 border-red-600 shadow-lg bg-red-50'
                  : 'hover:border-red-300 hover:shadow-md'
              }`}
              onClick={() => setFormData({ ...formData, goal: 'negative' })}
            >
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <TrendingDown className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg text-gray-900 mb-1">Negative Verschiebung</h3>
                        <p className="text-sm text-gray-600">
                          Opposition stärken und kritische Haltungen fördern
                        </p>
                      </div>
                      {formData.goal === 'negative' && (
                        <Check className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm text-gray-600">Erfolgswahrscheinlichkeit</span>
                        <Badge
                          variant={getGoalProbability('negative') > 60 ? 'destructive' : 'outline'}
                        >
                          {getGoalProbability('negative')}%
                        </Badge>
                      </div>
                      <Progress value={getGoalProbability('negative')} className="h-2" />
                      <p className="text-xs text-gray-500 mt-2">
                        {getGoalProbability('negative') > 70
                          ? 'Sehr günstige Ausgangslage - kritische Stimmen sind bereits präsent!'
                          : getGoalProbability('negative') > 50
                          ? 'Moderate Chancen - erfordert strategische Arbeit'
                          : 'Herausfordernd - starke Unterstützung oder positiver Trend'}
                      </p>
                    </div>

                    {themeOpponents.length > 0 && (
                      <div className="mt-4 p-3 bg-white rounded border border-red-200">
                        <p className="text-sm text-gray-900 mb-2">Potenzielle Verbündete:</p>
                        <div className="flex flex-wrap gap-2">
                          {themeOpponents.map(rep => (
                            <Badge key={rep.id} variant="outline" className="bg-red-50">
                              {rep.name} ({rep.party})
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {formData.goal && (
              <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="text-purple-900 mb-1">KI-Empfehlung</p>
                    <p className="text-sm text-purple-700">
                      {formData.goal === 'observe' && 'Eine Beobachtungskampagne ist ein guter Start, um die Dynamik zu verstehen, bevor Sie aktiv werden.'}
                      {formData.goal === 'positive' && getGoalProbability('positive') > 60 && 'Die aktuelle Stimmung begünstigt eine positive Kampagne. Nutzen Sie die bestehende Dynamik!'}
                      {formData.goal === 'positive' && getGoalProbability('positive') <= 60 && 'Eine positive Kampagne ist möglich, erfordert aber intensive Arbeit mit Stakeholdern.'}
                      {formData.goal === 'negative' && getGoalProbability('negative') > 60 && 'Die Ausgangslage für kritische Positionen ist günstig. Koordinieren Sie mit den identifizierten Verbündeten!'}
                      {formData.goal === 'negative' && getGoalProbability('negative') <= 60 && 'Eine Gegenkampagne erfordert strategische Planung und starke Argumente.'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 4: Stakeholders and Alerts */}
      {step === 4 && (
        <div className="space-y-6">
          <Card className="border-2 border-blue-200">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Users className="w-6 h-6" />
                Stakeholder auswählen
              </CardTitle>
              <CardDescription>
                Wählen Sie relevante Abgeordnete basierend auf dem Thema {formData.theme}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {representatives
                  .filter(rep => rep.themes.some(t => t.theme === formData.theme))
                  .map(rep => {
                    const themeData = rep.themes.find(t => t.theme === formData.theme);
                    return (
                      <Card
                        key={rep.id}
                        className={`cursor-pointer transition-all ${
                          formData.stakeholders.includes(rep.name)
                            ? 'border-2 border-blue-600 bg-blue-50'
                            : 'hover:border-blue-300'
                        }`}
                        onClick={() => toggleStakeholder(rep.name)}
                      >
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="text-gray-900">{rep.name}</p>
                              <p className="text-sm text-gray-600">{rep.party}</p>
                            </div>
                            {formData.stakeholders.includes(rep.name) && (
                              <Check className="w-5 h-5 text-blue-600" />
                            )}
                          </div>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Haltung:</span>
                              <Badge
                                variant={themeData && themeData.sentiment > 0 ? 'default' : 'destructive'}
                                className="text-xs"
                              >
                                {themeData ? (themeData.sentiment > 0 ? '+' : '') + Math.round(themeData.sentiment * 100) + '%' : 'N/A'}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Aktivität:</span>
                              <span className="text-gray-900">{rep.activity}%</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>

              {formData.stakeholders.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-900">
                    {formData.stakeholders.length} {formData.stakeholders.length === 1 ? 'Stakeholder' : 'Stakeholder'} ausgewählt
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Benachrichtigungen konfigurieren
              </CardTitle>
              <CardDescription>
                Wählen Sie, über welche Ereignisse Sie informiert werden möchten
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {availableAlertTypes.map((alertType) => (
                  <div
                    key={alertType.id}
                    className={`flex items-start space-x-3 p-3 rounded-lg cursor-pointer transition-all ${
                      formData.alerts.includes(alertType.id)
                        ? 'bg-blue-50 border-2 border-blue-600'
                        : 'bg-gray-50 border border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => handleAlertToggle(alertType.id)}
                  >
                    <Checkbox
                      id={alertType.id}
                      checked={formData.alerts.includes(alertType.id)}
                      onCheckedChange={() => handleAlertToggle(alertType.id)}
                    />
                    <div className="flex-1">
                      <Label htmlFor={alertType.id} className="cursor-pointer">
                        {alertType.label}
                      </Label>
                    </div>
                    {formData.alerts.includes(alertType.id) && (
                      <Check className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 5: Upload Custom Documents */}
      {step === 5 && (
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Upload className="w-6 h-6" />
              Dokumente hochladen
            </CardTitle>
            <CardDescription>
              Laden Sie relevante Dokumente hoch, die für Ihre Kampagne wichtig sind
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={`p-4 border-2 border-dashed rounded-lg ${
                isDragging ? 'border-blue-500' : 'border-gray-300'
              }`}
              onDragEnter={() => setIsDragging(true)}
              onDragLeave={() => setIsDragging(false)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const files = e.dataTransfer.files;
                for (let i = 0; i < files.length; i++) {
                  const file = files[i];
                  setFormData(prev => ({
                    ...prev,
                    customDocuments: [
                      ...prev.customDocuments,
                      { name: file.name, size: file.size, type: file.type },
                    ],
                  }));
                }
              }}
            >
              <div className="flex items-center justify-center">
                <Upload className="w-10 h-10 text-gray-500" />
              </div>
              <p className="text-gray-500 mt-2">
                Ziehen Sie Dateien hierher oder klicken Sie, um Dateien auszuwählen
              </p>
            </div>

            <input
              type="file"
              multiple
              className="hidden"
              id="fileInput"
              onChange={handleFileInput}
            />
            <label
              htmlFor="fileInput"
              className="mt-4 block text-sm text-gray-500 cursor-pointer"
            >
              Oder klicken Sie hier, um Dateien auszuwählen
            </label>

            {formData.customDocuments.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-900 mb-2">Hochgeladene Dokumente:</p>
                <div className="space-y-2">
                  {formData.customDocuments.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 text-gray-500 mr-2" />
                        <p className="text-sm text-gray-900">{doc.name} ({formatFileSize(doc.size)})</p>
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => removeDocument(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mt-8">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={step === 1}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Zurück
        </Button>

        <div className="flex items-center gap-3">
          {step < totalSteps && (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex items-center gap-2"
            >
              Weiter
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}

          {step === totalSteps && (
            <Button
              onClick={handleSubmit}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <Check className="w-4 h-4" />
              Kampagne erstellen
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
