import { Injectable } from '@angular/core';

export const IMAGE_MAX_DIMENSION = 480;
export const IMAGE_QUALITY = 0.8;

/** Au-delà, le fichier est refusé avant même d'être décodé. */
export const IMAGE_MAX_FILE_SIZE = 10 * 1024 * 1024;

export type ImageResizeErrorKind = 'not-an-image' | 'too-large' | 'unreadable';

export class ImageResizeError extends Error {
  constructor(readonly kind: ImageResizeErrorKind) {
    super(kind);
  }
}

/**
 * Réduit une image et la renvoie en data URL JPEG.
 *
 * Sans back (SCRUM-96 en pause), les images des cartes sont stockées dans le brouillon
 * du localStorage, limité à quelques Mo : une photo de 480 px pèse environ 40 Ko.
 */
@Injectable({ providedIn: 'root' })
export class ImageResizeService {
  async resize(file: File, maxDimension = IMAGE_MAX_DIMENSION, quality = IMAGE_QUALITY): Promise<string> {
    if (!file.type.startsWith('image/')) {
      throw new ImageResizeError('not-an-image');
    }

    if (file.size > IMAGE_MAX_FILE_SIZE) {
      throw new ImageResizeError('too-large');
    }

    let bitmap: ImageBitmap;

    try {
      bitmap = await createImageBitmap(file);
    } catch {
      throw new ImageResizeError('unreadable');
    }

    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);

    const context = canvas.getContext('2d');

    if (!context) {
      bitmap.close();
      throw new ImageResizeError('unreadable');
    }

    // Fond blanc : le JPEG n'a pas de transparence (PNG ou GIF détourés).
    context.fillStyle = '#fff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    return canvas.toDataURL('image/jpeg', quality);
  }
}
