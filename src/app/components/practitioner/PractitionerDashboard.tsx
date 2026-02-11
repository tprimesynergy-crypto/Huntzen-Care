import { useState, useEffect } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Calendar, Users, Clock, MessageSquare, Video, CheckCircle, Star } from 'lucide-react';
import { api } from '@/app/services/api';

export function PractitionerDashboard() {
  const [me, setMe] = useState<any>(null);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [ratingsStats, setRatingsStats] = useState<{ avgReceived: number | null; countReceived: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getPractitionerMe().catch(() => null),
      api.getConsultations().catch(() => []),
      api.getConversations().catch(() => []),
      api.getRatingsStats().catch(() => ({ avgReceived: null, countReceived: 0 })),
    ]).then(([p, cons, conv, rStats]) => {
      setMe(p ?? null);
      setConsultations(Array.isArray(cons) ? cons : []);
      setConversations(Array.isArray(conv) ? conv : []);
      setRatingsStats(rStats && typeof rStats === 'object' ? rStats : null);
    }).finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const isDev = import.meta.env.DEV; // true in development, false in production

  const todayAppointments = consultations.filter((c: any) => {
    const d = new Date(c.scheduledAt);
    return d >= todayStart && d < todayEnd && c.status !== 'CANCELLED';
  }).sort((a: any, b: any) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
    .map((c: any) => {
      // In dev: always allow joining. In prod: only 10 minutes before
      const minutesUntilStart = (new Date(c.scheduledAt).getTime() - now.getTime()) / (60 * 1000);
      const canJoin = isDev ? true : minutesUntilStart <= 10;
      return { ...c, canJoin };
    });

  const thisMonth = consultations.filter((c: any) => new Date(c.scheduledAt) >= thisMonthStart && c.status !== 'CANCELLED');
  const completed = consultations.filter((c: any) => c.status === 'COMPLETED');
  // Backend semantics:
  // - SCHEDULED = en attente de confirmation
  // - CONFIRMED = confirmé
  const pendingConsultations = consultations.filter((c: any) => c.status === 'SCHEDULED');
  const uniqueEmployees = new Map<string, { employee: any; lastAt: Date; count: number }>();
  consultations.forEach((c: any) => {
    const e = c.employee;
    if (!e?.id) return;
    const last = new Date(c.scheduledAt);
    const prev = uniqueEmployees.get(e.id);
    if (!prev) {
      uniqueEmployees.set(e.id, { employee: e, lastAt: last, count: 1 });
    } else {
      prev.count++;
      if (last > prev.lastAt) prev.lastAt = last;
    }
  });
  const recentPatients = Array.from(uniqueEmployees.values())
    .sort((a, b) => b.lastAt.getTime() - a.lastAt.getTime())
    .slice(0, 5);

  const name = me ? `${me.title || ''} ${me.firstName} ${me.lastName}`.trim() : '…';

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-foreground mb-2">Bonjour {name} 👋</h1>
        <p className="text-muted-foreground">
          Voici un aperçu de votre activité. Vous avez {todayAppointments.length} consultation{todayAppointments.length !== 1 ? 's' : ''} aujourd&apos;hui.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center text-white">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Patients distincts</p>
              <p className="text-2xl font-bold">{uniqueEmployees.size}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center text-white">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Séances ce mois</p>
              <p className="text-2xl font-bold">{thisMonth.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-[#5CB85C] flex items-center justify-center text-white">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Séances réalisées</p>
              <p className="text-2xl font-bold">{completed.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-[#F39C12] flex items-center justify-center text-white">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">RDV en attente</p>
              <p className="text-2xl font-bold">{pendingConsultations.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-amber-500 flex items-center justify-center text-white">
              <Star className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Note moyenne</p>
              <p className="text-2xl font-bold">
                {ratingsStats?.avgReceived != null ? `${ratingsStats.avgReceived.toFixed(1)}/5` : '—'}
              </p>
              <p className="text-xs text-muted-foreground">
                {ratingsStats?.countReceived ?? 0} évaluation{(ratingsStats?.countReceived ?? 0) > 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-primary" />
              Consultations d&apos;aujourd&apos;hui
            </h2>
            {todayAppointments.length === 0 ? (
              <p className="text-muted-foreground py-4">Aucune consultation aujourd&apos;hui.</p>
            ) : (
              <div className="space-y-4">
                {todayAppointments.map((c: any) => {
                  const emp = c.employee;
                  const patient = emp ? `${emp.firstName} ${emp.lastName}` : 'Patient';
                  const initials = emp ? `${emp.firstName?.[0] ?? ''}${emp.lastName?.[0] ?? ''}` : '?';
                  const time = `${new Date(c.scheduledAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - ${new Date(c.scheduledEndAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
                  const type = c.format === 'VIDEO' ? 'Visioconférence' : c.format === 'AUDIO' ? 'Téléphone' : 'Présentiel';
                  // Use the same roomName from the consultation - this ensures both practitioner and employee join the same room
                  const roomName = c.roomName || `huntzen-${c.id}`;
                  const isPending = c.status === 'SCHEDULED';
                  return (
                    <div key={c.id} className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg">
                      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                        {initials}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{patient}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{time}</span>
                          <span className="flex items-center gap-1"><Video className="w-4 h-4" />{type}</span>
                        </div>
                        {isPending && (
                          <div className="mt-2 inline-flex items-center px-2 py-1 rounded-full bg-[#F39C12]/10 text-[#F39C12] text-xs font-medium">
                            En attente de votre confirmation
                          </div>
                        )}
                        {c.status === 'COMPLETED' && (
                          <div className="mt-2 inline-flex items-center px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-medium">
                            <CheckCircle className="w-3.5 h-3.5 mr-1" />
                            Terminée
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        {c.status !== 'COMPLETED' && (
                          <Button 
                            size="sm" 
                            className="bg-primary hover:bg-primary/90"
                            disabled={!c.canJoin}
                            onClick={() => {
                              window.open(`https://meet.jit.si/${roomName}`, '_blank', 'width=1200,height=800');
                            }}
                          >
                            <Video className="w-4 h-4 mr-2" />
                            {c.canJoin ? 'Rejoindre' : 'Démarrer'}
                          </Button>
                        )}
                        {isPending && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              try {
                                await api.confirmConsultation(c.id);
                                const cons = await api.getConsultations().catch(() => []);
                                setConsultations(Array.isArray(cons) ? cons : []);
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
                        {c.status === 'CONFIRMED' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-emerald-600 border-emerald-600 hover:bg-emerald-50"
                            onClick={async () => {
                              try {
                                await api.completeConsultation(c.id);
                                const cons = await api.getConsultations().catch(() => []);
                                setConsultations(Array.isArray(cons) ? cons : []);
                              } catch (err) {
                                console.error(err);
                                window.alert(
                                  err instanceof Error
                                    ? err.message
                                    : 'Erreur lors de la clôture du rendez-vous.',
                                );
                              }
                            }}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Marquer comme terminée
                          </Button>
                        )}
                      </div>
                      {c.status !== 'COMPLETED' && !c.canJoin && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          Disponible 10 min avant
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-primary" />
              Patients récents
            </h2>
            {recentPatients.length === 0 ? (
              <p className="text-muted-foreground py-4">Aucun patient.</p>
            ) : (
              <div className="space-y-3">
                {recentPatients.map(({ employee, lastAt, count }) => (
                  <div key={employee.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                        {employee.firstName?.[0]}{employee.lastName?.[0]}
                      </div>
                      <div>
                        <p className="font-medium">{employee.firstName} {employee.lastName}</p>
                        <p className="text-sm text-muted-foreground">
                          {count} séance{count > 1 ? 's' : ''} · Dernière le {lastAt.toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-primary" />
              Messages
            </h2>
            {conversations.length === 0 ? (
              <p className="text-muted-foreground text-sm">Aucune conversation.</p>
            ) : (
              <div className="space-y-2">
                {conversations.slice(0, 5).map((c) => (
                  <div key={c.id} className="p-3 rounded-lg hover:bg-muted/50 cursor-pointer">
                    <p className="font-medium text-sm">{c.employee || c.practitioner}</p>
                    <p className="text-xs text-muted-foreground truncate">{c.lastMessage || '—'}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
