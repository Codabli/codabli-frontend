import type { LanguageCode } from '../types/language-code';

export interface Tale {
  id: number;
  title: string;
  description: string;
  coverUrl: string;
  likes: number;
  isFavorite: boolean;
  languages: LanguageCode[];
  themes: string[];
}
