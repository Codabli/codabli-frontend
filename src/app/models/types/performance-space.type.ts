/** Valeurs de l'enum backend `EspaceRepresentation`. */
export const PERFORMANCE_SPACES = ['salle_spectacle', 'gymnase', 'classe', 'exterieur'] as const;

export type PerformanceSpace = (typeof PERFORMANCE_SPACES)[number];
