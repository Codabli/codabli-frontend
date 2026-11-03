export enum ArtGalleryCountryEnum {
    UNDEFINED = 0,
    LEBANON,
    AUSTRALIA,
    ITALY,
    FRANCE,
    TOGO,
    BRAZIL,
    VIETNAM,
}

export const ART_GALLERY_COUNTRIES = Object.values(ArtGalleryCountryEnum)
    .filter(
        (value): value is ArtGalleryCountryEnum =>
            typeof value === 'number' && value !== ArtGalleryCountryEnum.UNDEFINED,
    );

export const ART_GALLERY_VISITABLE_COUNTRIES: readonly ArtGalleryCountryEnum[] = [
    ArtGalleryCountryEnum.LEBANON,
    ArtGalleryCountryEnum.VIETNAM,
];