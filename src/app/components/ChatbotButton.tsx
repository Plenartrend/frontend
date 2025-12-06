import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { MessageCircle, X, Send } from 'lucide-react';

interface ChatbotButtonProps {
  context: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function ChatbotButton({ context }: ChatbotButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hallo! Ich bin Ihr politischer Diskurs-Assistent. Wie kann ich Ihnen heute helfen?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    // Simulate bot response
    setTimeout(() => {
      const responses: Record<string, string> = {
        explorer: 'Im Explorer können Sie verschiedene politische Themen erkunden. Möchten Sie mehr über ein bestimmtes Thema oder einen Abgeordneten erfahren?',
        overview: 'In Ihrer persönlichen Übersicht sehen Sie alle aktiven Kampagnen und Benachrichtigungen. Welche Kampagne interessiert Sie?',
        'campaign-detail': 'Hier sehen Sie alle Details zu Ihrer Kampagne. Ich kann Ihnen bei der Analyse der Trends oder bei der Interpretation der Alerts helfen.',
        'create-campaign': 'Sie erstellen gerade eine neue Kampagne. Ich kann Ihnen bei der Auswahl des richtigen Themas und der Zielsetzung helfen.',
      };

      const botMessage: Message = {
        role: 'assistant',
        content: responses[context] || 'Ich stehe Ihnen zur Verfügung. Wie kann ich helfen?',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <Button
          className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg"
          onClick={() => setIsOpen(true)}
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      )}

      {/* Chatbot Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-3rem)] shadow-2xl z-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Diskurs-Assistent</CardTitle>
                <CardDescription className="text-sm">
                  API-gestützte Hilfe für Ihre Analysen
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Messages */}
            <div className="h-96 overflow-y-auto space-y-3 pr-2">
              {messages.map((message, idx) => (
                <div
                  key={idx}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString('de-DE', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <Input
                placeholder="Ihre Frage..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <Button size="icon" onClick={handleSend}>
                <Send className="w-4 h-4" />
              </Button>
            </div>

            <p className="text-xs text-gray-500">
              Der Chatbot kann auf Bundestags-API und Analysen zugreifen
            </p>
          </CardContent>
        </Card>
      )}
    </>
  );
}
