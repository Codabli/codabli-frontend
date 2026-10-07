/** Valeurs alignées sur l'enum backend `EspaceRepresentation` (SCRUM-96). */
export const PERFORMANCE_SPACES = ['salle_spectacle', 'gymnase', 'classe', 'exterieur'] as const;

export type PerformanceSpace = (typeof PERFORMANCE_SPACES)[number];
