import type { LanguageCode } from '../types/language-code.type';

export interface Tale {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  likes: number;
  isFavorite: boolean;
  languages: LanguageCode[];
  originalLanguage: LanguageCode;
  themes: string[];
  ageMin?: number | null;
  ageMax?: number | null;
}
