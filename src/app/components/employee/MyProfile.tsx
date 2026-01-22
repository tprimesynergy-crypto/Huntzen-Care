import { useState } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Camera, MapPin, Phone, Mail, Briefcase, Calendar, Edit, Heart, BookOpen, MessageSquare, TrendingUp, Award } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';

export function MyProfile() {
  const [isEditingCover, setIsEditingCover] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const userProfile = {
    firstName: 'Marc',
    lastName: 'Dupont',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    coverPhoto: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200',
    bio: 'Chef de projet passionné par l\'innovation et le bien-être au travail. En quête d\'équilibre entre performance professionnelle et santé mentale.',
    job: 'Chef de Projet Digital',
    company: 'TechCorp France',
    location: 'Paris, Île-de-France',
    phone: '+33 6 12 34 56 78',
    email: 'marc.dupont@techcorp.fr',
    joinedDate: 'Septembre 2024',
    birthdate: '15 Mars 1992',
    interests: ['Méditation', 'Running', 'Lecture', 'Photographie'],
  };

  const stats = [
    { icon: Calendar, label: 'Séances réalisées', value: '8' },
    { icon: BookOpen, label: 'Entrées journal', value: '12' },
    { icon: TrendingUp, label: 'Jours consécutifs', value: '7' },
    { icon: Award, label: 'Objectifs atteints', value: '5/6' },
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'appointment',
      title: 'Séance avec Dr. Sophie Martin',
      date: '16 Janvier 2025',
      icon: Heart,
      color: 'text-primary',
    },
    {
      id: 2,
      type: 'journal',
      title: 'Nouvelle entrée dans le journal',
      date: '15 Janvier 2025',
      icon: BookOpen,
      color: 'text-[#5CB85C]',
    },
    {
      id: 3,
      type: 'message',
      title: 'Message reçu de Dr. Sophie Martin',
      date: '14 Janvier 2025',
      icon: MessageSquare,
      color: 'text-secondary',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Cover Photo & Avatar Section */}
      <Card className="overflow-hidden">
        {/* Cover Photo */}
        <div className="relative h-64 bg-gradient-to-r from-primary to-secondary">
          <img
            src={userProfile.coverPhoto}
            alt="Cover"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
          
          {/* Edit Cover Button */}
          <Button
            size="sm"
            variant="secondary"
            className="absolute top-4 right-4 bg-white/90 hover:bg-white"
            onClick={() => setIsEditingCover(true)}
          >
            <Camera className="w-4 h-4 mr-2" />
            Modifier la couverture
          </Button>
        </div>

        {/* Profile Info Section */}
        <div className="px-6 pb-6">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-end -mt-16 relative">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-white bg-white overflow-hidden shadow-lg">
                <img
                  src={userProfile.avatar}
                  alt={`${userProfile.firstName} ${userProfile.lastName}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <button className="absolute bottom-2 right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white hover:bg-primary/90 shadow-lg">
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {/* Name & Job */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground">
                {userProfile.firstName} {userProfile.lastName}
              </h1>
              <div className="flex flex-wrap gap-3 mt-2 text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Briefcase className="w-4 h-4" />
                  {userProfile.job} chez {userProfile.company}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {userProfile.location}
                </span>
              </div>
            </div>

            {/* Edit Profile Button */}
            <Button
              className="bg-primary hover:bg-primary/90"
              onClick={() => setIsEditingProfile(true)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Modifier le profil
            </Button>
          </div>

          {/* Bio */}
          <div className="mt-6">
            <p className="text-muted-foreground leading-relaxed">
              {userProfile.bio}
            </p>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">Email:</span>
              <span className="font-medium">{userProfile.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">Téléphone:</span>
              <span className="font-medium">{userProfile.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">Date de naissance:</span>
              <span className="font-medium">{userProfile.birthdate}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Heart className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">Membre depuis:</span>
              <span className="font-medium">{userProfile.joinedDate}</span>
            </div>
          </div>

          {/* Interests Tags */}
          <div className="mt-6">
            <h3 className="text-sm font-medium mb-3">Centres d'intérêt</h3>
            <div className="flex flex-wrap gap-2">
              {userProfile.interests.map((interest) => (
                <span
                  key={interest}
                  className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-5 text-center hover:shadow-lg transition-shadow">
              <Icon className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </Card>
          );
        })}
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="activity" className="w-full">
        <TabsList className="grid w-full md:w-96 grid-cols-2">
          <TabsTrigger value="activity">Activité récente</TabsTrigger>
          <TabsTrigger value="about">À propos</TabsTrigger>
        </TabsList>

        {/* Activity Tab */}
        <TabsContent value="activity" className="mt-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Activité récente</h2>
            <div className="space-y-4">
              {recentActivity.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className={`w-10 h-10 rounded-full bg-background flex items-center justify-center ${activity.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">{activity.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{activity.date}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </TabsContent>

        {/* About Tab */}
        <TabsContent value="about" className="mt-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">À propos de moi</h2>
            
            <div className="space-y-6">
              {/* Personal Info */}
              <div>
                <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase">
                  Informations personnelles
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Nom complet</span>
                    <span className="font-medium">{userProfile.firstName} {userProfile.lastName}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Date de naissance</span>
                    <span className="font-medium">{userProfile.birthdate}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Localisation</span>
                    <span className="font-medium">{userProfile.location}</span>
                  </div>
                </div>
              </div>

              {/* Professional Info */}
              <div>
                <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase">
                  Informations professionnelles
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Poste</span>
                    <span className="font-medium">{userProfile.job}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Entreprise</span>
                    <span className="font-medium">{userProfile.company}</span>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase">
                  Contact
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-medium">{userProfile.email}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Téléphone</span>
                    <span className="font-medium">{userProfile.phone}</span>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div>
                <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase">
                  Biographie
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {userProfile.bio}
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Profile Modal (simplified) */}
      {isEditingProfile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-2xl font-semibold mb-6">Modifier mon profil</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Prénom</label>
                  <Input defaultValue={userProfile.firstName} className="bg-input-background" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Nom</label>
                  <Input defaultValue={userProfile.lastName} className="bg-input-background" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Poste</label>
                <Input defaultValue={userProfile.job} className="bg-input-background" />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Entreprise</label>
                <Input defaultValue={userProfile.company} className="bg-input-background" />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Ville</label>
                <Input defaultValue={userProfile.location} className="bg-input-background" />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Téléphone</label>
                <Input defaultValue={userProfile.phone} className="bg-input-background" />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Bio</label>
                <Textarea 
                  defaultValue={userProfile.bio} 
                  className="bg-input-background min-h-24"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Centres d'intérêt</label>
                <Input 
                  defaultValue={userProfile.interests.join(', ')} 
                  className="bg-input-background"
                  placeholder="Séparez par des virgules"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button className="bg-primary hover:bg-primary/90">
                  Enregistrer
                </Button>
                <Button variant="outline" onClick={() => setIsEditingProfile(false)}>
                  Annuler
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
