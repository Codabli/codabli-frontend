/**
 * Texte du conte rédigé à l'écran 7 du parcours « Créer mon conte dansé » (SCRUM-94).
 * Chaque étape de la trame (écran 6) a son texte, en HTML produit par l'éditeur enrichi.
 */
export interface TaleWriting {
  title: string;
  /** Texte HTML par identifiant d'étape de la trame. */
  texts: Record<string, string>;
}
