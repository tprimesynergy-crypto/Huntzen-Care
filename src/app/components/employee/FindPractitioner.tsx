import { useState, useEffect } from 'react';
import { Card } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Search, MapPin, Star, Calendar, Heart, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { api } from '@/app/services/api';

const SPECIALTY_LABELS: Record<string, string> = {
  PSYCHOLOGUE_CLINICIEN: 'Psychologue clinicien',
  PSYCHOLOGUE_TRAVAIL: 'Psychologue du travail',
  PSYCHIATRE: 'Psychiatre',
  PSYCHOTHERAPEUTE: 'Psychothérapeute',
  NEUROPSYCHOLOGUE: 'Neuropsychologue',
  COACH_MENTAL: 'Coach mental',
  SEXOLOGUE: 'Sexologue',
  PSYCHANALYSTE: 'Psychanalyste',
};

interface FindPractitionerProps {
  onViewProfile?: (practitionerId: string) => void;
}

export function FindPractitioner({ onViewProfile }: FindPractitionerProps) {
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [practitioners, setPractitioners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getPractitioners().then((list) => {
      setPractitioners(Array.isArray(list) ? list : []);
    }).catch(() => setPractitioners([])).finally(() => setLoading(false));
  }, []);

  const filtered = selectedSpecialty === 'all'
    ? practitioners
    : practitioners.filter((p) => p.specialty === selectedSpecialty);

  const specialties = [
    { value: 'all', label: 'Toutes les spécialités' },
    ...Array.from(new Set(practitioners.map((p) => p.specialty).filter(Boolean))).map((s) => ({
      value: s,
      label: SPECIALTY_LABELS[s] ?? s,
    })),
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-foreground mb-2">Trouver votre praticien</h1>
        <p className="text-muted-foreground">
          Parcourez nos professionnels certifiés et trouvez celui qui vous correspond.
        </p>
      </div>

      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Rechercher un nom..." className="pl-10 bg-input-background" />
            </div>
          </div>
          <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
            <SelectTrigger className="bg-input-background">
              <SelectValue placeholder="Spécialité" />
            </SelectTrigger>
            <SelectContent>
              {specialties.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Ville..." className="pl-10 bg-input-background" />
          </div>
        </div>
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{filtered.length} praticiens disponibles</p>
        <Button variant="outline" size="sm">
          <Filter className="w-4 h-4 mr-2" /> Plus de filtres
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Chargement…</div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">Aucun praticien disponible.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filtered.map((p) => {
            const name = `${p.title || ''} ${p.firstName} ${p.lastName}`.trim();
            const avatar = `${p.firstName?.[0] || ''}${p.lastName?.[0] || ''}`.toUpperCase();
            const specialtyLabel = SPECIALTY_LABELS[p.specialty] ?? p.specialty ?? '';
            const types: string[] = [];
            if (p.offersVideo) types.push('Visio');
            if (p.offersPhone) types.push('Téléphone');
            types.push('Présentiel');
            return (
              <Card key={p.id} className="p-6 hover:shadow-lg transition-shadow duration-200">
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white text-xl font-semibold flex-shrink-0">
                    {avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div className="cursor-pointer" onClick={() => onViewProfile?.(p.id)}>
                        <h3 className="text-lg font-semibold text-foreground hover:text-primary transition-colors">{name}</h3>
                        <p className="text-sm text-primary font-medium">{specialtyLabel}</p>
                      </div>
                      <Button variant="ghost" size="icon">
                        <Heart className="w-5 h-5" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      {p.experience != null && (
                        <span className="text-sm text-muted-foreground">{p.experience} ans d&apos;expérience</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{p.bio ?? ''}</p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{p.timezone ?? '—'}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {types.map((type) => (
                          <span key={type} className="px-2 py-1 bg-muted text-xs rounded-md">{type}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="text-muted-foreground">Disponible sur rendez-vous</span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => onViewProfile?.(p.id)}>
                          Voir le profil
                        </Button>
                        <Button size="sm" className="bg-primary hover:bg-primary/90">
                          Prendre RDV
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="flex justify-center">
          <Button variant="outline">Charger plus de praticiens</Button>
        </div>
      )}
    </div>
  );
}
