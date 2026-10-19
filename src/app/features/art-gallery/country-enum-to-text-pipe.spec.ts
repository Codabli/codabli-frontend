import { CountryEnumToTextPipe } from './country-enum-to-text-pipe';
import {ArtGalleryCountryEnum} from './art-gallery-country-enum';

describe('CountryEnumToTextPipe', () => {
  const pipe: CountryEnumToTextPipe;
  beforeEach(() => {
    pipe = new CountryEnumToTextPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('transforms every values', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(ArtGalleryCountryEnum.UNDEFINED)).toBe('');
    expect(pipe.transform(ArtGalleryCountryEnum.LEBANON)).toBe('LEBANON');
    expect(pipe.transform(ArtGalleryCountryEnum.AUSTRALIA)).toBe('AUSTRALIA');
    expect(pipe.transform(ArtGalleryCountryEnum.ITALY)).toBe('ITALY');
    expect(pipe.transform(ArtGalleryCountryEnum.FRANCE)).toBe('FRANCE');
    expect(pipe.transform(ArtGalleryCountryEnum.TOGO)).toBe('TOGO');
    expect(pipe.transform(ArtGalleryCountryEnum.BRAZIL)).toBe('BRAZIL');
    expect(pipe.transform(ArtGalleryCountryEnum.VIETNAM)).toBe('VIETNAM');
  });

  afterEach(() => {
    pipe = null;
  });
});
