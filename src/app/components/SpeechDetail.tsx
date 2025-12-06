import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ArrowLeft, Calendar, Clock, Users, Tag, Video, ExternalLink } from 'lucide-react';
import { fullSpeeches } from '../data/mockData';

interface SpeechDetailProps {
  speechId: string;
  onBack: () => void;
}

export function SpeechDetail({ speechId, onBack }: SpeechDetailProps) {
  const speech = fullSpeeches.find(s => s.id === speechId);

  if (!speech) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Rede nicht gefunden</p>
        <Button onClick={onBack} className="mt-4">
          Zurück
        </Button>
      </div>
    );
  }

  // Split text into paragraphs and highlight the excerpt
  const paragraphs = speech.fullText.split('\n\n');
  
  const highlightText = (text: string) => {
    const excerptIndex = text.indexOf(speech.highlightedExcerpt);
    if (excerptIndex === -1) return text;
    
    const before = text.substring(0, excerptIndex);
    const highlight = text.substring(excerptIndex, excerptIndex + speech.highlightedExcerpt.length);
    const after = text.substring(excerptIndex + speech.highlightedExcerpt.length);
    
    return (
      <>
        {before}
        <mark className="bg-yellow-200 px-1 rounded">{highlight}</mark>
        {after}
      </>
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex gap-6">
        {/* Main Content */}
        <div className="flex-1 space-y-6">
          {/* Header */}
          <div>
            <Button variant="outline" onClick={onBack} className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zurück
            </Button>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge>{speech.type}</Badge>
                <Badge variant="outline">{speech.party}</Badge>
              </div>
              
              <h1 className="text-gray-900">{speech.topic}</h1>
              
              <div className="flex items-center gap-4 text-gray-600">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{speech.speaker}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(speech.date).toLocaleDateString('de-DE', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{speech.duration}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Video Player Placeholder */}
          {speech.videoUrl && (
            <Card>
              <CardContent className="pt-6">
                <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
                  <div className="text-center text-white">
                    <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-gray-300">Video-Player</p>
                    <Button variant="outline" className="mt-4 text-white border-white hover:bg-white hover:text-gray-900">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Video auf Bundestag.de ansehen
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Full Speech Text */}
          <Card>
            <CardHeader>
              <CardTitle>Vollständige Rede</CardTitle>
              <CardDescription>
                Die hervorgehobene Passage wurde in Analysen referenziert
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-gray max-w-none">
                {paragraphs.map((para, idx) => (
                  <p key={idx} className="mb-4 text-gray-700 leading-relaxed whitespace-pre-line">
                    {highlightText(para)}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Related Themes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="w-5 h-5" />
                Verwandte Themen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {speech.relatedThemes.map((theme, idx) => (
                  <Badge key={idx} variant="outline" className="text-sm">
                    {theme}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Metadata Sidebar */}
        <div className="w-80 space-y-4">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Redner</p>
                <p className="text-gray-900">{speech.speaker}</p>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-gray-600 mb-1">Partei</p>
                <Badge>{speech.party}</Badge>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-gray-600 mb-1">Sitzung</p>
                <p className="text-gray-900">{speech.session}</p>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-gray-600 mb-1">Datum</p>
                <p className="text-gray-900">
                  {new Date(speech.date).toLocaleDateString('de-DE', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-gray-600 mb-1">Thema</p>
                <p className="text-gray-900">{speech.topic}</p>
              </div>

              {speech.committee && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Ausschuss</p>
                    <p className="text-gray-900">{speech.committee}</p>
                  </div>
                </>
              )}

              <Separator />

              <div>
                <p className="text-sm text-gray-600 mb-1">Dauer</p>
                <p className="text-gray-900">{speech.duration}</p>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-gray-600 mb-1">Typ</p>
                <Badge variant="outline">{speech.type}</Badge>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-gray-600 mb-2">Verwandte Themen</p>
                <div className="flex flex-wrap gap-2">
                  {speech.relatedThemes.map((theme, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {theme}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              <Button variant="outline" className="w-full">
                <ExternalLink className="w-4 h-4 mr-2" />
                Auf Bundestag.de
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
