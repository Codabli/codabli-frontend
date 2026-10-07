import type { AgeRange } from '../types/age-range.type';
import type { PerformanceSpace } from '../types/performance-space.type';

/** Reflète `ProjetConteResponse.java` (backend, `/api/projets-contes`). */
export interface ProjetConte {
  id: string;
  enseignantId: string;
  trancheAge: AgeRange;
  pays: string;
  region: string;
  ville: string | null;
  theme: string;
  ingredientsSecrets: string[];
  espaceRepresentation: PerformanceSpace | null;
  dateCreation: string;
  dateModification: string;
}

/** Reflète `ProjetConteRequest.java`. */
export interface ProjetConteRequest {
  trancheAge: AgeRange;
  pays: string;
  region: string;
  ville: string | null;
  theme: string;
  ingredientsSecrets: string[];
  espaceRepresentation: PerformanceSpace | null;
}
