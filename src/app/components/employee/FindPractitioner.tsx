import { useState } from 'react';
import { Card } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Search, MapPin, Star, Calendar, Heart, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';

interface FindPractitionerProps {
  onViewProfile?: (practitionerId: number) => void;
}

export function FindPractitioner({ onViewProfile }: FindPractitionerProps) {
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');

  const practitioners = [
    {
      id: 1,
      name: 'Dr. Sophie Martin',
      specialty: 'Psychologue clinicienne',
      city: 'Paris',
      rating: 4.8,
      reviewCount: 127,
      experience: '12 ans',
      languages: ['Français', 'Anglais'],
      consultationTypes: ['Visio', 'Téléphone'],
      avatar: 'SM',
      bio: 'Spécialisée en gestion du stress et anxiété au travail.',
      nextAvailable: 'Jeudi 23 Jan',
    },
    {
      id: 2,
      name: 'Dr. Thomas Lefebvre',
      specialty: 'Thérapeute cognitif',
      city: 'Lyon',
      rating: 4.9,
      reviewCount: 98,
      experience: '8 ans',
      languages: ['Français'],
      consultationTypes: ['Visio', 'Téléphone', 'Présentiel'],
      avatar: 'TL',
      bio: 'Expert en thérapie cognitive et comportementale.',
      nextAvailable: 'Lundi 27 Jan',
    },
    {
      id: 3,
      name: 'Dr. Marie Dubois',
      specialty: 'Psychiatre',
      city: 'Marseille',
      rating: 4.7,
      reviewCount: 156,
      experience: '15 ans',
      languages: ['Français', 'Espagnol'],
      consultationTypes: ['Visio', 'Présentiel'],
      avatar: 'MD',
      bio: 'Spécialisée en troubles de l\'humeur et dépression.',
      nextAvailable: 'Vendredi 24 Jan',
    },
    {
      id: 4,
      name: 'Dr. Pierre Moreau',
      specialty: 'Psychothérapeute',
      city: 'Toulouse',
      rating: 4.6,
      reviewCount: 84,
      experience: '10 ans',
      languages: ['Français', 'Anglais'],
      consultationTypes: ['Visio', 'Téléphone'],
      avatar: 'PM',
      bio: 'Accompagnement en développement personnel et burn-out.',
      nextAvailable: 'Mardi 28 Jan',
    },
  ];

  const specialties = [
    { value: 'all', label: 'Toutes les spécialités' },
    { value: 'psychologue', label: 'Psychologue' },
    { value: 'psychiatre', label: 'Psychiatre' },
    { value: 'therapeute', label: 'Thérapeute' },
    { value: 'coach', label: 'Coach bien-être' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-foreground mb-2">
          Trouver votre praticien
        </h1>
        <p className="text-muted-foreground">
          Parcourez nos professionnels certifiés et trouvez celui qui vous correspond.
        </p>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Rechercher un nom..."
                className="pl-10 bg-input-background"
              />
            </div>
          </div>

          {/* Specialty Filter */}
          <div>
            <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
              <SelectTrigger className="bg-input-background">
                <SelectValue placeholder="Spécialité" />
              </SelectTrigger>
              <SelectContent>
                {specialties.map((specialty) => (
                  <SelectItem key={specialty.value} value={specialty.value}>
                    {specialty.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* City Filter */}
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Ville..."
              className="pl-10 bg-input-background"
            />
          </div>
        </div>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {practitioners.length} praticiens disponibles
        </p>
        <Button variant="outline" size="sm">
          <Filter className="w-4 h-4 mr-2" />
          Plus de filtres
        </Button>
      </div>

      {/* Practitioners Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {practitioners.map((practitioner) => (
          <Card key={practitioner.id} className="p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex gap-4">
              {/* Avatar */}
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white text-xl font-semibold flex-shrink-0">
                {practitioner.avatar}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div className="cursor-pointer" onClick={() => onViewProfile?.(practitioner.id)}>
                    <h3 className="text-lg font-semibold text-foreground hover:text-primary transition-colors">
                      {practitioner.name}
                    </h3>
                    <p className="text-sm text-primary font-medium">
                      {practitioner.specialty}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Heart className="w-5 h-5" />
                  </Button>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-[#F39C12] text-[#F39C12]" />
                    <span className="text-sm font-medium">{practitioner.rating}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ({practitioner.reviewCount} avis)
                  </span>
                  <span className="text-sm text-muted-foreground">•</span>
                  <span className="text-sm text-muted-foreground">
                    {practitioner.experience} d'expérience
                  </span>
                </div>

                {/* Bio */}
                <p className="text-sm text-muted-foreground mb-3">
                  {practitioner.bio}
                </p>

                {/* Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{practitioner.city}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {practitioner.consultationTypes.map((type) => (
                      <span
                        key={type}
                        className="px-2 py-1 bg-muted text-xs rounded-md"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Next Available */}
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">
                      Disponible: <span className="font-medium text-foreground">{practitioner.nextAvailable}</span>
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onViewProfile?.(practitioner.id)}
                    >
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
        ))}
      </div>

      {/* Load More */}
      <div className="flex justify-center">
        <Button variant="outline">
          Charger plus de praticiens
        </Button>
      </div>
    </div>
  );
}