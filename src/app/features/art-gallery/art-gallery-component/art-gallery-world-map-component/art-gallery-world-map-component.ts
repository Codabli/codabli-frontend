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
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ArtGalleryConstants } from '../../art-gallery-constants';
import { ArtGalleryCountryEnum } from '../../art-gallery-country-enum';
import { ArtGalleryService } from '../../art-gallery-service';
import { ArtGalleryWorldMapService } from '../../art-gallery-world-map-service';
import { CountryEnumToTextPipe } from '../../country-enum-to-text-pipe';
import { CountryFlag } from '@shared/components/country-flag/country-flag.component';

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

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

/** Runs `callback` on the next frame, or right away where frames are not available. */
function onNextFrame(callback: () => void): number | null {
  if (typeof requestAnimationFrame !== 'function') {
    callback();
    return null;
  }
  return requestAnimationFrame(callback);
}

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
const DEFAULT_MAP_BOUNDS: MapRect = { x: 0, y: 0, width: 1441, height: 548 };
/** Initial framing on Asia, where the visitable rooms are for now (Figma frame). */
const ASIA_FOCUS: MapRect = { x: 800, y: 0, width: 620, height: 548 };
const ZOOM_STEP = 1.5;
/** How far the map can zoom in, relative to the whole-world view. */
const MAX_ZOOM_FROM_WORLD = 8;
/** Pointer travel (px) after which a press becomes a drag instead of a click. */
const DRAG_THRESHOLD_PX = 6;
const VIEW_ANIMATION_MS = 350;
/** Visitable countries smaller than this (half-diagonal, SVG units) get a bigger hit area. */
const SMALL_COUNTRY_RADIUS = 12;
/** Minimum on-screen radius (px) of the hit area of a small country. */
const HIT_AREA_MIN_RADIUS_PX = 18;
/** Length (px) of the line linking a hovered country to its callout bubble. */
const CALLOUT_LINE_PX = 56;
/** Room needed beside a country to show the callout bubble (estimated bubble width). */
const CALLOUT_BUBBLE_PX = 260;
/** Space kept free on the right for the zoom controls. */
const CONTROLS_RESERVED_PX = 112;
/** Distance (px) kept between the callout and the top or bottom edge of the map. */
const CALLOUT_EDGE_MARGIN_PX = 48;
/** Group holding every country in the map SVG (Figma export). */
const LANDS_GROUP_ID = 'carte-monde-pays';
/** Offset (px) of the solid shadow under the lands, the same at every zoom level. */
const LAND_SHADOW_PX = 3;
/** Islands smaller than this (diagonal, SVG units) get no shadow: it would look like a second island. */
const TINY_ISLAND_SIZE = 4;
/** A few sparse waves, repeated over the ocean (SVG units). */
const WAVES_TILE = { width: 150, height: 96 };
const WAVE_PATHS = [
  'M14 22 q4 -3.5 8 0 t8 0 t8 0',
  'M92 70 q4 -3.5 8 0 t8 0',
];
/** Gap (px) between the top of a visitable country and the tip of its medallion. */
const PIN_GAP_PX = 6;
const GUIDE_MESSAGE_DEFAULT = 'artGallery.guide.findCountry';
const GUIDE_MESSAGE_UNAVAILABLE = 'artGallery.guide.unavailable';
const GUIDE_MESSAGE_DURATION_MS = 4000;
/** Attributes that make a country interactive on the map, removed from its preview copy. */
const INTERACTIVE_ATTRIBUTES = [
  'id',
  'class',
  'role',
  'tabindex',
  'aria-label',
  'aria-keyshortcuts',
];

/** Hover callout: anchor point (px, relative to the map frame) and side of the bubble. */
interface CountryCallout {
  x: number;
  y: number;
  side: 'left' | 'right';
}

/** Gold medallion over a visitable country: its tip (px, relative to the map frame). */
interface CountryPin {
  country: MapCountry;
  x: number;
  y: number;
}

