import { ACCEPT_ATTRIBUTE, checkFile, isYouTube, nameFromFile, parseLink } from './class-resource-files';

const MB = 1024 * 1024;

function file(name: string, type: string, size = 1000): File {
  const result = new File(['x'], name, { type });
  Object.defineProperty(result, 'size', { value: size });
  return result;
}

describe('règles de dépôt des ressources de la classe', () => {
  it('accepte PDF, PNG, JPEG, MP3 et MP4', () => {
    expect(checkFile(file('fiche.pdf', 'application/pdf'))).toEqual({ kind: 'pdf' });
    expect(checkFile(file('dessin.png', 'image/png'))).toEqual({ kind: 'image' });
    expect(checkFile(file('photo.jpg', 'image/jpeg'))).toEqual({ kind: 'image' });
    expect(checkFile(file('chanson.mp3', 'audio/mpeg'))).toEqual({ kind: 'audio' });
    expect(checkFile(file('spectacle.mp4', 'video/mp4'))).toEqual({ kind: 'video' });
  });

  it('refuse les autres formats', () => {
    expect(checkFile(file('texte.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'))).toEqual(
      { rejection: 'format' },
    );
    expect(checkFile(file('image.gif', 'image/gif'))).toEqual({ rejection: 'format' });
    // Extension trompeuse : le type MIME fait foi quand il est connu.
    expect(checkFile(file('faux.pdf', 'text/html'))).toEqual({ rejection: 'format' });
  });

  it('se rabat sur l\'extension quand le navigateur ne donne pas le type', () => {
    expect(checkFile(file('chanson.MP3', ''))).toEqual({ kind: 'audio' });
    expect(checkFile(file('sans-extension', ''))).toEqual({ rejection: 'format' });
  });

  it('vérifie la taille maximale de chaque format', () => {
    expect(checkFile(file('photo.jpg', 'image/jpeg', 10 * MB))).toEqual({ kind: 'image' });
    expect(checkFile(file('photo.jpg', 'image/jpeg', 10 * MB + 1))).toEqual({ rejection: 'tooLarge' });
    expect(checkFile(file('fiche.pdf', 'application/pdf', 21 * MB))).toEqual({ rejection: 'tooLarge' });
    expect(checkFile(file('spectacle.mp4', 'video/mp4', 99 * MB))).toEqual({ kind: 'video' });
    expect(checkFile(file('spectacle.mp4', 'video/mp4', 101 * MB))).toEqual({ rejection: 'tooLarge' });
  });

  it('limite le sélecteur de fichiers aux formats acceptés', () => {
    expect(ACCEPT_ATTRIBUTE).toContain('application/pdf');
    expect(ACCEPT_ATTRIBUTE).toContain('.mp4');
  });

  it('n\'accepte que des liens http ou https complets', () => {
    expect(parseLink(' https://www.youtube.com/watch?v=abc ')?.hostname).toBe('www.youtube.com');
    expect(parseLink('http://exemple.fr')).not.toBeNull();
    expect(parseLink('www.exemple.fr')).toBeNull();
    expect(parseLink('javascript:alert(1)')).toBeNull();
    expect(parseLink('')).toBeNull();
  });

  it('reconnaît les vidéos YouTube', () => {
    expect(isYouTube('https://www.youtube.com/watch?v=abc')).toBe(true);
    expect(isYouTube('https://youtu.be/abc')).toBe(true);
    expect(isYouTube('https://notyoutube.com/abc')).toBe(false);
  });

  it('nomme un fichier d\'après son nom sans extension', () => {
    expect(nameFromFile('Dessin de Léa.final.png')).toBe('Dessin de Léa.final');
  });
});
