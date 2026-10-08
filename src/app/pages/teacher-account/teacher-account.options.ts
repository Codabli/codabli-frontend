// Aucune de ces listes n'existe encore côté backend : à remplacer par un appel API
// quand les référentiels seront disponibles.

// Noms propres : non traduits.
export const ACADEMIES = [
  'Aix-Marseille',
  'Amiens',
  'Besançon',
  'Bordeaux',
  'Clermont-Ferrand',
  'Corse',
  'Créteil',
  'Dijon',
  'Grenoble',
  'Guadeloupe',
  'Guyane',
  'La Réunion',
  'Lille',
  'Limoges',
  'Lyon',
  'Martinique',
  'Mayotte',
  'Montpellier',
  'Nancy-Metz',
  'Nantes',
  'Nice',
  'Normandie',
  'Orléans-Tours',
  'Paris',
  'Poitiers',
  'Reims',
  'Rennes',
  'Strasbourg',
  'Toulouse',
  'Versailles',
] as const;

export type Academy = (typeof ACADEMIES)[number];

// Libellés traduits via teacherAccount.form.ageRange.options.<valeur>.
export const AGE_RANGES = ['3-6', '6-8', '8-11', '11-15', '15-18'] as const;

export type AgeRange = (typeof AGE_RANGES)[number];

// Libellés traduits via teacherAccount.form.platformGoal.options.<valeur>.
export const PLATFORM_GOALS = [
  'dancedTales',
  'pedagogicalResources',
  'creativeReading',
  'artGallery',
  'other',
] as const;

export type PlatformGoal = (typeof PLATFORM_GOALS)[number];

// Libellés traduits via teacherAccount.form.accessibility.options.<valeur>.
export const ACCESSIBILITY_NEEDS = [
  'highContrast',
  'reducedMotion',
  'signLanguageAudioDescription',
  'dysPmrSupport',
] as const;

export type AccessibilityNeed = (typeof ACCESSIBILITY_NEEDS)[number];