interface MapRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Map camera: center in SVG units, and scale in screen pixels per SVG unit. */
interface MapView {
  cx: number;
  cy: number;
  scale: number;
}

/** The map viewport in the map frame (px). */
interface Viewport {
  left: number;
  top: number;
  width: number;
  height: number;
}

@Component({
  imports: [CountryEnumToTextPipe, CountryFlag, TranslatePipe],
  selector: 'app-art-gallery-world-map-component',
  styleUrl: './art-gallery-world-map-component.scss',
  templateUrl: './art-gallery-world-map-component.html',
})
export class ArtGalleryWorldMapComponent implements OnInit, OnDestroy {
  private readonly service = inject(ArtGalleryService);
  private readonly worldMapService = inject(ArtGalleryWorldMapService);
  private readonly translate = inject(TranslateService);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly countryToText = new CountryEnumToTextPipe();

  isExploring = this.service.hasStartedExploring();
  hoveredCountry: MapCountry | null = null;
  previewCountry: MapCountry | null = null;
  mapLoadError = false;
  previewMapError = false;
  isDragging = false;
  callout: CountryCallout | null = null;
  pins: CountryPin[] = [];
  readonly calloutLineLength = CALLOUT_LINE_PX;
  /** Message of the map guide (the future mascot's speech bubble). */
  guideMessage = GUIDE_MESSAGE_DEFAULT;

  private guideTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly countryElements = new Map<MapCountry, SVGGraphicsElement>();
  /** Country shapes in SVG units: they never change with the zoom, so they are measured once. */
  private readonly countryBounds = new Map<MapCountry, DOMRect>();
  private readonly hitAreas: Array<{ circle: SVGCircleElement; radius: number }> =
    [];
  private labelSubscriptions = new Subscription();
  private rootClickListener: EventListener | null = null;
  private mapBounds = DEFAULT_MAP_BOUNDS;
  private mapSvg: SVGSVGElement | null = null;
  private landShadow: SVGGElement | null = null;
  private previewViewBox: string | null = null;
  /** Country that opened the preview: focus goes back to it when the preview closes. */
  private previewOrigin: SVGGraphicsElement | null = null;

  private view: MapView | null = null;
  /** Where the current animation is heading; drives the control states. */
  private targetView: MapView | null = null;
  private animationFrame: number | null = null;
  /** Measured once per size change, so change detection never reads the layout. */
  private viewport: Viewport | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private drag: {
    pointerId: number;
    startX: number;
    startY: number;
    lastX: number;
    lastY: number;
    moved: boolean;
  } | null = null;
  /** Pointer travel not drawn yet: drags are drawn at most once per frame. */
  private pendingPan = { dx: 0, dy: 0 };
  private panFrame: number | null = null;
  private suppressNextClick = false;

  @ViewChild('mapContainer', { static: true })
  private mapContainer!: ElementRef<HTMLDivElement>;

  private readonly countryListeners: Array<{
    element: SVGElement;
    click: EventListener;
    keydown: EventListener;
    mouseenter: EventListener;
    mouseleave: EventListener;
  }> = [];

  /** Focuses the main action when the preview opens. */
  @ViewChild('previewExplore')
  set previewExploreButton(button: ElementRef<HTMLButtonElement> | undefined) {
    button?.nativeElement.focus();
  }

  @ViewChild('previewMap')
  set previewMapContainer(container: ElementRef<HTMLDivElement> | undefined) {
    if (container) {
      this.renderPreviewMap(container.nativeElement);
    }
  }

