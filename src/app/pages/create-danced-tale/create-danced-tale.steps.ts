export interface CreateDancedTaleStep {
  path: string;
  labelKey: string;
  /** Écran à plusieurs panneaux : toute la largeur de la grille, marge réduite sur très grand écran. */
  wide?: boolean;
  /**
   * Ce que le brouillon doit contenir pour ouvrir l'écran (mêmes règles que les gardes de route) :
   * le contexte du projet (écran 1) ou une trame avec au moins une étape (écran 6).
   */
  requires?: 'context' | 'structure';
}

/**
 * Les 8 écrans du parcours « Créer mon conte dansé » (epic SCRUM-29).
 */
export const CREATE_DANCED_TALE_STEPS: CreateDancedTaleStep[] = [
  { path: 'context', labelKey: 'createDancedTale.steps.context' },
  { path: 'discovery', labelKey: 'createDancedTale.steps.discovery', wide: true, requires: 'context' },
  { path: 'resources', labelKey: 'createDancedTale.steps.resources', wide: true, requires: 'context' },
  { path: 'class-resources', labelKey: 'createDancedTale.steps.classResources', wide: true, requires: 'context' },
  { path: 'universe', labelKey: 'createDancedTale.steps.universe', requires: 'context' },
  { path: 'structure', labelKey: 'createDancedTale.steps.structure', requires: 'context' },
  { path: 'writing', labelKey: 'createDancedTale.steps.writing', wide: true, requires: 'structure' },
  { path: 'staging', labelKey: 'createDancedTale.steps.staging', wide: true, requires: 'structure' },
];
