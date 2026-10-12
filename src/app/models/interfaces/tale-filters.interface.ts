import type { LanguageCode } from '@models/types/language-code.type';

export interface TaleFilters {
  search: string;
  themes: string[];
  languages: LanguageCode[];
}