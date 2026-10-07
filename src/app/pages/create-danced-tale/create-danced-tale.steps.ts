export interface CreateDancedTaleStep {
  path: string;
  labelKey: string;
}

/**
 * Les 8 écrans du parcours « Créer mon conte dansé » (epic SCRUM-29).
 * Seuls les écrans déjà développés ont une route dédiée.
 */
export const CREATE_DANCED_TALE_STEPS: CreateDancedTaleStep[] = [
  { path: 'context', labelKey: 'createDancedTale.steps.context' },
  { path: 'discovery', labelKey: 'createDancedTale.steps.discovery' },
  { path: 'resources', labelKey: 'createDancedTale.steps.resources' },
  { path: 'class-resources', labelKey: 'createDancedTale.steps.classResources' },
  { path: 'universe', labelKey: 'createDancedTale.steps.universe' },
  { path: 'structure', labelKey: 'createDancedTale.steps.structure' },
  { path: 'writing', labelKey: 'createDancedTale.steps.writing' },
  { path: 'staging', labelKey: 'createDancedTale.steps.staging' },
];
