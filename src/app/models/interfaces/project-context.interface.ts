import { AgeRange } from '../types/age-range.type';
import { PerformanceSpace } from '../types/performance-space.type';

/**
 * Contexte du projet saisi à l'écran 1 du parcours « Créer mon conte dansé » (SCRUM-84).
 */
export interface ProjectContext {
  ageRange: AgeRange;
  country: string;
  region: string;
  city: string;
  theme: string;
  secretIngredients: string[];
  performanceSpace: PerformanceSpace | null;
}
