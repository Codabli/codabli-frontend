import { CountryEnumToTextPipe } from './country-enum-to-text-pipe';

describe('CountryEnumToTextPipe', () => {
  it('create an instance', () => {
    const pipe = new CountryEnumToTextPipe();
    expect(pipe).toBeTruthy();
  });
});
