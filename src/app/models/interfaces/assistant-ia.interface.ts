/** Auteur d'un message de la conversation avec l'assistant pédagogique (`RoleMessage` du back). */
export type RoleMessageIa = 'user' | 'assistant' | 'system';

/** Message de la conversation d'un conte avec l'assistant (`MessageIaDto` du back). */
export interface MessageIa {
  id: string;
  conteDanseId: string;
  role: RoleMessageIa;
  contenu: string;
  dateCreation: string;
}
