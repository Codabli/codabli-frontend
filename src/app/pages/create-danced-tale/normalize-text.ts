/** Texte comparable sans tenir compte de la casse ni des accents (recherches, correspondances). */
export function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}
