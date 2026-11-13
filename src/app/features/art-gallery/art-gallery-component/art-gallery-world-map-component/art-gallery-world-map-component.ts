import { HttpBackend, HttpClient } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '@ngx-translate/core';
import { ArtGalleryConstants } from '../../art-gallery-constants';
import { ArtGalleryCountryEnum } from '../../art-gallery-country-enum';
import { ArtGalleryService } from '../../art-gallery-service';
import { CountryEnumToTextPipe } from '../../country-enum-to-text-pipe';

const COUNTRY_SVG_CODE_BY_ENUM = {
  [ArtGalleryCountryEnum.LEBANON]: 'LB',
  [ArtGalleryCountryEnum.AUSTRALIA]: 'AU',
  [ArtGalleryCountryEnum.ITALY]: 'IT',
  [ArtGalleryCountryEnum.FRANCE]: 'FR',
  [ArtGalleryCountryEnum.TOGO]: 'TG',
  [ArtGalleryCountryEnum.BRAZIL]: 'BR',
  [ArtGalleryCountryEnum.VIETNAM]: 'VN',
} satisfies Record<
  Exclude<
    ArtGalleryCountryEnum,
    ArtGalleryCountryEnum.UNDEFINED | ArtGalleryCountryEnum.WORLD
  >,
  string
>;

type MapCountry = Exclude<
  ArtGalleryCountryEnum,
  ArtGalleryCountryEnum.UNDEFINED | ArtGalleryCountryEnum.WORLD
>;

function isMapCountry(country: ArtGalleryCountryEnum): country is MapCountry {
  return (
    country !== ArtGalleryCountryEnum.UNDEFINED &&
    country !== ArtGalleryCountryEnum.WORLD
  );
}

function getBounds(element: SVGGraphicsElement): DOMRect | null {
  if (typeof element.getBBox !== 'function') {
    return null;
  }
  const bounds = element.getBBox();
  return bounds.width > 0 && bounds.height > 0 ? bounds : null;
}

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
const MAP_ASSET_URL = '/assets/images/art-gallery/World_map_svgo.svg';
const DEFAULT_MAP_VIEW_BOX = { x: 0, y: 0, width: 1441, height: 548 };

@Component({
  imports: [CountryEnumToTextPipe, TranslatePipe],
  selector: 'app-art-gallery-world-map-component',
  styleUrl: './art-gallery-world-map-component.scss',
  templateUrl: './art-gallery-world-map-component.html',
})
export class ArtGalleryWorldMapComponent implements OnInit, OnDestroy {
  private readonly service = inject(ArtGalleryService);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  // HttpBackend bypasses the API interceptors: the map is a static asset.
  private readonly http = new HttpClient(inject(HttpBackend));
  isExploring = this.service.hasStartedExploring();
  hoveredCountry: MapCountry | null = null;
  hoverTooltipPosition: { left: number; top: number } | null = null;
  previewCountry: MapCountry | null = null;
  mapLoadError = false;
  previewMapError = false;
  private mapViewBox = DEFAULT_MAP_VIEW_BOX;
  private mapSvg: SVGSVGElement | null = null;
  private previewViewBox: string | null = null;

  @ViewChild('mapContainer', { static: true })
  private mapContainer!: ElementRef<HTMLDivElement>;

  private readonly countryListeners: Array<{
    element: SVGGraphicsElement;
    click: EventListener;
    keydown: EventListener;
    mouseenter: EventListener;
    mouseleave: EventListener;
  }> = [];

  @ViewChild('previewClose')
  set previewCloseButton(button: ElementRef<HTMLButtonElement> | undefined) {
    button?.nativeElement.focus();
  }

  @ViewChild('previewMap')
  set previewMapContainer(container: ElementRef<HTMLDivElement> | undefined) {
    if (container) {
      this.renderPreviewMap(container.nativeElement);
    }
  }

