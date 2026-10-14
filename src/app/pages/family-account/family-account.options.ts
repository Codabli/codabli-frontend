// Aucune de ces listes n'existe encore côté backend : à remplacer par un appel API
// quand les référentiels seront disponibles.

// Libellés traduits via familyAccount.form.platformGoal.options.<valeur>.
export const FAMILY_PLATFORM_GOALS = [
  'creativeActivities',
  'readingPleasure',
  'danceDiscovery',
  'familyTime',
  'other',
] as const;

export type FamilyPlatformGoal = (typeof FAMILY_PLATFORM_GOALS)[number];

// Libellés traduits via familyAccount.form.notifications.options.<valeur>.
export const NOTIFICATION_PREFERENCES = ['newsletter', 'newContent', 'childActivity'] as const;

export type NotificationPreference = (typeof NOTIFICATION_PREFERENCES)[number];
