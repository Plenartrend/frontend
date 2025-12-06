'use client';

import { useState, useEffect } from 'react';
import { Explorer } from './components/Explorer';
import { PersonalOverview } from './components/PersonalOverview';
import { CampaignDetail } from './components/CampaignDetail';
import { CreateCampaign } from './components/CreateCampaign';
import { SpeechDetail } from './components/SpeechDetail';
import { SpeechOverview } from './components/SpeechOverview';
import { ChatbotButton } from './components/ChatbotButton';
import { Button } from './components/ui/button';
import { Search, LayoutDashboard, PlusCircle } from 'lucide-react';

type View = 'explorer' | 'overview' | 'campaign-detail' | 'create-campaign' | 'speech-detail' | 'speech-overview';

export default function Home() {

  const [currentView, setCurrentView] = useState<View>('explorer');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [selectedSpeechId, setSelectedSpeechId] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Listen for custom events from child components
  useEffect(() => {
    const handleViewSpeech = (e: Event) => {
      const customEvent = e as CustomEvent;
      setSelectedSpeechId(customEvent.detail);
      setCurrentView('speech-detail');
    };

    const handleViewSpeechOverview = () => {
      setCurrentView('speech-overview');
    };

    window.addEventListener('view-speech', handleViewSpeech);
    window.addEventListener('view-speech-overview', handleViewSpeechOverview);

    return () => {
      window.removeEventListener('view-speech', handleViewSpeech);
      window.removeEventListener('view-speech-overview', handleViewSpeechOverview);
    };
  }, []);

  const handleViewCampaign = (campaignId: string) => {
    setSelectedCampaignId(campaignId);
    setCurrentView('campaign-detail');
  };

  const handleCreateCampaign = (campaignData: unknown) => {
    // In a real app, this would save to backend
    console.log('Creating campaign:', campaignData);
    setCurrentView('overview');
  };

  const handleBackToExplorer = () => {
    setCurrentView('explorer');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <h1 className="text-xl text-gray-900">Politischer Diskurs Tracker</h1>

              <nav className="flex items-center gap-2">
                <Button
                  variant={currentView === 'explorer' ? 'default' : 'ghost'}
                  onClick={() => setCurrentView('explorer')}
                  className="flex items-center gap-2"
                >
                  <Search className="w-4 h-4"/>
                  Explorer
                </Button>

                {isLoggedIn && (
                  <>
                    <Button
                      variant={currentView === 'overview' ? 'default' : 'ghost'}
                      onClick={() => setCurrentView('overview')}
                      className="flex items-center gap-2"
                    >
                      <LayoutDashboard className="w-4 h-4"/>
                      Übersicht
                    </Button>

                    <Button
                      variant={currentView === 'create-campaign' ? 'default' : 'ghost'}
                      onClick={() => setCurrentView('create-campaign')}
                      className="flex items-center gap-2"
                    >
                      <PlusCircle className="w-4 h-4"/>
                      Kampagne erstellen
                    </Button>
                  </>
                )}
              </nav>
            </div>

            <Button
              variant={isLoggedIn ? 'outline' : 'default'}
              onClick={() => setIsLoggedIn(!isLoggedIn)}
            >
              {isLoggedIn ? 'Abmelden' : 'Anmelden'}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {currentView === 'explorer' && <Explorer/>}
        {currentView === 'overview' && isLoggedIn && (
          <PersonalOverview onViewCampaign={handleViewCampaign}/>
        )}
        {currentView === 'campaign-detail' && isLoggedIn && selectedCampaignId && (
          <CampaignDetail campaignId={selectedCampaignId}/>
        )}
        {currentView === 'create-campaign' && isLoggedIn && (
          <CreateCampaign onCreateCampaign={handleCreateCampaign}/>
        )}
        {currentView === 'speech-detail' && selectedSpeechId && (
          <SpeechDetail speechId={selectedSpeechId} onBack={handleBackToExplorer}/>
        )}
        {currentView === 'speech-overview' && (
          <SpeechOverview onViewSpeech={(speechId) => {
            setSelectedSpeechId(speechId);
            setCurrentView('speech-detail');
          }}/>
        )}
      </main>

      {/* Chatbot */}
      <ChatbotButton context={currentView}/>
    </div>
  );
}