  ngOnInit(): void {
    this.worldMapService
      .getWorldMap()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (svgDocument) => this.onMapLoad(svgDocument),
        error: () => this.onMapError(),
      });
  }

  onMapLoad(svgDocument: Document | null): void {
    this.removeCountryListeners();
    this.mapLoadError = false;
    this.mapSvg = null;
    this.viewport = null;

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
    // share the page's events, focus and geometry. importNode copies it: the
    // source document is shared through ArtGalleryWorldMapService.
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
      this.mapBounds = {
        x: viewBox[0],
        y: viewBox[1],
        width: viewBox[2],
        height: viewBox[3],
      };
    }
    svgRoot.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    this.decorateMap(svgRoot);
    this.cancelAnimation();
    this.applyView(this.fitRect(ASIA_FOCUS));
    this.observeResize();

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

    // Country hover and pulse styles live in the component SCSS (the SVG is inline).
    const hitLayer = document.createElementNS(SVG_NAMESPACE, 'g');
    hitLayer.setAttribute('class', 'map-hit-areas');

    for (const { country, element } of countryTargets) {
      this.countryElements.set(country, element);
      element.classList.add('country-visitable');
      element.setAttribute('role', 'button');
      element.setAttribute('tabindex', this.isExploring ? '0' : '-1');
      element.setAttribute('aria-keyshortcuts', 'Enter Space');
      // Translated name, kept up to date when the language changes.
      this.labelSubscriptions.add(
        this.translate
          .stream(this.countryToText.transform(country))
          .subscribe((label: string) => element.setAttribute('aria-label', label)),
      );

      const hitArea = this.createHitArea(country);
      if (hitArea) {
        hitLayer.appendChild(hitArea);
      }
      // Moving onto the country's own hit area or medallion is not leaving it.
      const belongsToCountry = (node: EventTarget | null): boolean =>
        node instanceof Node &&
        (element.contains(node) ||
          node === hitArea ||
          (node instanceof Element && node.closest('.countryPin') !== null));

      const onClick: EventListener = () => {
        // The click that ends a drag must not open the country preview.
        if (this.suppressNextClick) {
          this.suppressNextClick = false;
          return;
        }
        if (this.isExploring) {
          this.updateView(() => this.openCountryPreview(country));
        }
      };
      const onKeydown: EventListener = (event) => {
        const key = (event as KeyboardEvent).key;
        if (this.isExploring && (key === 'Enter' || key === ' ')) {
          event.preventDefault();
          this.updateView(() => this.openCountryPreview(country));
        }
      };
      const onMouseenter: EventListener = () => {
        if (this.hoveredCountry !== country) {
          this.updateView(() => this.hoverCountry(country));
        }
      };
      const onMouseleave: EventListener = (event) => {
        if (
          this.hoveredCountry === country &&
          !belongsToCountry((event as MouseEvent).relatedTarget)
        ) {
          this.updateView(() => this.clearHover());
        }
      };

      for (const target of hitArea ? [element, hitArea] : [element]) {
        target.addEventListener('click', onClick);
        target.addEventListener('keydown', onKeydown);
        target.addEventListener('mouseenter', onMouseenter);
        target.addEventListener('mouseleave', onMouseleave);
        this.countryListeners.push({
          element: target,
          click: onClick,
          keydown: onKeydown,
          mouseenter: onMouseenter,
          mouseleave: onMouseleave,
        });
      }
    }

    if (hitLayer.hasChildNodes()) {
      svgRoot.appendChild(hitLayer);
      this.updateHitAreas();
    }

    // Countries that are not open yet still answer a click, through the guide.
    this.rootClickListener = (event) => {
      const target = event.target instanceof Element ? event.target : null;
      const clickedCountry = target?.closest('[id^="country-"]');
      if (
        !clickedCountry ||
        clickedCountry.classList.contains('country-visitable') ||
        !this.isExploring
      ) {
        return;
      }
      if (this.suppressNextClick) {
        this.suppressNextClick = false;
        return;
      }
      this.updateView(() => this.showGuideMessage(GUIDE_MESSAGE_UNAVAILABLE));
    };
    svgRoot.addEventListener('click', this.rootClickListener);

    this.updatePins();
    this.changeDetector.markForCheck();
  }

  startExploring(): void {
    this.isExploring = true;
    this.service.startExploring();
    this.setCountryTabStops(true);
  }

  /** Closes the preview and gives the focus back to the country that opened it. */
  closeCountryPreview(): void {
    const origin = this.previewOrigin;
    this.resetPreview();
    origin?.focus({ preventScroll: true });
  }

  /** Clicking the veil itself (not the country or the buttons) closes the preview. */
  onPreviewBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeCountryPreview();
    }
  }

  confirmCountry(): void {
    const country = this.previewCountry;
    if (country === null) {
      return;
    }

    this.resetPreview();
    this.service.goTo(country);
  }

  /** ISO code of the country's flag (see app-country-flag). */
  flagCode(country: MapCountry): string {
    return COUNTRY_SVG_CODE_BY_ENUM[country].toLowerCase();
  }

  onMapError(): void {
    this.reportMapError('The world map SVG failed to load.');
  }

  get canZoomIn(): boolean {
    const view = this.targetView ?? this.view;
    return view !== null && view.scale < this.maxScale() * 0.999;
  }

  get canZoomOut(): boolean {
    const view = this.targetView ?? this.view;
    return view !== null && view.scale > this.minScale() * 1.001;
  }

  zoomIn(): void {
    this.zoomBy(ZOOM_STEP);
  }

  zoomOut(): void {
    this.zoomBy(1 / ZOOM_STEP);
  }

  showWorld(): void {
    this.animateTo(this.fitRect(this.mapBounds));
  }

  /** The medallion of a country is hovered: same as hovering the country. */
  onPinEnter(country: MapCountry): void {
    this.hoverCountry(country);
  }

  onPinLeave(event: MouseEvent, country: MapCountry): void {
    const element = this.countryElements.get(country);
    const target = event.relatedTarget;
    if (target instanceof Node && element?.contains(target)) {
      return;
    }
    if (this.hoveredCountry === country) {
      this.clearHover();
    }
  }

  openPreviewFromPin(country: MapCountry): void {
    if (this.isExploring) {
      this.openCountryPreview(country);
    }
  }

  onPointerDown(event: PointerEvent): void {
    if (
      !this.isExploring ||
      this.view === null ||
      this.previewCountry !== null ||
      event.button !== 0
    ) {
      return;
    }

    this.suppressNextClick = false;
    this.drag = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      lastX: event.clientX,
      lastY: event.clientY,
      moved: false,
    };
    document.addEventListener('pointermove', this.onPointerMove);
    document.addEventListener('pointerup', this.onPointerUp);
    document.addEventListener('pointercancel', this.onPointerUp);
  }

  ngOnDestroy(): void {
    this.removeCountryListeners();
    this.cancelAnimation();
    this.stopDragging();
    this.resizeObserver?.disconnect();
    if (this.guideTimer !== null) {
      clearTimeout(this.guideTimer);
    }
  }

  private readonly onPointerMove = (event: PointerEvent): void => {
    const drag = this.drag;
    if (!drag || event.pointerId !== drag.pointerId || this.view === null) {
      return;
    }

    if (!drag.moved) {
      const distance = Math.hypot(
        event.clientX - drag.startX,
        event.clientY - drag.startY,
      );
      if (distance < DRAG_THRESHOLD_PX) {
        return;
      }
      drag.moved = true;
      this.cancelAnimation();
      this.updateView(() => {
        this.isDragging = true;
        this.clearHover();
      });
    }

    this.pendingPan.dx += event.clientX - drag.lastX;
    this.pendingPan.dy += event.clientY - drag.lastY;
    drag.lastX = event.clientX;
    drag.lastY = event.clientY;
    this.panFrame ??= onNextFrame(() => {
      this.panFrame = null;
      this.flushPan();
    });
  };

  private readonly onPointerUp = (event: PointerEvent): void => {
    if (this.drag && event.pointerId === this.drag.pointerId) {
      this.flushPan();
      this.suppressNextClick = this.drag.moved;
      this.stopDragging();
    }
  };

  /** Draws the pointer travel gathered since the last frame. */
  private flushPan(): void {
    const { dx, dy } = this.pendingPan;
    this.pendingPan = { dx: 0, dy: 0 };
    if (this.view === null || (dx === 0 && dy === 0)) {
      return;
    }
    const { cx, cy, scale } = this.view;
    this.applyView({ cx: cx - dx / scale, cy: cy - dy / scale, scale });
  }

  private stopDragging(): void {
    this.drag = null;
    if (this.panFrame !== null) {
      cancelAnimationFrame(this.panFrame);
      this.panFrame = null;
    }
    this.pendingPan = { dx: 0, dy: 0 };
    document.removeEventListener('pointermove', this.onPointerMove);
    document.removeEventListener('pointerup', this.onPointerUp);
    document.removeEventListener('pointercancel', this.onPointerUp);
    if (this.isDragging) {
      this.updateView(() => (this.isDragging = false));
    }
  }

  private zoomBy(factor: number): void {
    const base = this.targetView ?? this.view;
    if (base) {
      this.animateTo({ ...base, scale: base.scale * factor });
    }
  }

  /**
   * The map viewport (px). Measured once per size change; before layout, it
   * falls back to the SVG size so the camera maths stay valid.
   */
  private viewportSize(): Viewport {
    if (this.viewport) {
      return this.viewport;
    }
    const container = this.mapContainer.nativeElement;
    if (container.clientWidth > 0 && container.clientHeight > 0) {
      this.viewport = {
        left: container.offsetLeft,
        top: container.offsetTop,
        width: container.clientWidth,
        height: container.clientHeight,
      };
      return this.viewport;
    }
    return {
      left: 0,
      top: 0,
      width: this.mapBounds.width,
      height: this.mapBounds.height,
    };
  }

  /** The scale showing the whole map is also the most zoomed-out one. */
  private minScale(): number {
    const { width, height } = this.viewportSize();
    return Math.min(width / this.mapBounds.width, height / this.mapBounds.height);
  }

  private maxScale(): number {
    return this.minScale() * MAX_ZOOM_FROM_WORLD;
  }

  private fitRect(rect: MapRect): MapView {
    const { width, height } = this.viewportSize();
    return {
      cx: rect.x + rect.width / 2,
      cy: rect.y + rect.height / 2,
      scale: Math.min(width / rect.width, height / rect.height),
    };
  }

  /** Keeps the zoom in range and the map inside the viewport. */
  private clampView(view: MapView): MapView {
    const { width, height } = this.viewportSize();
    const scale = Math.min(
      this.maxScale(),
      Math.max(this.minScale(), view.scale),
    );
    const clampAxis = (
      center: number,
      start: number,
      length: number,
      viewportLength: number,
    ): number => {
      const half = viewportLength / scale / 2;
      return half * 2 >= length
        ? start + length / 2
        : Math.min(start + length - half, Math.max(start + half, center));
    };
    const { x, y, width: mapWidth, height: mapHeight } = this.mapBounds;
    return {
      cx: clampAxis(view.cx, x, mapWidth, width),
      cy: clampAxis(view.cy, y, mapHeight, height),
      scale,
    };
  }

  private applyView(view: MapView): void {
    if (!this.mapSvg) {
      return;
    }
    const { width, height } = this.viewportSize();
    const clamped = this.clampView(view);
    const viewWidth = width / clamped.scale;
    const viewHeight = height / clamped.scale;
    this.view = clamped;
    this.mapSvg.setAttribute(
      'viewBox',
      `${clamped.cx - viewWidth / 2} ${clamped.cy - viewHeight / 2} ${viewWidth} ${viewHeight}`,
    );
    this.updateHitAreas();
    // Keep the land shadow the same size on screen, whatever the zoom.
    this.landShadow?.setAttribute(
      'transform',
      `translate(0 ${LAND_SHADOW_PX / clamped.scale})`,
    );
    if (this.countryElements.size > 0) {
      this.updatePins();
      this.changeDetector.markForCheck();
    }
    if (this.hoveredCountry !== null) {
      this.updateCallout();
      this.changeDetector.markForCheck();
    }
  }

  /** Hovering a country (or its medallion): it pulses and its callout shows. */
  private hoverCountry(country: MapCountry): void {
    const element = this.countryElements.get(country);
    if (
      !element ||
      !this.isExploring ||
      this.previewCountry !== null ||
      this.isDragging
    ) {
      return;
    }
    this.clearHover();
    // A class rather than :hover, so hovering the hit area or the medallion of
    // a country also makes the country itself pulse.
    element.classList.add('country-hovered');
    this.hoveredCountry = country;
    this.updateCallout();
  }

  /**
   * Validated "travel journal" look: a few waves in the ocean and a solid
   * shadow under the lands (a copy of the lands, moved down in applyView).
   */
  private decorateMap(svgRoot: SVGSVGElement): void {
    this.landShadow = null;
    const lands = svgRoot.querySelector<SVGGElement>(`#${LANDS_GROUP_ID}`);
    if (!lands) {
      return;
    }
    lands.classList.add('map-lands');

    const defs = document.createElementNS(SVG_NAMESPACE, 'defs');
    const pattern = document.createElementNS(SVG_NAMESPACE, 'pattern');
    pattern.setAttribute('id', 'map-waves-pattern');
    pattern.setAttribute('width', `${WAVES_TILE.width}`);
    pattern.setAttribute('height', `${WAVES_TILE.height}`);
    pattern.setAttribute('patternUnits', 'userSpaceOnUse');
    for (const d of WAVE_PATHS) {
      const wave = document.createElementNS(SVG_NAMESPACE, 'path');
      wave.setAttribute('class', 'map-wave');
      wave.setAttribute('d', d);
      pattern.appendChild(wave);
    }
    defs.appendChild(pattern);
    svgRoot.insertBefore(defs, svgRoot.firstChild);

    // Covers the ocean well beyond the map, so panning never reaches its edge.
    const { x, y, width, height } = this.mapBounds;
    const waves = document.createElementNS(SVG_NAMESPACE, 'rect');
    waves.setAttribute('class', 'map-waves');
    waves.setAttribute('x', `${x - width}`);
    waves.setAttribute('y', `${y - height * 2}`);
    waves.setAttribute('width', `${width * 3}`);
    waves.setAttribute('height', `${height * 5}`);
    waves.setAttribute('fill', 'url(#map-waves-pattern)');
    svgRoot.insertBefore(waves, lands);

    const shadow = lands.cloneNode(true) as SVGGElement;
    shadow.removeAttribute('id');
    shadow.setAttribute('class', 'map-shadow');
    shadow.setAttribute('aria-hidden', 'true');
    for (const element of shadow.querySelectorAll('[id]')) {
      element.removeAttribute('id');
    }
    const sourcePaths = lands.querySelectorAll<SVGGraphicsElement>('path');
    shadow.querySelectorAll('path').forEach((path, index) => {
      const bounds = getBounds(sourcePaths[index]);
      if (bounds && Math.hypot(bounds.width, bounds.height) < TINY_ISLAND_SIZE) {
        path.classList.add('map-shadow__tiny');
      }
    });
    svgRoot.insertBefore(shadow, lands);
    this.landShadow = shadow;
  }

  /** Shape of a visitable country in SVG units, measured once. */
  private boundsOf(country: MapCountry): DOMRect | null {
    const cached = this.countryBounds.get(country);
    if (cached) {
      return cached;
    }
    const element = this.countryElements.get(country);
    const bounds = element ? getBounds(element) : null;
    if (bounds) {
      this.countryBounds.set(country, bounds);
    }
    return bounds;
  }

  /** Converts a point of the map (SVG units) to the map frame (px). */
  private toScreen(x: number, y: number): { x: number; y: number } {
    const { left, top, width, height } = this.viewportSize();
    const { cx, cy, scale } = this.view ?? { cx: 0, cy: 0, scale: 1 };
    return {
      x: left + (x - cx) * scale + width / 2,
      y: top + (y - cy) * scale + height / 2,
    };
  }

  /** Places a medallion above each visitable country. */
  private updatePins(): void {
    const pins: CountryPin[] = [];
    if (this.view !== null) {
      for (const country of this.countryElements.keys()) {
        const bounds = this.boundsOf(country);
        if (bounds) {
          const tip = this.toScreen(bounds.x + bounds.width / 2, bounds.y);
          pins.push({ country, x: tip.x, y: tip.y - PIN_GAP_PX });
        }
      }
    }
    this.pins = pins;
  }

  /** An invisible, bigger click target over a small visitable country. */
  private createHitArea(country: MapCountry): SVGCircleElement | null {
    const bounds = this.boundsOf(country);
    if (!bounds) {
      return null;
    }
    const radius = Math.hypot(bounds.width, bounds.height) / 2;
    if (radius >= SMALL_COUNTRY_RADIUS) {
      return null;
    }
    const circle = document.createElementNS(SVG_NAMESPACE, 'circle');
    circle.setAttribute('class', 'map-hit-area');
    circle.setAttribute('cx', `${bounds.x + bounds.width / 2}`);
    circle.setAttribute('cy', `${bounds.y + bounds.height / 2}`);
    circle.setAttribute('fill', '#000');
    circle.setAttribute('fill-opacity', '0');
    circle.setAttribute('pointer-events', 'all');
    // A mouse shortcut only: the keyboard reaches the country itself.
    circle.setAttribute('aria-hidden', 'true');
    circle.style.cursor = 'pointer';
    this.hitAreas.push({ circle, radius });
    return circle;
  }

  /** Keeps hit areas at least HIT_AREA_MIN_RADIUS_PX wide on screen, whatever the zoom. */
  private updateHitAreas(): void {
    const scale = this.view?.scale;
    if (!scale) {
      return;
    }
    for (const { circle, radius } of this.hitAreas) {
      circle.setAttribute(
        'r',
        `${Math.max(radius, HIT_AREA_MIN_RADIUS_PX / scale)}`,
      );
    }
  }

  /**
   * Places the hover callout beside the hovered country: on its right when
   * there is room before the zoom controls, otherwise on its left.
   */
  private updateCallout(): void {
    const bounds =
      this.hoveredCountry !== null ? this.boundsOf(this.hoveredCountry) : null;
    if (!bounds || this.view === null) {
      this.callout = null;
      return;
    }

    const { left, top, width, height } = this.viewportSize();
    const middleY = bounds.y + bounds.height / 2;
    const rightEdge = this.toScreen(bounds.x + bounds.width, middleY);
    const leftEdge = this.toScreen(bounds.x, middleY);
    const fitsRight =
      rightEdge.x - left + CALLOUT_LINE_PX + CALLOUT_BUBBLE_PX <=
      width - CONTROLS_RESERVED_PX;

    this.callout = {
      side: fitsRight ? 'right' : 'left',
      x: fitsRight ? rightEdge.x : leftEdge.x,
      y: Math.min(
        top + height - CALLOUT_EDGE_MARGIN_PX,
        Math.max(top + CALLOUT_EDGE_MARGIN_PX, rightEdge.y),
      ),
    };
  }

  private clearHover(): void {
    for (const element of this.countryElements.values()) {
      element.classList.remove('country-hovered');
    }
    this.hoveredCountry = null;
    this.callout = null;
  }

  private showGuideMessage(message: string): void {
    this.guideMessage = message;
    if (this.guideTimer !== null) {
      clearTimeout(this.guideTimer);
    }
    this.guideTimer = setTimeout(() => {
      this.guideTimer = null;
      this.updateView(() => (this.guideMessage = GUIDE_MESSAGE_DEFAULT));
    }, GUIDE_MESSAGE_DURATION_MS);
  }

  private animateTo(target: MapView): void {
    const from = this.view;
    if (from === null) {
      return;
    }
    this.cancelAnimation();
    const to = this.clampView(target);
    this.targetView = to;
    this.changeDetector.markForCheck();

    const reduceMotion =
      typeof matchMedia !== 'function' ||
      typeof requestAnimationFrame !== 'function' ||
      matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      this.applyView(to);
      this.targetView = null;
      return;
    }

    const start = performance.now();
    const step = (now: number): void => {
      const progress = Math.min(1, (now - start) / VIEW_ANIMATION_MS);
      const eased = easeInOutCubic(progress);
      this.applyView({
        cx: from.cx + (to.cx - from.cx) * eased,
        cy: from.cy + (to.cy - from.cy) * eased,
        // Interpolating the scale geometrically keeps the zoom speed even.
        scale: from.scale * (to.scale / from.scale) ** eased,
      });
      if (progress < 1) {
        this.animationFrame = requestAnimationFrame(step);
      } else {
        this.animationFrame = null;
        this.targetView = null;
      }
    };
    this.animationFrame = requestAnimationFrame(step);
  }

  private cancelAnimation(): void {
    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    this.targetView = null;
  }

  private observeResize(): void {
    if (this.resizeObserver || typeof ResizeObserver !== 'function') {
      return;
    }
    this.resizeObserver = new ResizeObserver(() => {
      this.viewport = null;
      // A running animation redraws on its next frame: applying the view here
      // would make it jump to its target, then back.
      if (this.view && this.animationFrame === null) {
        this.applyView(this.view);
        this.changeDetector.markForCheck();
      }
    });
    this.resizeObserver.observe(this.mapContainer.nativeElement);
  }

  private openCountryPreview(country: MapCountry): void {
    const element = this.countryElements.get(country);
    if (!element) {
      return;
    }
    this.clearHover();
    this.previewMapError = false;
    this.previewViewBox = null;

    const bounds = this.boundsOf(country);
    if (bounds) {
      const padding = Math.max(bounds.width, bounds.height) * 0.12;
      this.previewViewBox = `${bounds.x - padding} ${bounds.y - padding} ${bounds.width + padding * 2} ${bounds.height + padding * 2}`;
    } else {
      this.reportPreviewMapError(
        `The preview map has no visible shape for ${element.id}.`,
      );
    }

    this.previewOrigin = element;
    this.previewCountry = country;
    this.setCountryTabStops(false);
  }

  private resetPreview(): void {
    this.previewCountry = null;
    this.previewMapError = false;
    this.previewViewBox = null;
    this.previewOrigin = null;
    this.setCountryTabStops(this.isExploring);
  }

  /** Draws a zoomed copy of the selected country alone. */
  private renderPreviewMap(container: HTMLElement): void {
    const country = this.previewCountry;
    const element = country !== null ? this.countryElements.get(country) : null;
    if (!element || !this.previewViewBox) {
      return;
    }

    const shape = element.cloneNode(true) as SVGGraphicsElement;
    for (const node of [shape, ...shape.querySelectorAll('*')]) {
      for (const attribute of INTERACTIVE_ATTRIBUTES) {
        node.removeAttribute(attribute);
      }
    }
    const preview = document.createElementNS(SVG_NAMESPACE, 'svg');
    preview.setAttribute('viewBox', this.previewViewBox);
    preview.setAttribute('aria-hidden', 'true');
    preview.setAttribute('focusable', 'false');
    preview.appendChild(shape);
    container.replaceChildren(preview);
  }

  /** Only the countries themselves are tab stops (never their hit areas). */
  private setCountryTabStops(isFocusable: boolean): void {
    for (const element of this.countryElements.values()) {
      element.setAttribute('tabindex', isFocusable ? '0' : '-1');
    }
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
    this.labelSubscriptions.unsubscribe();
    this.labelSubscriptions = new Subscription();
    this.countryElements.clear();
    this.countryBounds.clear();
    this.hitAreas.length = 0;
    this.pins = [];
    if (this.mapSvg && this.rootClickListener) {
      this.mapSvg.removeEventListener('click', this.rootClickListener);
    }
    this.rootClickListener = null;
  }
}
