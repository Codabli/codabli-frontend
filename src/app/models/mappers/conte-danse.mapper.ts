import type { ConteDanse } from '@models/interfaces/conte-danse.interface';
import type { Tale } from '@models/interfaces/tale.interface';
import type { LanguageCode } from '@models/types/language-code.type';

export function mapConteDanseToTale(conte: ConteDanse): Tale {
  return {
    id: conte.id,
    title: conte.titre,
    description: conte.description,
    coverUrl: conte.couvertureUrl ?? 'assets/images/tales-test.png',
    likes: 0,
    isFavorite: false,
    languages: [conte.langueOriginale as LanguageCode],
    originalLanguage: conte.langueOriginale as LanguageCode,
    themes: [conte.thematique],
  };
}