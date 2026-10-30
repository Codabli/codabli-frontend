// Correspond à OffreAbonnementResponse côté backend (GET /api/abonnements/offres).
export type SubscriptionAudience = 'famille' | 'enseignant' | 'etablissement' | 'structure';

export type SubscriptionDuration = 'mensuel' | 'annuel';

export interface SubscriptionOffer {
  id: string;
  code: string;
  nom: string;
  description: string | null;
  publicCible: SubscriptionAudience;
  tarif: number;
  duree: SubscriptionDuration;
  limiteProfils: number | null;
  limiteClasses: number | null;
  stockageMo: number | null;
  accesWebinaires: boolean;
  accesCoaching: boolean;
  accesExports: boolean;
  actif: boolean;
}
