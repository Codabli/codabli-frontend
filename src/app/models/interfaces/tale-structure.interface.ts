/**
 * Étapes proposées par défaut (RG-CMC-09) : 5 étapes, ou 3 pour les 3-5 ans.
 * Une étape ajoutée par la classe n'a pas de type (`kind: null`).
 */
export type StoryStepKind = 'initialSituation' | 'trigger' | 'adventures' | 'resolution' | 'finalSituation';

export const DEFAULT_STORY_STEPS: StoryStepKind[] = [
  'initialSituation',
  'trigger',
  'adventures',
  'resolution',
  'finalSituation',
];

// Les 3 étapes ne sont nommées dans aucune spec : choix provisoire validé avec l'équipe.
export const YOUNG_CHILDREN_STORY_STEPS: StoryStepKind[] = ['initialSituation', 'adventures', 'finalSituation'];

/**
 * Étape de la trame du récit (écran 6 du parcours « Créer mon conte dansé », SCRUM-95).
 * Une étape proposée par défaut (`kind` renseigné) est essentielle : une alerte signale
 * si son résumé est vide.
 */
export interface StoryStep {
  id: string;
  kind: StoryStepKind | null;
  title: string;
  summary: string;
  /** Identifiants des personnages de l'écran 5 présents dans cette étape. */
  characterIds: string[];
}

export interface TaleStructure {
  steps: StoryStep[];
}
