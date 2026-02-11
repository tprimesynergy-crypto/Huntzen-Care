import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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

interface MessagesProps {
  userRole?: string | null;
  preselectConsultationId?: string | null;
  onPreselectUsed?: () => void;
  preselectPractitionerId?: string | null;
  onPreselectPractitionerUsed?: () => void;
  /** When the user opened messages for a practitioner but has no conversation yet, call with that practitioner id so the app can e.g. open their profile to book. */
  onNoConversationWithPractitioner?: (practitionerId: string) => void;
}

function practitionerDisplayName(p: { title?: string; firstName?: string; lastName?: string }): string {
  const parts = [p.title || '', p.firstName || '', p.lastName || ''].filter(Boolean);
  return parts.join(' ').trim() || 'Praticien';
}

function practitionerAvatar(p: { firstName?: string; lastName?: string }): string {
  const f = (p.firstName || '')[0] || '';
  const l = (p.lastName || '')[0] || '';
  return (f + l).toUpperCase() || '?';
}

function formatSpecialtyForSearch(s?: string): string {
  if (!s) return '';
  return s.replace(/_/g, ' ').toLowerCase();
}

export function Messages({
  userRole,
  preselectConsultationId,
  onPreselectUsed,
  preselectPractitionerId,
  onPreselectPractitionerUsed,
  onNoConversationWithPractitioner,
}: MessagesProps) {
  const [conversations, setConversations] = useState<any[]>([]);
  const [allPractitioners, setAllPractitioners] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [wantedPractitionerId, setWantedPractitionerId] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const preselectRef = useRef<string | null>(null);
  const preselectPractitionerRef = useRef<string | null>(null);
  const onPreselectUsedRef = useRef(onPreselectUsed);
  const onPreselectPractitionerUsedRef = useRef(onPreselectPractitionerUsed);
  preselectRef.current = preselectConsultationId ?? null;
  preselectPractitionerRef.current = preselectPractitionerId ?? null;
  onPreselectUsedRef.current = onPreselectUsed;
  onPreselectPractitionerUsedRef.current = onPreselectPractitionerUsed;

  const loadConversations = useCallback(async () => {
    const preselectAtStart = preselectRef.current;
    const preselectPractitionerAtStart = preselectPractitionerRef.current;
    try {
      const [convList, pracList] = await Promise.all([
        api.getConversations(),
        userRole === 'EMPLOYEE' ? api.getPractitioners() : Promise.resolve([]),
      ]);
      const arr = Array.isArray(convList) ? convList : [];
      const practitioners = Array.isArray(pracList) ? pracList : [];
      setConversations(arr);
      setAllPractitioners(userRole === 'EMPLOYEE' ? practitioners : []);

      const sortedByLast = [...arr].sort((a, b) => {
        const ta = new Date(a.lastMessageTime || 0).getTime();
        const tb = new Date(b.lastMessageTime || 0).getTime();
        return tb - ta;
      });
      const firstWithConv = sortedByLast[0]?.id ?? arr[0]?.id ?? null;

      if (preselectAtStart && arr.some((c: { id: string }) => c.id === preselectAtStart)) {
        setSelectedId(preselectAtStart);
        setWantedPractitionerId(null);
        queueMicrotask(() => onPreselectUsedRef.current?.());
      } else if (preselectPractitionerAtStart) {
        const match = arr.find(
          (c: { practitionerId?: string }) => c.practitionerId === preselectPractitionerAtStart,
        );
        if (match) {
          setSelectedId(match.id);
          setWantedPractitionerId(null);
        } else if (userRole === 'EMPLOYEE') {
          setWantedPractitionerId(preselectPractitionerAtStart);
          setSelectedId(null);
        } else {
          setWantedPractitionerId(null);
          setSelectedId((prev) => (prev ? prev : firstWithConv));
        }
        queueMicrotask(() => onPreselectPractitionerUsedRef.current?.());
      } else {
        setWantedPractitionerId(null);
        setSelectedId((prev) => (prev ? prev : firstWithConv));
      }
    } catch {
      setConversations([]);
      setAllPractitioners([]);
      setWantedPractitionerId(null);
    } finally {
      setLoading(false);
    }
  }, [userRole]);

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

  const mergedList = useMemo(() => {
    if (userRole !== 'EMPLOYEE') {
      return conversations;
    }
    const withConv = conversations
      .filter((c) => c.practitionerId)
      .sort((a, b) => {
        const ta = new Date(a.lastMessageTime || 0).getTime();
        const tb = new Date(b.lastMessageTime || 0).getTime();
        return tb - ta;
      });
    if (allPractitioners.length === 0) {
      return withConv.length > 0 ? withConv : conversations;
    }
    const convByPrac = new Map<string, any>();
    conversations.forEach((c) => {
      if (c.practitionerId) convByPrac.set(c.practitionerId, c);
    });
    const withoutConv = allPractitioners
      .filter((p) => !convByPrac.has(p.id))
      .map((p) => ({
        id: null,
        practitionerId: p.id,
        practitioner: practitionerDisplayName(p),
        specialty: p.specialty,
        avatar: practitionerAvatar(p),
        lastMessage: null,
        lastMessageTime: null,
        unread: 0,
        _key: `prac-${p.id}`,
      }));
    return [...withConv, ...withoutConv];
  }, [userRole, conversations, allPractitioners]);

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const visibleList =
    normalizedSearch === ''
      ? mergedList
      : mergedList.filter((c) => {
          const name = (c.practitioner || c.employee || '').toString().toLowerCase();
          const specialtySearch = formatSpecialtyForSearch(c.specialty);
          const rawSpecialty = (c.specialty || '').toString().toLowerCase();
          return (
            name.includes(normalizedSearch) ||
            specialtySearch.includes(normalizedSearch) ||
            rawSpecialty.includes(normalizedSearch)
          );
        });

  const selected = mergedList.find((c) => c.id === selectedId);

  const handleSendToNewPractitioner = async () => {
    const text = input.trim();
    const wantedPractitioner = mergedList.find((c) => c.practitionerId === wantedPractitionerId);
    console.log('[Messages] handleSendToNewPractitioner called', {
      text,
      wantedPractitionerId,
      sending,
      receiver: wantedPractitioner?.practitioner ?? wantedPractitionerId,
      hasText: !!text,
      hasWantedId: !!wantedPractitionerId,
    });
    if (!text || !wantedPractitionerId || sending) return;
    setSendError(null);
    setSending(true);
    try {
      console.log('[Messages] Calling api.startConversation', { practitionerId: wantedPractitionerId });
      const { consultationId } = await api.startConversation(wantedPractitionerId);
      console.log('[Messages] startConversation OK', { consultationId });
      console.log('[Messages] Calling api.sendMessage', { consultationId, content: text });
      await api.sendMessage(consultationId, text);
      console.log('[Messages] sendMessage OK');
      setInput('');
      setSelectedId(consultationId);
      setWantedPractitionerId(null);
      await loadConversations();
      const list = await api.getMessages(consultationId);
      setMessages(Array.isArray(list) ? list : []);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erreur lors de l\'envoi.';
      setSendError(msg);
      console.error('[Messages] Error', { error: e, message: msg });
    } finally {
      setSending(false);
    }
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || !selectedId || sending) return;
    setSending(true);
    try {
      await api.sendMessage(selectedId, text);
      setInput('');
      const list = await api.getMessages(selectedId);
      setMessages(Array.isArray(list) ? list : []);
      // Refresh conversations so last message preview and time are up to date
      await loadConversations();
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
              <Input
                type="text"
                placeholder="Rechercher un praticien..."
                className="pl-10 bg-input-background"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto">
            {loading ? (
              <div className="text-center py-4 text-muted-foreground">Chargement…</div>
            ) : visibleList.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                {normalizedSearch ? 'Aucun praticien ne correspond à votre recherche.' : 'Aucun praticien.'}
              </div>
            ) : (
              visibleList.map((c) => {
                const key = c.id || c._key || c.practitionerId || `item-${c.practitioner}`;
                const isSelected =
                  (c.id && selectedId === c.id) ||
                  (!c.id && c.practitionerId && wantedPractitionerId === c.practitionerId);
                return (
                <button
                  key={key}
                  onClick={() => {
                    if (c.id) {
                      setSelectedId(c.id);
                      setWantedPractitionerId(null);
                    } else if (c.practitionerId) {
                      setSelectedId(null);
                      setWantedPractitionerId(c.practitionerId);
                    }
                  }}
                  className={`w-full p-4 rounded-lg text-left transition-colors border-2 ${
                    isSelected ? 'bg-primary/10 border-primary' : 'hover:bg-muted border-transparent'
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
                        {c.lastMessageTime ? formatMessageTime(c.lastMessageTime) : (c.id ? '' : 'Pas encore de conversation')}
                      </p>
                    </div>
                  </div>
                </button>
              );
              })
            )}
          </div>
        </Card>

        <Card className="lg:col-span-2 flex flex-col">
          {selected?.id ? (
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
          ) : wantedPractitionerId ? (
            (() => {
              const wantedPractitioner = mergedList.find((c) => c.practitionerId === wantedPractitionerId);
              return (
                <>
                  <div className="p-4 border-b border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                        {wantedPractitioner?.avatar ?? '?'}
                      </div>
                      <div>
                        <p className="font-semibold">{wantedPractitioner?.practitioner ?? 'Praticien'}</p>
                        <p className="text-xs text-muted-foreground">Nouvelle conversation</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 p-4 overflow-y-auto flex items-center justify-center">
                    <p className="text-sm text-muted-foreground text-center">
                      Écrivez votre premier message ci-dessous pour démarrer la conversation.
                    </p>
                  </div>
                  <div className="p-4 border-t border-border">
                    {sendError && (
                      <p className="text-sm text-destructive mb-2">{sendError}</p>
                    )}
                    <div className="flex gap-2">
                      <Button type="button" variant="ghost" size="icon">
                        <Paperclip className="w-5 h-5" />
                      </Button>
                      <Input
                        type="text"
                        value={input}
                        onChange={(e) => {
                          setInput(e.target.value);
                          setSendError(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendToNewPractitioner();
                          }
                        }}
                        placeholder="Écrivez votre message..."
                        className="flex-1 bg-input-background"
                        disabled={sending}
                      />
                      <Button
                        type="button"
                        className="bg-primary hover:bg-primary/90"
                        onClick={() => {
                          console.log('[Messages] Send button clicked (new practitioner)', {
                            input,
                            wantedPractitionerId,
                            sending,
                          });
                          handleSendToNewPractitioner();
                        }}
                        disabled={sending}
                      >
                        <Send className="w-5 h-5" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">🔒 Vos messages sont sécurisés</p>
                  </div>
                </>
              );
            })()
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              {mergedList.length === 0 && !loading
                ? 'Aucun praticien. Prenez rendez-vous pour échanger avec un praticien.'
                : 'Sélectionnez un praticien'}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
