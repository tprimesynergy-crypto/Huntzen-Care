import { Card } from '@/app/components/ui/card';
import { Shield, Lock, Eye, Download, Trash2, AlertCircle } from 'lucide-react';

export function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Politique de Confidentialité
        </h1>
        <p className="text-muted-foreground">
          Dernière mise à jour : 21 janvier 2025
        </p>
      </div>

      <Card className="p-6 bg-primary/5 border-primary/20">
        <div className="flex items-start gap-3">
          <Shield className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold mb-2">Notre engagement</h3>
            <p className="text-sm text-muted-foreground">
              HuntZen Care s'engage à protéger vos données personnelles et votre vie privée. 
              Cette politique explique comment nous collectons, utilisons et protégeons vos informations 
              conformément au RGPD et aux lois françaises sur la protection des données.
            </p>
          </div>
        </div>
      </Card>

      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Données collectées</h2>
          <div className="space-y-3">
            <p className="text-muted-foreground">
              Nous collectons les types de données suivants :
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li><strong>Données d'identification :</strong> nom, prénom, email, téléphone</li>
              <li><strong>Données professionnelles :</strong> entreprise, poste, département</li>
              <li><strong>Données de santé :</strong> notes de consultations (chiffrées), journal personnel (chiffré)</li>
              <li><strong>Données de connexion :</strong> logs, adresse IP, cookies techniques</li>
              <li><strong>Données d'utilisation :</strong> statistiques anonymisées d'usage de la plateforme</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. Utilisation des données</h2>
          <p className="text-muted-foreground mb-3">
            Vos données sont utilisées uniquement pour :
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>Fournir les services de la plateforme (prise de RDV, consultations, chat)</li>
            <li>Assurer le suivi médical par les praticiens</li>
            <li>Communiquer avec vous (rappels de RDV, notifications importantes)</li>
            <li>Améliorer la plateforme (statistiques anonymisées)</li>
            <li>Respecter nos obligations légales</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">3. Secret médical</h2>
          <Card className="p-6">
            <div className="flex items-start gap-3 mb-4">
              <Lock className="w-6 h-6 text-[#5CB85C] flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-2 text-[#5CB85C]">Protection absolue</h3>
                <p className="text-sm text-muted-foreground">
                  Les données de santé (notes de consultations, journal personnel) sont :
                </p>
              </div>
            </div>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
              <li><strong>Chiffrées de bout en bout</strong> (AES-256-GCM)</li>
              <li><strong>Jamais accessibles</strong> à votre employeur</li>
              <li><strong>Jamais accessibles</strong> aux administrateurs HuntZen Care</li>
              <li><strong>Accessibles uniquement</strong> par vous et votre praticien</li>
              <li><strong>Supprimables à tout moment</strong> sur simple demande</li>
            </ul>
          </Card>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Partage des données</h2>
          <Card className="p-6 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-2 text-red-600 dark:text-red-400">Garantie "Zéro partage"</h3>
                <p className="text-sm text-muted-foreground">
                  <strong>Vos données de santé ne sont JAMAIS partagées</strong> avec :
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-muted-foreground ml-4">
                  <li>Votre employeur</li>
                  <li>Les ressources humaines de votre entreprise</li>
                  <li>Des tiers commerciaux</li>
                  <li>Des annonceurs</li>
                  <li>Des autorités (sauf obligation légale et décision de justice)</li>
                </ul>
              </div>
            </div>
          </Card>
          <p className="text-muted-foreground mt-4">
            <strong>Seules les statistiques anonymisées</strong> (sans aucune identification possible) 
            sont partagées avec votre employeur pour évaluer l'efficacité du programme (seuil minimum de 10 employés).
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Vos droits (RGPD)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Eye className="w-5 h-5 text-primary" />
                <h4 className="font-semibold">Droit d'accès</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Obtenez une copie de toutes vos données personnelles
              </p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Download className="w-5 h-5 text-primary" />
                <h4 className="font-semibold">Droit à la portabilité</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Exportez vos données dans un format lisible
              </p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Trash2 className="w-5 h-5 text-destructive" />
                <h4 className="font-semibold">Droit à l'oubli</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Supprimez définitivement toutes vos données
              </p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-5 h-5 text-primary" />
                <h4 className="font-semibold">Droit d'opposition</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Refusez le traitement de vos données (sauf obligation légale)
              </p>
            </Card>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">6. Sécurité</h2>
          <p className="text-muted-foreground mb-3">
            Nous mettons en œuvre les mesures de sécurité suivantes :
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li><strong>Chiffrement AES-256-GCM</strong> pour toutes les données sensibles</li>
            <li><strong>HTTPS strict</strong> sur toutes les communications</li>
            <li><strong>Authentification forte</strong> (2FA disponible)</li>
            <li><strong>Hébergement sécurisé</strong> en France (conformité HDS en cours)</li>
            <li><strong>Audits de sécurité</strong> réguliers par des tiers</li>
            <li><strong>Surveillance 24/7</strong> des accès et tentatives d'intrusion</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">7. Cookies</h2>
          <p className="text-muted-foreground mb-3">
            Nous utilisons uniquement des cookies essentiels au fonctionnement :
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li><strong>Session</strong> : pour maintenir votre connexion</li>
            <li><strong>Préférences</strong> : pour mémoriser vos choix (langue, thème)</li>
            <li><strong>Sécurité</strong> : pour protéger contre les attaques CSRF</li>
          </ul>
          <p className="text-muted-foreground mt-3">
            <strong>Aucun cookie publicitaire ou de tracking</strong> n'est utilisé sans votre consentement explicite.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">8. Conservation des données</h2>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li><strong>Données de compte</strong> : conservées tant que le compte est actif</li>
            <li><strong>Données de santé</strong> : conservées selon les obligations légales (20 ans pour les dossiers médicaux)</li>
            <li><strong>Logs de sécurité</strong> : conservés 1 an maximum</li>
            <li><strong>Suppression automatique</strong> : 3 ans après la dernière connexion (sauf obligation légale)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">9. Exercer vos droits</h2>
          <Card className="p-6">
            <p className="text-muted-foreground mb-4">
              Pour exercer vos droits RGPD ou poser une question sur vos données :
            </p>
            <ul className="space-y-2 text-sm">
              <li><strong>Email :</strong> dpo@huntzen.care</li>
              <li><strong>Courrier :</strong> HuntZen Care - DPO, 123 Avenue de la Grande Armée, 75017 Paris</li>
              <li><strong>Depuis l'app :</strong> Paramètres → Confidentialité → Gérer mes données</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-4">
              Nous nous engageons à répondre sous 30 jours maximum.
            </p>
          </Card>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">10. Modifications</h2>
          <p className="text-muted-foreground">
            Cette politique peut être mise à jour. Nous vous informerons de tout changement significatif 
            par email et/ou notification dans l'application. La version en vigueur est toujours disponible 
            sur cette page avec la date de dernière modification.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">11. Contact & réclamation</h2>
          <p className="text-muted-foreground mb-3">
            Si vous estimez que vos droits ne sont pas respectés, vous pouvez :
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>Nous contacter directement : dpo@huntzen.care</li>
            <li>Déposer une plainte auprès de la CNIL : <a href="https://www.cnil.fr" className="text-primary underline">www.cnil.fr</a></li>
          </ul>
        </section>
      </div>
    </div>
  );
}
