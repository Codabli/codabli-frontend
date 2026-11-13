import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ArtGalleryWorldMapComponent } from './art-gallery-world-map-component';
import { ArtGalleryService } from '../../art-gallery-service';
import { ArtGalleryCountryEnum } from '../../art-gallery-country-enum';
import { provideTranslateService } from '@ngx-translate/core';

const MAP_URL = '/assets/images/art-gallery/World_map_svgo.svg';
const MAP_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1441 548"><g id="country-VN"></g><g id="country-FR"></g></svg>';

function parseSvg(svg: string): Document {
  return new DOMParser().parseFromString(svg, 'image/svg+xml');
}

function mockBBox(
  element: Element,
  box: { x: number; y: number; width: number; height: number },
): void {
  Object.defineProperty(element, 'getBBox', { value: () => box });
}

describe('ArtGalleryWorldMapComponent', () => {
  let component: ArtGalleryWorldMapComponent;
  let fixture: ComponentFixture<ArtGalleryWorldMapComponent>;
  let service: ArtGalleryService;
  let http: HttpTestingController;

  const country = (code: string): SVGGraphicsElement => {
    const element = (fixture.nativeElement as HTMLElement).querySelector<
      SVGGraphicsElement
    >(`.worldMap__svg #country-${code}`);
    if (!element) {
      throw new Error(`The inlined map is missing country-${code}.`);
    }
    return element;
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArtGalleryWorldMapComponent],
      providers: [
        provideTranslateService(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ArtGalleryWorldMapComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(ArtGalleryService);
    http = TestBed.inject(HttpTestingController);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads the SVG asset and inlines it in the page', () => {
    http.expectOne(MAP_URL).flush(MAP_SVG);

    expect(country('VN').getAttribute('role')).toBe('button');
    expect(component.mapLoadError).toBe(false);
  });

  it('reports an error when the SVG asset fails to load', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});

    http
      .expectOne(MAP_URL)
      .flush('', { status: 404, statusText: 'Not Found' });

    expect(component.mapLoadError).toBe(true);
    error.mockRestore();
  });

  it('shows a preview before navigating to a visitable country', () => {
    component.onMapLoad(parseSvg(MAP_SVG));
    component.startExploring();

    country('FR').dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(service.getCurrentCountry()).toBe(ArtGalleryCountryEnum.WORLD);
    expect(component.previewCountry).toBeNull();

    country('VN').dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(component.previewCountry).toBe(ArtGalleryCountryEnum.VIETNAM);
    expect(service.getCurrentCountry()).toBe(ArtGalleryCountryEnum.WORLD);

    component.confirmCountry();
    expect(service.getCurrentCountry()).toBe(ArtGalleryCountryEnum.VIETNAM);
  });

  it('ignores country clicks until exploration has started', () => {
    component.onMapLoad(parseSvg(MAP_SVG));

    country('VN').dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(component.previewCountry).toBeNull();
  });

  it('opens the country preview with the keyboard', () => {
    component.onMapLoad(parseSvg(MAP_SVG));
    component.startExploring();

    country('VN').dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
    );

    expect(component.previewCountry).toBe(ArtGalleryCountryEnum.VIETNAM);
    expect(service.getCurrentCountry()).toBe(ArtGalleryCountryEnum.WORLD);
  });

  it('shows and clears the hover country', () => {
    component.onMapLoad(parseSvg(MAP_SVG));
    component.startExploring();
    const vietnam = country('VN');
    mockBBox(vietnam, { x: 1030, y: 300, width: 10, height: 50 });

    vietnam.dispatchEvent(new MouseEvent('mouseenter'));
    expect(component.hoveredCountry).toBe(ArtGalleryCountryEnum.VIETNAM);
    expect(component.hoverTooltipPosition?.left).toBeGreaterThan(70);
    expect(component.hoverTooltipPosition?.top).toBeGreaterThan(55);

    vietnam.dispatchEvent(new MouseEvent('mouseleave'));
    expect(component.hoveredCountry).toBeNull();
    expect(component.hoverTooltipPosition).toBeNull();
  });

  it('renders a zoomed copy of the selected country in the preview', () => {
    component.onMapLoad(parseSvg(MAP_SVG));
    component.startExploring();
    const vietnam = country('VN');
    mockBBox(vietnam, { x: 100, y: 200, width: 40, height: 80 });

    vietnam.dispatchEvent(new MouseEvent('click'));
    fixture.detectChanges();

    const preview = (fixture.nativeElement as HTMLElement).querySelector(
      '.countryPreview__map > svg',
    );
    expect(preview?.getAttribute('viewBox')).toBe('90.4 190.4 59.2 99.2');
    expect(preview?.querySelectorAll('g')).toHaveLength(1);
    expect(preview?.querySelector('[id], [tabindex]')).toBeNull();
  });

  it('keeps the introduction dismissed when returning to the map', () => {
    component.startExploring();

    const returnedMap = TestBed.createComponent(ArtGalleryWorldMapComponent);

    expect(returnedMap.componentInstance.isExploring).toBe(true);
    returnedMap.destroy();
  });

  it('reports an error if a visitable country is missing from the SVG', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});

    component.onMapLoad(parseSvg('<svg xmlns="http://www.w3.org/2000/svg"></svg>'));

    expect(component.mapLoadError).toBe(true);
    expect(error).toHaveBeenCalledOnce();
    error.mockRestore();
  });

  it('does not navigate when confirming without selecting a country', () => {
    component.confirmCountry();

    expect(service.getCurrentCountry()).toBe(ArtGalleryCountryEnum.WORLD);
  });
});
