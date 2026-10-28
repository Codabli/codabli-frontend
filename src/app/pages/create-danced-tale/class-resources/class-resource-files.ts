import { ClassResourceKind } from '@models/interfaces/tale-class-resources.interface';

const MB = 1024 * 1024;

interface AcceptedFormat {
  kind: Exclude<ClassResourceKind, 'link'>;
  mimeTypes: string[];
  extensions: string[];
  /** Taille maximale en octets. */
  maxSize: number;
}

/** Formats acceptés à l'écran 4 (SCRUM-89) et taille maximale de chacun. */
export const ACCEPTED_FORMATS: AcceptedFormat[] = [
  { kind: 'pdf', mimeTypes: ['application/pdf'], extensions: ['pdf'], maxSize: 20 * MB },
  { kind: 'image', mimeTypes: ['image/png', 'image/jpeg'], extensions: ['png', 'jpg', 'jpeg'], maxSize: 10 * MB },
  { kind: 'audio', mimeTypes: ['audio/mpeg', 'audio/mp3'], extensions: ['mp3'], maxSize: 20 * MB },
  { kind: 'video', mimeTypes: ['video/mp4'], extensions: ['mp4'], maxSize: 100 * MB },
];

/** Valeur de l'attribut `accept` du champ fichier. */
export const ACCEPT_ATTRIBUTE = ACCEPTED_FORMATS.flatMap((format) => [
  ...format.mimeTypes,
  ...format.extensions.map((extension) => `.${extension}`),
]).join(',');

export type FileRejection = 'format' | 'tooLarge';

export type FileCheck = { kind: AcceptedFormat['kind'] } | { rejection: FileRejection };

/**
 * Vérifie le format et la taille d'un fichier. Le type MIME n'est pas toujours renseigné
 * (certains navigateurs le laissent vide pour un MP3) : l'extension sert alors de repli.
 */
export function checkFile(file: File): FileCheck {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
  const format = ACCEPTED_FORMATS.find(
    (accepted) =>
      accepted.mimeTypes.includes(file.type) || (!file.type && accepted.extensions.includes(extension)),
  );

  if (!format) {
    return { rejection: 'format' };
  }

  return file.size > format.maxSize ? { rejection: 'tooLarge' } : { kind: format.kind };
}

/** Adresse web valide (http ou https), ou null. */
export function parseLink(value: string): URL | null {
  try {
    const url = new URL(value.trim());
    return url.protocol === 'http:' || url.protocol === 'https:' ? url : null;
  } catch {
    return null;
  }
}

export function isYouTube(url: string): boolean {
  return /(^|\.)(youtube\.com|youtu\.be)$/.test(parseLink(url)?.hostname ?? '');
}

/** Nom par défaut d'un fichier : son nom sans l'extension. */
export function nameFromFile(fileName: string): string {
  return fileName.replace(/\.[^.]+$/, '');
}
