/** Tranches d'âge du parcours « Créer mon conte dansé » (écran 1). Le 15-18 ans n'est pas proposé. */
export const AGE_RANGES = ['3-5', '6-8', '9-11', '12-14'] as const;

export type AgeRange = (typeof AGE_RANGES)[number];
