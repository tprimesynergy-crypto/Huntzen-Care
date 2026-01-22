import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Calendar, Clock, Video, MapPin, MessageSquare, Star } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';

export function MyAppointments() {
  const upcomingAppointments = [
    {
      id: 1,
      practitioner: 'Dr. Sophie Martin',
      specialty: 'Psychologue clinicienne',
      date: 'Jeudi 23 Janvier 2025',
      time: '14:00 - 14:50',
      type: 'Visioconférence',
      status: 'confirmed',
      avatar: 'SM',
      canJoin: false,
    },
    {
      id: 2,
      practitioner: 'Dr. Thomas Lefebvre',
      specialty: 'Thérapeute cognitif',
      date: 'Lundi 27 Janvier 2025',
      time: '10:00 - 10:50',
      type: 'Visioconférence',
      status: 'confirmed',
      avatar: 'TL',
      canJoin: false,
    },
  ];

  const pastAppointments = [
    {
      id: 3,
      practitioner: 'Dr. Sophie Martin',
      specialty: 'Psychologue clinicienne',
      date: 'Jeudi 16 Janvier 2025',
      time: '14:00 - 14:50',
      type: 'Visioconférence',
      status: 'completed',
      avatar: 'SM',
      rated: false,
    },
    {
      id: 4,
      practitioner: 'Dr. Marie Dubois',
      specialty: 'Psychiatre',
      date: 'Lundi 13 Janvier 2025',
      time: '11:00 - 11:50',
      type: 'Visioconférence',
      status: 'completed',
      avatar: 'MD',
      rated: true,
      rating: 5,
    },
    {
      id: 5,
      practitioner: 'Dr. Sophie Martin',
      specialty: 'Psychologue clinicienne',
      date: 'Jeudi 9 Janvier 2025',
      time: '14:00 - 14:50',
      type: 'Visioconférence',
      status: 'completed',
      avatar: 'SM',
      rated: true,
      rating: 5,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-foreground mb-2">
          Mes rendez-vous
        </h1>
        <p className="text-muted-foreground">
          Gérez vos consultations passées et à venir.
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full md:w-96 grid-cols-2">
          <TabsTrigger value="upcoming">
            À venir ({upcomingAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Passées ({pastAppointments.length})
          </TabsTrigger>
        </TabsList>

        {/* Upcoming Appointments */}
        <TabsContent value="upcoming" className="space-y-4 mt-6">
          {upcomingAppointments.length === 0 ? (
            <Card className="p-12 text-center">
              <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun rendez-vous à venir</h3>
              <p className="text-muted-foreground mb-4">
                Prenez rendez-vous avec un praticien pour commencer votre accompagnement.
              </p>
              <Button className="bg-primary hover:bg-primary/90">
                Trouver un praticien
              </Button>
            </Card>
          ) : (
            upcomingAppointments.map((appointment) => (
              <Card key={appointment.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex gap-4">
                  {/* Avatar */}
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-lg font-semibold flex-shrink-0">
                    {appointment.avatar}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">
                          {appointment.practitioner}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {appointment.specialty}
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-[#5CB85C]/10 text-[#5CB85C] text-sm font-medium rounded-full">
                        Confirmé
                      </span>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="text-foreground">{appointment.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-primary" />
                        <span className="text-foreground">{appointment.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Video className="w-4 h-4 text-primary" />
                        <span className="text-foreground">{appointment.type}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
                      <Button 
                        className="bg-primary hover:bg-primary/90"
                        disabled={!appointment.canJoin}
                      >
                        <Video className="w-4 h-4 mr-2" />
                        Rejoindre la séance
                      </Button>
                      <Button variant="outline">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Envoyer un message
                      </Button>
                      <Button variant="outline">
                        <Calendar className="w-4 h-4 mr-2" />
                        Reprogrammer
                      </Button>
                      <Button variant="ghost" className="text-destructive">
                        Annuler
                      </Button>
                    </div>

                    {/* Info Notice */}
                    {!appointment.canJoin && (
                      <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          ℹ️ Le bouton "Rejoindre" sera disponible 10 minutes avant le début de la séance.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Past Appointments */}
        <TabsContent value="past" className="space-y-4 mt-6">
          {pastAppointments.map((appointment) => (
            <Card key={appointment.id} className="p-6">
              <div className="flex gap-4">
                {/* Avatar */}
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center text-foreground text-lg font-semibold flex-shrink-0">
                  {appointment.avatar}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {appointment.practitioner}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {appointment.specialty}
                      </p>
                    </div>
                    {appointment.rated ? (
                      <div className="flex items-center gap-1">
                        {Array.from({ length: appointment.rating }).map((_, i) => (
                          <Star
                            key={i}
                            className="w-4 h-4 fill-[#F39C12] text-[#F39C12]"
                          />
                        ))}
                      </div>
                    ) : (
                      <span className="px-3 py-1 bg-muted text-muted-foreground text-sm font-medium rounded-full">
                        Terminé
                      </span>
                    )}
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{appointment.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{appointment.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Video className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{appointment.type}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
                    {!appointment.rated && (
                      <Button className="bg-[#F39C12] hover:bg-[#F39C12]/90">
                        <Star className="w-4 h-4 mr-2" />
                        Évaluer cette séance
                      </Button>
                    )}
                    <Button className="bg-primary hover:bg-primary/90">
                      <Calendar className="w-4 h-4 mr-2" />
                      Reprendre RDV
                    </Button>
                    <Button variant="outline">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Envoyer un message
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
