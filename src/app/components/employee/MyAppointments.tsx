import { useState, useEffect } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Calendar, Clock, Video, MessageSquare, Star } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { api } from '@/app/services/api';

export function MyAppointments() {
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [past, setPast] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getConsultations().then((list) => {
      const arr = Array.isArray(list) ? list : [];
      const now = new Date();
      const up = arr
        .filter((c: any) => new Date(c.scheduledAt) >= now && c.status !== 'CANCELLED')
        .sort((a: any, b: any) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
        .map((c: any) => ({
          id: c.id,
          practitioner: `${c.practitioner?.title || ''} ${c.practitioner?.firstName} ${c.practitioner?.lastName}`.trim(),
          specialty: c.practitioner?.specialty ?? '',
          date: new Date(c.scheduledAt).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
          time: `${new Date(c.scheduledAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - ${new Date(c.scheduledEndAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`,
          type: c.format === 'VIDEO' ? 'Visioconférence' : c.format === 'AUDIO' ? 'Appel audio' : 'En personne',
          status: c.status === 'CONFIRMED' ? 'confirmed' : 'scheduled',
          avatar: `${c.practitioner?.firstName?.[0] || ''}${c.practitioner?.lastName?.[0] || ''}`.toUpperCase(),
          roomName: c.roomName,
          canJoin: (new Date(c.scheduledAt).getTime() - now.getTime()) / (60 * 1000) <= 10,
        }));
      const pa = arr
        .filter((c: any) => new Date(c.scheduledAt) < now || c.status === 'CANCELLED')
        .sort((a: any, b: any) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
        .map((c: any) => ({
          id: c.id,
          practitioner: `${c.practitioner?.title || ''} ${c.practitioner?.firstName} ${c.practitioner?.lastName}`.trim(),
          specialty: c.practitioner?.specialty ?? '',
          date: new Date(c.scheduledAt).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
          time: `${new Date(c.scheduledAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - ${new Date(c.scheduledEndAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`,
          type: c.format === 'VIDEO' ? 'Visioconférence' : c.format === 'AUDIO' ? 'Appel audio' : 'En personne',
          status: 'completed',
          avatar: `${c.practitioner?.firstName?.[0] || ''}${c.practitioner?.lastName?.[0] || ''}`.toUpperCase(),
          rated: false,
        }));
      setUpcoming(up);
      setPast(pa);
    }).catch(() => {
      setUpcoming([]);
      setPast([]);
    }).finally(() => setLoading(false));
  }, []);

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
              <Button className="bg-primary hover:bg-primary/90">Trouver un praticien</Button>
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
                      <span className="px-3 py-1 bg-[#5CB85C]/10 text-[#5CB85C] text-sm font-medium rounded-full">
                        Confirmé
                      </span>
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
                      <Button variant="outline">
                        <MessageSquare className="w-4 h-4 mr-2" /> Envoyer un message
                      </Button>
                      <Button variant="outline">
                        <Calendar className="w-4 h-4 mr-2" /> Reprogrammer
                      </Button>
                      <Button variant="ghost" className="text-destructive">Annuler</Button>
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
                        <Button className="bg-[#F39C12] hover:bg-[#F39C12]/90">
                          <Star className="w-4 h-4 mr-2" /> Évaluer cette séance
                        </Button>
                      )}
                      <Button className="bg-primary hover:bg-primary/90">
                        <Calendar className="w-4 h-4 mr-2" /> Reprendre RDV
                      </Button>
                      <Button variant="outline">
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
    </div>
  );
}
