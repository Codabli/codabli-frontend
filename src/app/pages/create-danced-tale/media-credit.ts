/** Origine d'un média des catalogues provisoires (écrans 2 et 3), affichée dans la fenêtre de détails. */
export interface MediaCredit {
  author: string;
  date: string;
  licence: string;
  /** Page de la source (Wikimedia Commons...). Absente pour un contenu créé par Codabli. */
  sourceUrl?: string;
}
