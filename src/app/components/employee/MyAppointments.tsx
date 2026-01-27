import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/app/components/ui/dialog';
import { Calendar, Clock, Video, MessageSquare, Star } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { api } from '@/app/services/api';

interface MyAppointmentsProps {
  onNavigate?: (tab: string) => void;
  onNavigateToMessages?: (consultationId: string, practitionerId?: string) => void;
  userRole?: string | null;
}

function normalize(list: any[], now: Date, userRole?: string | null) {
  const arr = Array.isArray(list) ? list : [];
  const isDev = import.meta.env.DEV; // true in development, false in production
  const isPractitioner = userRole === 'PRACTITIONER';
  
  const up = arr
    .filter((c: any) => new Date(c.scheduledAt) >= now && c.status !== 'CANCELLED')
    .sort((a: any, b: any) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
    .map((c: any) => {
      // In dev: always allow joining. In prod: only 10 minutes before
      const minutesUntilStart = (new Date(c.scheduledAt).getTime() - now.getTime()) / (60 * 1000);
      const canJoin = isDev ? true : minutesUntilStart <= 10;
      
      // For practitioners: show employee info. For employees: show practitioner info
      const displayName = isPractitioner
        ? `${c.employee?.firstName || ''} ${c.employee?.lastName || ''}`.trim() || 'Patient'
        : `${c.practitioner?.title || ''} ${c.practitioner?.firstName || ''} ${c.practitioner?.lastName || ''}`.trim();
      
      const displayInfo = isPractitioner
        ? c.employee?.department || 'Patient'
        : c.practitioner?.specialty ?? '';
      
      const avatar = isPractitioner
        ? `${c.employee?.firstName?.[0] || ''}${c.employee?.lastName?.[0] || ''}`.toUpperCase() || '?'
        : `${c.practitioner?.firstName?.[0] || ''}${c.practitioner?.lastName?.[0] || ''}`.toUpperCase();
      
      // Backend semantics:
      // - SCHEDULED = en attente de confirmation
      // - CONFIRMED = confirmé
      const status: 'pending' | 'confirmed' =
        c.status === 'CONFIRMED' ? 'confirmed' : 'pending';

      return {
        id: c.id,
        practitionerId: c.practitionerId,
        practitioner: displayName,
        specialty: displayInfo,
        date: new Date(c.scheduledAt).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
        time: `${new Date(c.scheduledAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - ${new Date(c.scheduledEndAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`,
        type: c.format === 'VIDEO' ? 'Visioconférence' : c.format === 'AUDIO' ? 'Appel audio' : 'En personne',
        status,
        avatar,
        roomName: c.roomName,
        canJoin,
        scheduledAt: c.scheduledAt,
        scheduledEndAt: c.scheduledEndAt,
        durationMinutes: c.duration ?? 50,
      };
    });
  const pa = arr
    // Only keep consultations réellement effectuées (exclut les rendez-vous annulés)
    .filter((c: any) => new Date(c.scheduledAt) < now && c.status !== 'CANCELLED')
    .sort((a: any, b: any) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
    .map((c: any) => {
      // For practitioners: show employee info. For employees: show practitioner info
      const displayName = isPractitioner
        ? `${c.employee?.firstName || ''} ${c.employee?.lastName || ''}`.trim() || 'Patient'
        : `${c.practitioner?.title || ''} ${c.practitioner?.firstName || ''} ${c.practitioner?.lastName || ''}`.trim();
      
      const displayInfo = isPractitioner
        ? c.employee?.department || 'Patient'
        : c.practitioner?.specialty ?? '';
      
      const avatar = isPractitioner
        ? `${c.employee?.firstName?.[0] || ''}${c.employee?.lastName?.[0] || ''}`.toUpperCase() || '?'
        : `${c.practitioner?.firstName?.[0] || ''}${c.practitioner?.lastName?.[0] || ''}`.toUpperCase();
      
      return {
        id: c.id,
        practitionerId: c.practitionerId,
        practitioner: displayName,
        specialty: displayInfo,
        date: new Date(c.scheduledAt).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
        time: `${new Date(c.scheduledAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - ${new Date(c.scheduledEndAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`,
        type: c.format === 'VIDEO' ? 'Visioconférence' : c.format === 'AUDIO' ? 'Appel audio' : 'En personne',
        status: 'completed',
        avatar,
        rated: false,
      };
    });
  return { up, pa };
}

type RescheduleData = {
  id: string;
  practitioner: string;
  scheduledAt: string;
  scheduledEndAt: string;
  durationMinutes: number;
};

function toDateInput(d: Date | string): string {
  const dt = typeof d === 'string' ? new Date(d) : d;
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const day = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function toTimeInput(d: Date | string): string {
  const dt = typeof d === 'string' ? new Date(d) : d;
  const h = String(dt.getHours()).padStart(2, '0');
  const min = String(dt.getMinutes()).padStart(2, '0');
  return `${h}:${min}`;
}

export function MyAppointments({ onNavigate, onNavigateToMessages, userRole }: MyAppointmentsProps) {
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [past, setPast] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [rescheduleData, setRescheduleData] = useState<RescheduleData | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [rescheduleSaving, setRescheduleSaving] = useState(false);
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);
  const [cancelData, setCancelData] = useState<{
    id: string;
    practitioner: string;
    date: string;
    time: string;
  } | null>(null);
  const [cancelSaving, setCancelSaving] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    api.getConsultations().then((list) => {
      const { up, pa } = normalize(list, new Date(), userRole);
      setUpcoming(up);
      setPast(pa);
    }).catch(() => {
      setUpcoming([]);
      setPast([]);
    }).finally(() => setLoading(false));
  }, [userRole]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-foreground mb-2">Mes rendez-vous</h1>
        <p className="text-muted-foreground">Gérez vos consultations passées et à venir.</p>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full md:w-96 grid-cols-2">
          <TabsTrigger value="upcoming">À venir ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="past">Passées ({past.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4 mt-6">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Chargement…</div>
          ) : upcoming.length === 0 ? (
            <Card className="p-12 text-center">
              <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun rendez-vous à venir</h3>
              <p className="text-muted-foreground mb-4">
                Prenez rendez-vous avec un praticien pour commencer votre accompagnement.
              </p>
              <Button className="bg-primary hover:bg-primary/90" onClick={() => onNavigate?.('practitioners')}>
                Trouver un praticien
              </Button>
            </Card>
          ) : (
            upcoming.map((a) => (
              <Card key={a.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex gap-4">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-lg font-semibold flex-shrink-0">
                    {a.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">{a.practitioner}</h3>
                        <p className="text-sm text-muted-foreground">{a.specialty}</p>
                      </div>
                      {a.status === 'pending' ? (
                        <span className="px-3 py-1 bg-[#F39C12]/10 text-[#F39C12] text-sm font-medium rounded-full">
                          En attente de confirmation
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-[#5CB85C]/10 text-[#5CB85C] text-sm font-medium rounded-full">
                          Confirmé
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="text-foreground">{a.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-primary" />
                        <span className="text-foreground">{a.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Video className="w-4 h-4 text-primary" />
                        <span className="text-foreground">{a.type}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
                      <Button
                        className="bg-primary hover:bg-primary/90"
                        disabled={!a.canJoin}
                        onClick={() => {
                          const room = a.roomName || `huntzen-${a.id}`;
                          window.open(`https://meet.jit.si/${room}`, '_blank', 'width=1200,height=800');
                        }}
                      >
                        <Video className="w-4 h-4 mr-2" /> Rejoindre la séance
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() =>
                          (onNavigateToMessages ? onNavigateToMessages(a.id, a.practitionerId) : onNavigate?.('messages'))
                        }
                      >
                        <MessageSquare className="w-4 h-4 mr-2" /> Envoyer un message
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setRescheduleData({
                            id: a.id,
                            practitioner: a.practitioner,
                            scheduledAt: a.scheduledAt,
                            scheduledEndAt: a.scheduledEndAt,
                            durationMinutes: a.durationMinutes,
                          });
                          setRescheduleDate(toDateInput(a.scheduledAt));
                          setRescheduleTime(toTimeInput(a.scheduledAt));
                          setRescheduleError(null);
                        }}
                      >
                        <Calendar className="w-4 h-4 mr-2" /> Reprogrammer
                      </Button>
                      {userRole === 'PRACTITIONER' && a.status === 'pending' && (
                        <Button
                          variant="outline"
                          onClick={async () => {
                            try {
                              await api.confirmConsultation(a.id);
                              await load();
                            } catch (err) {
                              console.error(err);
                              window.alert(
                                err instanceof Error
                                  ? err.message
                                  : 'Erreur lors de la confirmation du rendez-vous.',
                              );
                            }
                          }}
                        >
                          Confirmer le rendez-vous
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        className="text-destructive"
                        disabled={cancellingId === a.id}
                        onClick={() => {
                          setCancelData({
                            id: a.id,
                            practitioner: a.practitioner,
                            date: a.date,
                            time: a.time,
                          });
                          setCancelError(null);
                        }}
                      >
                        {cancellingId === a.id ? 'Annulation…' : 'Annuler'}
                      </Button>
                    </div>
                    {!a.canJoin && (
                      <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          ℹ️ Le bouton &quot;Rejoindre&quot; sera disponible 10 minutes avant le début de la séance.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4 mt-6">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Chargement…</div>
          ) : past.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">Aucune consultation passée.</p>
            </Card>
          ) : (
            past.map((a) => (
              <Card key={a.id} className="p-6">
                <div className="flex gap-4">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center text-foreground text-lg font-semibold flex-shrink-0">
                    {a.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">{a.practitioner}</h3>
                        <p className="text-sm text-muted-foreground">{a.specialty}</p>
                      </div>
                      <span className="px-3 py-1 bg-muted text-muted-foreground text-sm font-medium rounded-full">
                        Terminé
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{a.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{a.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Video className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{a.type}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
                      {!a.rated && (
                        <Button
                          className="bg-[#F39C12] hover:bg-[#F39C12]/90"
                          onClick={() => window.alert('L\'évaluation des séances sera bientôt disponible.')}
                        >
                          <Star className="w-4 h-4 mr-2" /> Évaluer cette séance
                        </Button>
                      )}
                      <Button className="bg-primary hover:bg-primary/90" onClick={() => onNavigate?.('practitioners')}>
                        <Calendar className="w-4 h-4 mr-2" /> Reprendre RDV
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() =>
                          (onNavigateToMessages ? onNavigateToMessages(a.id, a.practitionerId) : onNavigate?.('messages'))
                        }
                      >
                        <MessageSquare className="w-4 h-4 mr-2" /> Envoyer un message
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      <Dialog
        open={!!rescheduleData}
        onOpenChange={(open) => {
          if (!open) {
            setRescheduleData(null);
            setRescheduleError(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reprogrammer le rendez-vous</DialogTitle>
            <DialogDescription>
              {rescheduleData && (
                <>Avec {rescheduleData.practitioner}. Choisissez une nouvelle date et heure.</>
              )}
            </DialogDescription>
          </DialogHeader>
          {rescheduleData && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setRescheduleError(null);
                setRescheduleSaving(true);
                try {
                  const start = new Date(`${rescheduleDate}T${rescheduleTime}:00`);
                  if (Number.isNaN(start.getTime())) {
                    setRescheduleError('Date ou heure invalide.');
                    return;
                  }
                  if (start.getTime() < Date.now()) {
                    setRescheduleError('La date et l\'heure doivent être dans le futur.');
                    return;
                  }
                  const end = new Date(
                    start.getTime() + rescheduleData.durationMinutes * 60 * 1000,
                  );
                  await api.rescheduleConsultation(rescheduleData.id, {
                    scheduledAt: start.toISOString(),
                    scheduledEndAt: end.toISOString(),
                  });
                  setRescheduleData(null);
                  await load();
                } catch (err) {
                  setRescheduleError(
                    err instanceof Error ? err.message : 'Erreur lors de la reprogrammation.',
                  );
                } finally {
                  setRescheduleSaving(false);
                }
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reschedule-date">Date</Label>
                  <Input
                    id="reschedule-date"
                    type="date"
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    required
                    disabled={rescheduleSaving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reschedule-time">Heure</Label>
                  <Input
                    id="reschedule-time"
                    type="time"
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                    required
                    disabled={rescheduleSaving}
                  />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Durée : {rescheduleData.durationMinutes} min
              </p>
              {rescheduleError && (
                <p className="text-sm text-destructive">{rescheduleError}</p>
              )}
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setRescheduleData(null);
                    setRescheduleError(null);
                  }}
                  disabled={rescheduleSaving}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={rescheduleSaving}>
                  {rescheduleSaving ? 'Enregistrement…' : 'Enregistrer'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!cancelData}
        onOpenChange={(open) => {
          if (!open && !cancelSaving) {
            setCancelData(null);
            setCancelError(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Annuler le rendez-vous</DialogTitle>
            <DialogDescription>
              {cancelData
                ? `Voulez-vous vraiment annuler le rendez-vous avec ${cancelData.practitioner} le ${cancelData.date} à ${cancelData.time} ?`
                : null}
            </DialogDescription>
          </DialogHeader>
          {cancelData && (
            <div className="space-y-4">
              {cancelError && (
                <p className="text-sm text-destructive">
                  {cancelError}
                </p>
              )}
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setCancelData(null);
                    setCancelError(null);
                  }}
                  disabled={cancelSaving}
                >
                  Conserver le rendez-vous
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={cancelSaving}
                  onClick={async () => {
                    if (!cancelData) return;
                    setCancelError(null);
                    setCancelSaving(true);
                    setCancellingId(cancelData.id);
                    try {
                      await api.cancelConsultation(cancelData.id);
                      await load();
                      setCancelData(null);
                    } catch (e) {
                      console.error(e);
                      setCancelError(
                        e instanceof Error
                          ? e.message
                          : 'Une erreur est survenue lors de l’annulation du rendez-vous.',
                      );
                    } finally {
                      setCancelSaving(false);
                      setCancellingId(null);
                    }
                  }}
                >
                  {cancelSaving ? 'Annulation…' : 'Confirmer l’annulation'}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
