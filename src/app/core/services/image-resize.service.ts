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
 * Réduit une image et la renvoie en JPEG : une photo de 480 px pèse environ 40 Ko.
 */
@Injectable({ providedIn: 'root' })
export class ImageResizeService {
  async resize(file: File, maxDimension = IMAGE_MAX_DIMENSION, quality = IMAGE_QUALITY): Promise<Blob> {
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

    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new ImageResizeError('unreadable'))),
        'image/jpeg',
        quality,
      );
    });
  }
}
