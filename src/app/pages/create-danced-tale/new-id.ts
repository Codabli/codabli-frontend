/** Identifiant d'un élément du brouillon (carte de l'univers, étape de la trame...). */
export function newId(): string {
  // randomUUID n'existe que dans un contexte sécurisé (https ou localhost).
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
