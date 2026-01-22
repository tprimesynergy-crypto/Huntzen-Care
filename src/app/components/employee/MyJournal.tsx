import { useState } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Textarea } from '@/app/components/ui/textarea';
import { BookOpen, Plus, Calendar, Smile, Meh, Frown, Edit, Trash2 } from 'lucide-react';

export function MyJournal() {
  const [isCreating, setIsCreating] = useState(false);

  const moodIcons = [
    { value: 5, icon: Smile, label: 'Très bien', color: 'text-[#5CB85C]' },
    { value: 4, icon: Smile, label: 'Bien', color: 'text-[#5BC0DE]' },
    { value: 3, icon: Meh, label: 'Neutre', color: 'text-[#F39C12]' },
    { value: 2, icon: Frown, label: 'Pas bien', color: 'text-[#E74C3C]' },
    { value: 1, icon: Frown, label: 'Très mal', color: 'text-[#C0392B]' },
  ];

  const journalEntries = [
    {
      id: 1,
      date: '20 Janvier 2025',
      mood: 4,
      title: 'Belle journée productive',
      content: 'Aujourd\'hui était une bonne journée. J\'ai réussi à finir mon projet et je me sens satisfait. La séance avec Dr. Martin hier m\'a vraiment aidé à gérer mon stress.',
      tags: ['travail', 'productivité'],
    },
    {
      id: 2,
      date: '18 Janvier 2025',
      mood: 3,
      title: 'Journée en demi-teinte',
      content: 'Réunion stressante ce matin, mais après-midi plus calme. J\'ai appliqué les techniques de respiration et ça m\'a aidé.',
      tags: ['stress', 'techniques'],
    },
    {
      id: 3,
      date: '15 Janvier 2025',
      mood: 5,
      title: 'Excellente séance aujourd\'hui',
      content: 'Ma consultation avec Dr. Martin m\'a vraiment fait du bien. Je commence à voir des progrès dans ma gestion du stress.',
      tags: ['consultation', 'progrès'],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground mb-2">
            Mon Journal Personnel
          </h1>
          <p className="text-muted-foreground">
            Notez vos pensées, vos progrès et votre état d'esprit. Totalement confidentiel.
          </p>
        </div>
        <Button 
          className="bg-primary hover:bg-primary/90"
          onClick={() => setIsCreating(!isCreating)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle entrée
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-semibold">12</p>
              <p className="text-sm text-muted-foreground">Entrées totales</p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#5CB85C]/10 rounded-lg flex items-center justify-center">
              <Smile className="w-6 h-6 text-[#5CB85C]" />
            </div>
            <div>
              <p className="text-2xl font-semibold">4.2/5</p>
              <p className="text-sm text-muted-foreground">Humeur moyenne</p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#F39C12]/10 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-[#F39C12]" />
            </div>
            <div>
              <p className="text-2xl font-semibold">7</p>
              <p className="text-sm text-muted-foreground">Jours consécutifs</p>
            </div>
          </div>
        </Card>
      </div>

      {/* New Entry Form */}
      {isCreating && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Nouvelle entrée</h3>
          
          {/* Mood Selector */}
          <div className="mb-4">
            <label className="text-sm font-medium mb-2 block">
              Comment vous sentez-vous aujourd'hui ?
            </label>
            <div className="flex gap-4">
              {moodIcons.map((mood) => {
                const Icon = mood.icon;
                return (
                  <button
                    key={mood.value}
                    className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <Icon className={`w-8 h-8 ${mood.color}`} />
                    <span className="text-xs text-muted-foreground">{mood.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div className="mb-4">
            <label className="text-sm font-medium mb-2 block">
              Titre (optionnel)
            </label>
            <input
              type="text"
              placeholder="Ex: Belle journée productive"
              className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Content */}
          <div className="mb-4">
            <label className="text-sm font-medium mb-2 block">
              Vos pensées
            </label>
            <Textarea
              placeholder="Décrivez votre journée, vos émotions, vos réflexions..."
              className="min-h-32 bg-input-background"
            />
          </div>

          {/* Tags */}
          <div className="mb-4">
            <label className="text-sm font-medium mb-2 block">
              Tags (optionnel)
            </label>
            <input
              type="text"
              placeholder="Ex: travail, stress, progrès"
              className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Séparez les tags par des virgules
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button className="bg-primary hover:bg-primary/90">
              Enregistrer
            </Button>
            <Button variant="outline" onClick={() => setIsCreating(false)}>
              Annuler
            </Button>
          </div>

          {/* Privacy Notice */}
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              🔒 Vos entrées de journal sont strictement confidentielles et chiffrées. 
              Personne, pas même votre employeur ou vos praticiens, ne peut les lire.
            </p>
          </div>
        </Card>
      )}

      {/* Journal Entries */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Vos entrées</h2>
        
        {journalEntries.map((entry) => {
          const MoodIcon = moodIcons.find(m => m.value === entry.mood)?.icon || Meh;
          const moodColor = moodIcons.find(m => m.value === entry.mood)?.color || 'text-muted-foreground';
          
          return (
            <Card key={entry.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <MoodIcon className={`w-6 h-6 ${moodColor}`} />
                  <div>
                    <h3 className="text-lg font-semibold">{entry.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{entry.date}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <p className="text-muted-foreground mb-3">{entry.content}</p>

              <div className="flex flex-wrap gap-2">
                {entry.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
