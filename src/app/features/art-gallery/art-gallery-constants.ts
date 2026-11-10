import { ArtGalleryCountryEnum } from './art-gallery-country-enum';

export class ArtGalleryConstants {
    static readonly COUNTRIES: readonly ArtGalleryCountryEnum[] = Object.values(
        ArtGalleryCountryEnum,
    ).filter(
        (value): value is ArtGalleryCountryEnum =>
            typeof value === 'number' &&
            value !== ArtGalleryCountryEnum.UNDEFINED &&
            value !== ArtGalleryCountryEnum.WORLD,
    );

    static readonly VISITABLE_COUNTRIES: readonly ArtGalleryCountryEnum[] = [
        ArtGalleryCountryEnum.VIETNAM,
    ];
}
