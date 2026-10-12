export interface CreateDancedTaleStep {
  path: string;
  labelKey: string;
  /** Écran à plusieurs panneaux : toute la largeur de la grille, marge réduite sur très grand écran. */
  wide?: boolean;
}

/**
 * Les 8 écrans du parcours « Créer mon conte dansé » (epic SCRUM-29).
 */
export const CREATE_DANCED_TALE_STEPS: CreateDancedTaleStep[] = [
  { path: 'context', labelKey: 'createDancedTale.steps.context' },
  { path: 'discovery', labelKey: 'createDancedTale.steps.discovery', wide: true },
  { path: 'resources', labelKey: 'createDancedTale.steps.resources', wide: true },
  { path: 'class-resources', labelKey: 'createDancedTale.steps.classResources', wide: true },
  { path: 'universe', labelKey: 'createDancedTale.steps.universe' },
  { path: 'structure', labelKey: 'createDancedTale.steps.structure' },
  { path: 'writing', labelKey: 'createDancedTale.steps.writing', wide: true },
  { path: 'staging', labelKey: 'createDancedTale.steps.staging', wide: true },
];
