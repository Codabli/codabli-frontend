import type { PerformanceSpace } from '../types/performance-space.type';

/** Étapes du parcours enregistrées en JSON par le backend (chemin de `PUT .../parcours/{etape}`). */
export type EtapeParcours =
  | 'decouverte'
  | 'ressources'
  | 'ressources-classe'
  | 'univers'
  | 'trame'
  | 'ecriture'
  | 'mise-en-scene';

/** Miroir de `ParcoursContexteRequest` côté backend. */
export interface ParcoursContexteRequest {
  region: string;
  ville: string | null;
  espaceRepresentation: PerformanceSpace | null;
  ingredientsSecrets: string[];
}

/**
 * Miroir de `ParcoursConteResponse` côté backend : parcours « Créer mon conte dansé » d'un conte.
 * Le contenu de chaque étape est le JSON envoyé tel quel par le front.
 */
export interface ParcoursConte {
  conteDanseId: string;
  region: string | null;
  ville: string | null;
  espaceRepresentation: PerformanceSpace | null;
  ingredientsSecrets: string[];
  decouverte: unknown;
  ressources: unknown;
  ressourcesClasse: unknown;
  univers: unknown;
  trame: unknown;
  ecriture: unknown;
  miseEnScene: unknown;
  dateModification: string | null;
}
