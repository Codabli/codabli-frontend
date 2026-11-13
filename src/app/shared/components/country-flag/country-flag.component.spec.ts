import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CountryFlag } from './country-flag.component';

describe('CountryFlag', () => {
  let fixture: ComponentFixture<CountryFlag>;

  const image = (): HTMLImageElement | null =>
    (fixture.nativeElement as HTMLElement).querySelector('img');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CountryFlag],
    }).compileComponents();

    fixture = TestBed.createComponent(CountryFlag);
  });

  it('shows the 4:3 flag of a country code, whatever its case', async () => {
    fixture.componentRef.setInput('code', 'VN');
    await fixture.whenStable();

    expect(image()?.getAttribute('src')).toBe('/assets/flags/4x3/vn.svg');
  });

  it('can show the square flag', async () => {
    fixture.componentRef.setInput('code', 'fr');
    fixture.componentRef.setInput('shape', '1x1');
    await fixture.whenStable();

    expect(image()?.getAttribute('src')).toBe('/assets/flags/1x1/fr.svg');
  });

  it('is decorative without a label and described with one', async () => {
    fixture.componentRef.setInput('code', 'lb');
    await fixture.whenStable();
    expect(image()?.getAttribute('alt')).toBe('');
    expect(image()?.getAttribute('aria-hidden')).toBe('true');

    fixture.componentRef.setInput('label', 'Liban');
    await fixture.whenStable();
    expect(image()?.getAttribute('alt')).toBe('Liban');
    expect(image()?.hasAttribute('aria-hidden')).toBe(false);
  });

  it('renders nothing for an invalid code', async () => {
    fixture.componentRef.setInput('code', '../secret');
    await fixture.whenStable();

    expect(image()).toBeNull();
  });
});
