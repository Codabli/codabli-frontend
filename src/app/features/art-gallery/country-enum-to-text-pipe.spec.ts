import { CountryEnumToTextPipe } from './country-enum-to-text-pipe';
import { ArtGalleryCountryEnum } from './art-gallery-country-enum';

describe('CountryEnumToTextPipe', () => {
  let pipe: CountryEnumToTextPipe;

  beforeEach(() => {
    pipe = new CountryEnumToTextPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('transforms country values to translation keys', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(ArtGalleryCountryEnum.UNDEFINED)).toBe('');
    expect(pipe.transform(ArtGalleryCountryEnum.WORLD)).toBe('artGallery.country.WORLD');
    expect(pipe.transform(ArtGalleryCountryEnum.LEBANON)).toBe('artGallery.country.LEBANON');
    expect(pipe.transform(ArtGalleryCountryEnum.AUSTRALIA)).toBe('artGallery.country.AUSTRALIA');
    expect(pipe.transform(ArtGalleryCountryEnum.ITALY)).toBe('artGallery.country.ITALY');
    expect(pipe.transform(ArtGalleryCountryEnum.FRANCE)).toBe('artGallery.country.FRANCE');
    expect(pipe.transform(ArtGalleryCountryEnum.TOGO)).toBe('artGallery.country.TOGO');
    expect(pipe.transform(ArtGalleryCountryEnum.BRAZIL)).toBe('artGallery.country.BRAZIL');
    expect(pipe.transform(ArtGalleryCountryEnum.VIETNAM)).toBe('artGallery.country.VIETNAM');
  });
});
