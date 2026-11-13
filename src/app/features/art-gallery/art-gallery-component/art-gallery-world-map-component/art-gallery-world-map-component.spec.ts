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

    vietnam.dispatchEvent(new MouseEvent('mouseenter'));
    expect(component.hoveredCountry).toBe(ArtGalleryCountryEnum.VIETNAM);

    vietnam.dispatchEvent(new MouseEvent('mouseleave'));
    expect(component.hoveredCountry).toBeNull();
  });

  describe('hover callout', () => {
    beforeEach(() => {
      component.onMapLoad(parseSvg(MAP_SVG));
      component.startExploring();
    });

    it('anchors the callout on the right edge of the hovered country', () => {
      const vietnam = country('VN');
      mockBBox(vietnam, { x: 100, y: 200, width: 40, height: 80 });

      vietnam.dispatchEvent(new MouseEvent('mouseenter'));

      expect(component.callout).toEqual({ side: 'right', x: 140, y: 240 });
    });

    it('puts the callout on the left when the zoom controls are in the way', () => {
      const vietnam = country('VN');
      mockBBox(vietnam, { x: 1300, y: 200, width: 40, height: 80 });

      vietnam.dispatchEvent(new MouseEvent('mouseenter'));

      expect(component.callout).toEqual({ side: 'left', x: 1300, y: 240 });
    });

    it('removes the callout when the pointer leaves the country', () => {
      const vietnam = country('VN');
      mockBBox(vietnam, { x: 100, y: 200, width: 40, height: 80 });

      vietnam.dispatchEvent(new MouseEvent('mouseenter'));
      vietnam.dispatchEvent(new MouseEvent('mouseleave'));

      expect(component.callout).toBeNull();
    });
  });

  describe('medallions', () => {
    const pin = (): HTMLButtonElement | null =>
      (fixture.nativeElement as HTMLElement).querySelector('.countryPin');

    beforeEach(() => {
      component.onMapLoad(parseSvg(MAP_SVG));
      component.startExploring();
      mockBBox(country('VN'), { x: 100, y: 200, width: 40, height: 80 });
      component.zoomIn(); // recomputes the medallions with the mocked shape
      fixture.detectChanges();
    });

    it('places a medallion with the flag above each visitable country', () => {
      expect(component.pins).toHaveLength(1);
      expect(pin()?.querySelector('app-country-flag')).not.toBeNull();
    });

    it('gives way to the callout while its country is hovered', () => {
      pin()?.dispatchEvent(new MouseEvent('mouseenter'));
      fixture.detectChanges();

      expect(component.hoveredCountry).toBe(ArtGalleryCountryEnum.VIETNAM);
      expect(component.callout).not.toBeNull();
      expect(pin()?.classList).toContain('countryPin--away');
    });

    it('opens the country preview when clicked', () => {
      pin()?.click();

      expect(component.previewCountry).toBe(ArtGalleryCountryEnum.VIETNAM);
    });
  });

  it('draws waves and a land shadow that keeps its size on screen', () => {
    const lands = parseSvg(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1441 548"><g id="carte-monde-pays"><g id="country-VN"><path d="M0 0h1v1z"/></g></g></svg>',
    );
    component.onMapLoad(lands);
    const map = fixture.nativeElement as HTMLElement;
    const shadow = map.querySelector('.map-shadow');
    const offset = (): number =>
      Number(/translate\(0 ([\d.]+)\)/.exec(shadow?.getAttribute('transform') ?? '')?.[1]);

    expect(map.querySelector('.map-waves')).not.toBeNull();
    expect(shadow?.querySelector('[id]')).toBeNull();
    const before = offset();

    component.zoomIn();
    expect(offset()).toBeCloseTo(before / 1.5);
  });

  it('tells the child when a country is not open yet', () => {
    vi.useFakeTimers();
    try {
      component.onMapLoad(parseSvg(MAP_SVG));
      component.startExploring();
      const defaultMessage = component.guideMessage;

      country('FR').dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(component.guideMessage).toBe('artGallery.guide.unavailable');
      expect(component.previewCountry).toBeNull();

      vi.advanceTimersByTime(4000);
      expect(component.guideMessage).toBe(defaultMessage);
    } finally {
      vi.useRealTimers();
    }
  });

  it('gives small visitable countries a bigger hit area', () => {
    Object.defineProperty(SVGElement.prototype, 'getBBox', {
      configurable: true,
      value: () => ({ x: 10, y: 20, width: 4, height: 4 }),
    });
    try {
      component.onMapLoad(parseSvg(MAP_SVG));
      component.startExploring();
      const hitArea = (fixture.nativeElement as HTMLElement).querySelector(
        '.map-hit-area',
      );
      expect(hitArea).not.toBeNull();
      expect(Number(hitArea?.getAttribute('r'))).toBeGreaterThanOrEqual(18);

      hitArea?.dispatchEvent(new MouseEvent('mouseenter'));
      expect(component.hoveredCountry).toBe(ArtGalleryCountryEnum.VIETNAM);

      hitArea?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(component.previewCountry).toBe(ArtGalleryCountryEnum.VIETNAM);
    } finally {
      delete (SVGElement.prototype as { getBBox?: unknown }).getBBox;
    }
  });

  describe('zoom and pan', () => {
    const viewBox = (): number[] =>
      (fixture.nativeElement as HTMLElement)
        .querySelector('.worldMap__svg > svg')!
        .getAttribute('viewBox')!
        .split(' ')
        .map(Number);

    beforeEach(() => {
      component.onMapLoad(parseSvg(MAP_SVG));
      component.startExploring();
    });

    it('zooms in and out within limits', () => {
      const initialWidth = viewBox()[2];

      component.zoomIn();
      expect(viewBox()[2]).toBeLessThan(initialWidth);
      expect(component.canZoomOut).toBe(true);

      for (let i = 0; i < 10; i++) {
        component.zoomIn();
      }
      expect(component.canZoomIn).toBe(false);

      component.showWorld();
      expect(viewBox()).toEqual([0, 0, 1441, 548]);
      expect(component.canZoomOut).toBe(false);
      expect(component.canZoomIn).toBe(true);
    });

    it('pans the map by dragging, without opening the country preview', () => {
      component.zoomIn();
      component.zoomIn();
      const [startX, startY] = viewBox();
      const vietnam = country('VN');

      component.onPointerDown(
        new PointerEvent('pointerdown', { button: 0, clientX: 300, clientY: 200 }),
      );
      document.dispatchEvent(
        new PointerEvent('pointermove', { clientX: 260, clientY: 180 }),
      );
      expect(component.isDragging).toBe(true);
      document.dispatchEvent(
        new PointerEvent('pointerup', { clientX: 260, clientY: 180 }),
      );
      vietnam.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      const [movedX, movedY] = viewBox();
      expect(movedX).toBeGreaterThan(startX);
      expect(movedY).toBeGreaterThan(startY);
      expect(component.isDragging).toBe(false);
      expect(component.previewCountry).toBeNull();
    });

    it('keeps the map inside the viewport while panning', () => {
      component.showWorld();
      const before = viewBox();

      component.onPointerDown(
        new PointerEvent('pointerdown', { button: 0, clientX: 0, clientY: 0 }),
      );
      document.dispatchEvent(
        new PointerEvent('pointermove', { clientX: 500, clientY: 500 }),
      );
      document.dispatchEvent(new PointerEvent('pointerup'));

      expect(viewBox()).toEqual(before);
    });
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

  it('closes the preview when the veil is clicked, not its content', () => {
    component.onMapLoad(parseSvg(MAP_SVG));
    component.startExploring();
    const vietnam = country('VN');
    mockBBox(vietnam, { x: 100, y: 200, width: 40, height: 80 });
    vietnam.dispatchEvent(new MouseEvent('click'));
    fixture.detectChanges();
    const preview = (fixture.nativeElement as HTMLElement).querySelector(
      '.countryPreview',
    ) as HTMLElement;

    preview
      .querySelector('.countryPreview__title')
      ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(component.previewCountry).toBe(ArtGalleryCountryEnum.VIETNAM);
    expect(document.activeElement?.classList).toContain(
      'countryPreview__explore',
    );

    preview.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(component.previewCountry).toBeNull();
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
