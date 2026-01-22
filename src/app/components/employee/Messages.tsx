import { useState } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { MessageSquare, Send, Search, Paperclip } from 'lucide-react';

export function Messages() {
  const [selectedConversation, setSelectedConversation] = useState(1);

  const conversations = [
    {
      id: 1,
      practitioner: 'Dr. Sophie Martin',
      specialty: 'Psychologue',
      avatar: 'SM',
      lastMessage: 'Bonjour Marc, n\'oubliez pas de pratiquer les exercices de respiration.',
      lastMessageTime: 'Il y a 2h',
      unread: 2,
      isOnline: true,
    },
    {
      id: 2,
      practitioner: 'Dr. Thomas Lefebvre',
      specialty: 'Thérapeute',
      avatar: 'TL',
      lastMessage: 'Merci pour votre retour, à bientôt !',
      lastMessageTime: 'Hier',
      unread: 0,
      isOnline: false,
    },
  ];

  const messages = [
    {
      id: 1,
      sender: 'practitioner',
      content: 'Bonjour Marc, j\'espère que vous allez bien. Comment s\'est passée votre semaine ?',
      time: 'Aujourd\'hui 13:45',
    },
    {
      id: 2,
      sender: 'me',
      content: 'Bonjour Docteur, ça va mieux merci. J\'ai appliqué vos conseils et je me sens plus serein.',
      time: 'Aujourd\'hui 13:52',
    },
    {
      id: 3,
      sender: 'practitioner',
      content: 'C\'est une excellente nouvelle ! Continuez comme ça. N\'oubliez pas de pratiquer les exercices de respiration quotidiennement.',
      time: 'Aujourd\'hui 14:15',
    },
    {
      id: 4,
      sender: 'practitioner',
      content: 'On en rediscutera lors de notre prochaine séance jeudi.',
      time: 'Aujourd\'hui 14:16',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-foreground mb-2">
          Messages
        </h1>
        <p className="text-muted-foreground">
          Communiquez en toute confidentialité avec vos praticiens.
        </p>
      </div>

      {/* Messages Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-240px)]">
        {/* Conversations List */}
        <Card className="lg:col-span-1 p-4 flex flex-col">
          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Rechercher..."
                className="pl-10 bg-input-background"
              />
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 space-y-2 overflow-y-auto">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation.id)}
                className={`
                  w-full p-4 rounded-lg text-left transition-colors
                  ${selectedConversation === conversation.id
                    ? 'bg-primary/10 border-2 border-primary'
                    : 'hover:bg-muted border-2 border-transparent'
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                      {conversation.avatar}
                    </div>
                    {conversation.isOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#5CB85C] border-2 border-white rounded-full" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <p className="font-semibold text-sm truncate">
                        {conversation.practitioner}
                      </p>
                      {conversation.unread > 0 && (
                        <span className="ml-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                          {conversation.unread}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">
                      {conversation.specialty}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {conversation.lastMessage}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {conversation.lastMessageTime}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Chat Area */}
        <Card className="lg:col-span-2 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                  SM
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#5CB85C] border-2 border-white rounded-full" />
              </div>
              <div>
                <p className="font-semibold">Dr. Sophie Martin</p>
                <p className="text-xs text-[#5CB85C]">En ligne</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`
                    max-w-[70%] rounded-lg p-4
                    ${message.sender === 'me'
                      ? 'bg-primary text-white'
                      : 'bg-muted text-foreground'
                    }
                  `}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-2 ${message.sender === 'me' ? 'text-white/70' : 'text-muted-foreground'}`}>
                    {message.time}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Button variant="ghost" size="icon">
                <Paperclip className="w-5 h-5" />
              </Button>
              <Input
                type="text"
                placeholder="Écrivez votre message..."
                className="flex-1 bg-input-background"
              />
              <Button className="bg-primary hover:bg-primary/90">
                <Send className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              🔒 Vos messages sont chiffrés de bout en bout
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
