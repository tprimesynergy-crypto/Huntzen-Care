import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { AlertCircle, Phone, MessageCircle, Globe, X } from 'lucide-react';

interface EmergencyModalProps {
  onClose: () => void;
}

export function EmergencyModal({ onClose }: EmergencyModalProps) {
  const emergencyContacts = [
    {
      name: 'Urgences Psychiatriques',
      number: '01 45 65 81 09',
      available: '24h/24 - 7j/7',
      icon: Phone,
    },
    {
      name: 'SOS Amitié',
      number: '09 72 39 40 50',
      available: '24h/24 - 7j/7',
      icon: Phone,
    },
    {
      name: 'Suicide Écoute',
      number: '01 45 39 40 00',
      available: '24h/24 - 7j/7',
      icon: Phone,
    },
    {
      name: '3114 - Prévention Suicide',
      number: '3114',
      available: 'Gratuit - 24h/24',
      icon: Phone,
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-foreground">
                Besoin d'aide immédiate ?
              </h2>
              <p className="text-sm text-muted-foreground">
                Vous n'êtes pas seul(e). Nous sommes là pour vous.
              </p>
            </div>
          </div>

          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              <strong>⚠️ Urgence vitale ?</strong> Appelez immédiatement le <strong>15 (SAMU)</strong> ou le <strong>112 (numéro d'urgence européen)</strong>.
            </p>
          </div>
        </div>

        {/* Emergency Contacts */}
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-semibold">Numéros d'urgence disponibles</h3>
          
          {emergencyContacts.map((contact) => {
            const Icon = contact.icon;
            return (
              <Card key={contact.name} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{contact.name}</h4>
                      <p className="text-2xl font-bold text-primary my-1">
                        {contact.number}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {contact.available}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="bg-primary hover:bg-primary/90"
                    onClick={() => window.open(`tel:${contact.number.replace(/\s/g, '')}`)}
                  >
                    Appeler
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Online Resources */}
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-semibold">Ressources en ligne</h3>
          
          <Card className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-5 h-5 text-secondary" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-foreground mb-1">Chat SOS Amitié</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Discutez en direct avec un bénévole formé à l'écoute
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open('https://www.sos-amitie.com/web/guest/accueil', '_blank')}
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Accéder au chat
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Reassurance Message */}
        <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <h4 className="font-semibold text-primary mb-2">💙 Vous êtes courageux(se)</h4>
          <p className="text-sm text-muted-foreground">
            Chercher de l'aide est un acte de courage. Ces moments difficiles sont temporaires, 
            et il existe des solutions. N'hésitez pas à contacter l'un de ces numéros, 
            des professionnels sont là pour vous écouter sans jugement.
          </p>
        </div>

        {/* Close Button */}
        <div className="mt-6 flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </Card>
    </div>
  );
}
