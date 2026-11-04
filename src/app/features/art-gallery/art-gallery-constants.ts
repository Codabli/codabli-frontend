import { ArtGalleryCountryEnum } from './art-gallery-country-enum';

export const ART_GALLERY_COUNTRIES = Object.values(ArtGalleryCountryEnum).filter(
    (value): value is ArtGalleryCountryEnum =>
        typeof value === 'number' &&
        value !== ArtGalleryCountryEnum.UNDEFINED &&
        value !== ArtGalleryCountryEnum.WORLD,
);

export const ART_GALLERY_VISITABLE_COUNTRIES: readonly ArtGalleryCountryEnum[] = [
    ArtGalleryCountryEnum.LEBANON,
    ArtGalleryCountryEnum.VIETNAM,
];