  ngOnInit(): void {
    this.http
      .get(MAP_ASSET_URL, { responseType: 'text' })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (svgText) =>
          this.onMapLoad(
            new DOMParser().parseFromString(svgText, 'image/svg+xml'),
          ),
        error: () => this.onMapError(),
      });
  }

  onMapLoad(svgDocument: Document | null): void {
    this.removeCountryListeners();
    this.mapLoadError = false;
    this.mapSvg = null;

    const sourceRoot = svgDocument?.documentElement;
    if (
      !svgDocument ||
      !sourceRoot ||
      sourceRoot.localName !== 'svg' ||
      svgDocument.querySelector('parsererror')
    ) {
      this.reportMapError('The world map SVG could not be read.');
      return;
    }

    // The SVG is inlined in the page (instead of an <object>) so its countries
    // share the page's events, focus and geometry without contentDocument timing.
    const svgRoot = document.importNode(sourceRoot, true) as Element as SVGSVGElement;
    svgRoot.removeAttribute('width');
    svgRoot.removeAttribute('height');
    svgRoot.setAttribute('focusable', 'false');
    this.mapContainer.nativeElement.replaceChildren(svgRoot);
    this.mapSvg = svgRoot;
    this.changeDetector.markForCheck();

    const viewBox = svgRoot
      .getAttribute('viewBox')
      ?.trim()
      .split(/\s+/)
      .map(Number);
    if (
      viewBox?.length === 4 &&
      viewBox.every(Number.isFinite) &&
      viewBox[2] > 0 &&
      viewBox[3] > 0
    ) {
      this.mapViewBox = {
        x: viewBox[0],
        y: viewBox[1],
        width: viewBox[2],
        height: viewBox[3],
      };
    }

    const countryTargets: Array<{
      country: MapCountry;
      element: SVGGraphicsElement;
    }> = [];

    for (const country of ArtGalleryConstants.VISITABLE_COUNTRIES) {
      if (!isMapCountry(country)) {
        this.reportMapError(`The map cannot navigate to country ${country}.`);
        return;
      }

      const svgCode = COUNTRY_SVG_CODE_BY_ENUM[country];
      const element = svgRoot.querySelector<SVGGraphicsElement>(
        `#country-${svgCode}`,
      );

      if (!element) {
        this.reportMapError(`The world map is missing country-${svgCode}.`);
        return;
      }

      countryTargets.push({ country, element });
    }

    const style = document.createElementNS(SVG_NAMESPACE, 'style');
    style.textContent = `
      .country-visitable { cursor: pointer; }
      .country-visitable:hover,
      .country-visitable:focus-visible { opacity: 0.75; }
    `;
    svgRoot.insertBefore(style, svgRoot.firstChild);

    for (const { country, element } of countryTargets) {
      const countryName = ArtGalleryCountryEnum[country];
      const countryLabel =
        countryName.charAt(0) + countryName.slice(1).toLowerCase();

      element.classList.add('country-visitable');
      element.setAttribute('role', 'button');
      element.setAttribute('tabindex', this.isExploring ? '0' : '-1');
      element.setAttribute('aria-label', countryLabel);
      element.setAttribute('aria-keyshortcuts', 'Enter Space');

      const onClick: EventListener = () => {
        if (this.isExploring) {
          this.updateView(() => this.openCountryPreview(country, element));
        }
      };
      const onKeydown: EventListener = (event) => {
        const key = (event as KeyboardEvent).key;
        if (this.isExploring && (key === 'Enter' || key === ' ')) {
          event.preventDefault();
          this.updateView(() => this.openCountryPreview(country, element));
        }
      };
      const onMouseenter: EventListener = () => {
        if (this.isExploring && this.previewCountry === null) {
          this.updateView(() => {
            this.hoveredCountry = country;
            this.hoverTooltipPosition = this.getTooltipPosition(element);
          });
        }
      };
      const onMouseleave: EventListener = () => {
        if (this.hoveredCountry === country) {
          this.updateView(() => {
            this.hoveredCountry = null;
            this.hoverTooltipPosition = null;
          });
        }
      };

      element.addEventListener('click', onClick);
      element.addEventListener('keydown', onKeydown);
      element.addEventListener('mouseenter', onMouseenter);
      element.addEventListener('mouseleave', onMouseleave);
      this.countryListeners.push({
        element,
        click: onClick,
        keydown: onKeydown,
        mouseenter: onMouseenter,
        mouseleave: onMouseleave,
      });
    }
  }

  startExploring(): void {
    this.isExploring = true;
    this.service.startExploring();
    this.setCountryTabStops(true);
  }

  closeCountryPreview(): void {
    this.previewCountry = null;
    this.previewMapError = false;
    this.previewViewBox = null;
    this.setCountryTabStops(this.isExploring);
  }

  confirmCountry(): void {
    const country = this.previewCountry;
    if (country === null) {
      return;
    }

    this.closeCountryPreview();
    this.service.goTo(country);
  }

  flagClass(country: MapCountry): string {
    return `fi fi-${COUNTRY_SVG_CODE_BY_ENUM[country].toLowerCase()}`;
  }

  onMapError(): void {
    this.reportMapError('The world map SVG failed to load.');
  }

  ngOnDestroy(): void {
    this.removeCountryListeners();
  }

  private openCountryPreview(
    country: MapCountry,
    element: SVGGraphicsElement,
  ): void {
    this.hoveredCountry = null;
    this.hoverTooltipPosition = null;
    this.previewMapError = false;
    this.previewViewBox = null;

    const bounds = getBounds(element);
    if (bounds) {
      const padding = Math.max(bounds.width, bounds.height) * 0.12;
      this.previewViewBox = `${bounds.x - padding} ${bounds.y - padding} ${bounds.width + padding * 2} ${bounds.height + padding * 2}`;
    } else {
      this.reportPreviewMapError(
        `The preview map has no visible shape for ${element.id}.`,
      );
    }

    this.previewCountry = country;
    this.setCountryTabStops(false);
  }

  /** Draws a zoomed copy of the selected country only, reusing the loaded map. */
  private renderPreviewMap(container: HTMLElement): void {
    const country = this.previewCountry;
    if (country === null || !this.mapSvg || !this.previewViewBox) {
      return;
    }

    const selectedId = `country-${COUNTRY_SVG_CODE_BY_ENUM[country]}`;
    const preview = this.mapSvg.cloneNode(true) as SVGSVGElement;
    for (const element of preview.querySelectorAll('[id^="country-"]')) {
      if (element.id !== selectedId) {
        element.remove();
      }
    }
    for (const element of preview.querySelectorAll('style')) {
      element.remove();
    }
    for (const element of preview.querySelectorAll(
      '[id^="country-"], [id^="part-"]',
    )) {
      element.removeAttribute('id');
      element.removeAttribute('role');
      element.removeAttribute('tabindex');
      element.removeAttribute('aria-label');
      element.removeAttribute('aria-keyshortcuts');
      element.classList.remove('country-visitable');
    }
    preview.setAttribute('viewBox', this.previewViewBox);
    preview.setAttribute('aria-hidden', 'true');
    container.replaceChildren(preview);
  }

  private setCountryTabStops(isFocusable: boolean): void {
    for (const { element } of this.countryListeners) {
      element.setAttribute('tabindex', isFocusable ? '0' : '-1');
    }
  }

  private getTooltipPosition(
    element: SVGGraphicsElement,
  ): { left: number; top: number } | null {
    const bounds = getBounds(element);
    if (!bounds) {
      return null;
    }

    const left =
      ((bounds.x + bounds.width / 2 - this.mapViewBox.x) /
        this.mapViewBox.width) *
      100;
    const top =
      ((bounds.y + bounds.height / 2 - this.mapViewBox.y) /
        this.mapViewBox.height) *
      100;

    return {
      left: Math.min(92, Math.max(8, left)),
      top: Math.min(92, Math.max(16, top)),
    };
  }

  private reportMapError(message: string): void {
    console.error(message);
    this.mapLoadError = true;
    this.changeDetector.markForCheck();
  }

  // Listeners added on the inlined SVG are outside the template, so the
  // (OnPush by default) view must be told explicitly that state changed.
  private updateView(change: () => void): void {
    change();
    this.changeDetector.markForCheck();
  }

  private reportPreviewMapError(message: string): void {
    console.error(message);
    this.previewMapError = true;
  }

  private removeCountryListeners(): void {
    for (const { element, click, keydown, mouseenter, mouseleave } of this
      .countryListeners) {
      element.removeEventListener('click', click);
      element.removeEventListener('keydown', keydown);
      element.removeEventListener('mouseenter', mouseenter);
      element.removeEventListener('mouseleave', mouseleave);
    }
    this.countryListeners.length = 0;
  }
}
