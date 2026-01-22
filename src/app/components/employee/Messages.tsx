import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { MessageSquare, Send, Search, Paperclip } from 'lucide-react';
import { api } from '@/app/services/api';

function formatMessageTime(d: string | Date): string {
  const date = new Date(d);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (60 * 1000));
  const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  if (diffMins < 1) return 'À l\'instant';
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays === 1) return 'Hier';
  if (diffDays < 7) return `Il y a ${diffDays} jours`;
  return date.toLocaleDateString('fr-FR');
}

export function Messages() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const loadConversations = useCallback(async () => {
    try {
      const list = await api.getConversations();
      const arr = Array.isArray(list) ? list : [];
      setConversations(arr);
      setSelectedId((prev) => (prev ? prev : arr[0]?.id ?? null));
    } catch {
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (!selectedId) {
      setMessages([]);
      return;
    }
    api.getMessages(selectedId).then((list) => {
      setMessages(Array.isArray(list) ? list : []);
    }).catch(() => setMessages([]));
  }, [selectedId]);

  const selected = conversations.find((c) => c.id === selectedId);
  const handleSend = async () => {
    const text = input.trim();
    if (!text || !selectedId || sending) return;
    setSending(true);
    try {
      await api.sendMessage(selectedId, text);
      setInput('');
      const list = await api.getMessages(selectedId);
      setMessages(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-foreground mb-2">Messages</h1>
        <p className="text-muted-foreground">
          Communiquez en toute confidentialité avec vos praticiens.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-240px)]">
        <Card className="lg:col-span-1 p-4 flex flex-col">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input type="text" placeholder="Rechercher..." className="pl-10 bg-input-background" />
            </div>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto">
            {loading ? (
              <div className="text-center py-4 text-muted-foreground">Chargement…</div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">Aucune conversation.</div>
            ) : (
              conversations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  className={`w-full p-4 rounded-lg text-left transition-colors border-2 ${
                    selectedId === c.id ? 'bg-primary/10 border-primary' : 'hover:bg-muted border-transparent'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                      {c.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <p className="font-semibold text-sm truncate">{c.practitioner || c.employee}</p>
                        {c.unread > 0 && (
                          <span className="ml-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                            {c.unread}
                          </span>
                        )}
                      </div>
                      {c.specialty && <p className="text-xs text-muted-foreground mb-1">{c.specialty}</p>}
                      <p className="text-xs text-muted-foreground truncate">{c.lastMessage || '—'}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {c.lastMessageTime ? formatMessageTime(c.lastMessageTime) : ''}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </Card>

        <Card className="lg:col-span-2 flex flex-col">
          {selected ? (
            <>
              <div className="p-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                    {selected.avatar}
                  </div>
                  <div>
                    <p className="font-semibold">{selected.practitioner || selected.employee}</p>
                    <p className="text-xs text-muted-foreground">Messages sécurisés</p>
                  </div>
                </div>
              </div>
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${m.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-4 ${
                        m.sender === 'me' ? 'bg-primary text-white' : 'bg-muted text-foreground'
                      }`}
                    >
                      <p className="text-sm">{m.content}</p>
                      <p className={`text-xs mt-2 ${m.sender === 'me' ? 'text-white/70' : 'text-muted-foreground'}`}>
                        {formatMessageTime(m.time)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon">
                    <Paperclip className="w-5 h-5" />
                  </Button>
                  <Input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                    placeholder="Écrivez votre message..."
                    className="flex-1 bg-input-background"
                    disabled={sending}
                  />
                  <Button className="bg-primary hover:bg-primary/90" onClick={handleSend} disabled={sending}>
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">🔒 Vos messages sont sécurisés</p>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              {conversations.length === 0 && !loading
                ? 'Aucune conversation. Prenez rendez-vous pour échanger avec un praticien.'
                : 'Sélectionnez une conversation'}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
