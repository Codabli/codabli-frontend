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

/** Élément de l'univers décrit avec l'assistant (`AssistantCreationUniversRequest.Type` du back). */
export type TypeElementUnivers = 'Lieu' | 'Personnage' | 'Epoque' | 'Objet';
