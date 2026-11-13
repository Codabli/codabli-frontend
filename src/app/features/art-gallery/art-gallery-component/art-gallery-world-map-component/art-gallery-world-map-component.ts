import { Component, NgZone, OnDestroy, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslatePipe } from '@ngx-translate/core';
import { ArtGalleryConstants } from '../../art-gallery-constants';
import { ArtGalleryCountryEnum } from '../../art-gallery-country-enum';
import { ArtGalleryService } from '../../art-gallery-service';

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

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

@Component({
  imports: [TranslatePipe],
  selector: 'app-art-gallery-world-map-component',
  styleUrl: './art-gallery-world-map-component.scss',
  templateUrl: './art-gallery-world-map-component.html',
})
export class ArtGalleryWorldMapComponent implements OnDestroy {
  private readonly sanitizer = inject(DomSanitizer);
  readonly mapAssetUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
    '/assets/images/art-gallery/World_map_svgo.svg',
  );
  mapLoadError = false;

  private readonly service = inject(ArtGalleryService);
  private readonly ngZone = inject(NgZone);
  private readonly countryListeners: Array<{
    element: Element;
    click: EventListener;
    keydown: EventListener;
  }> = [];

  onMapLoad(svgDocument: Document | null): void {
    this.removeCountryListeners();
    this.mapLoadError = false;

    const svgRoot = svgDocument?.documentElement;
    if (!svgRoot || svgRoot.localName !== 'svg') {
      this.reportMapError('The world map SVG could not be read.');
      return;
    }

    const countryTargets: Array<{
      country: ArtGalleryCountryEnum;
      element: Element;
    }> = [];

    for (const country of ArtGalleryConstants.VISITABLE_COUNTRIES) {
      if (!isMapCountry(country)) {
        this.reportMapError(`The map cannot navigate to country ${country}.`);
        return;
      }

      const svgCode = COUNTRY_SVG_CODE_BY_ENUM[country];
      const element = svgDocument.getElementById(`country-${svgCode}`);

      if (!element) {
        this.reportMapError(`The world map is missing country-${svgCode}.`);
        return;
      }

      countryTargets.push({ country, element });
    }

    const style = svgDocument.createElementNS(SVG_NAMESPACE, 'style');
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
      element.setAttribute('tabindex', '0');
      element.setAttribute('aria-label', countryLabel);
      element.setAttribute('aria-keyshortcuts', 'Enter Space');

      const activateCountry = (): void => {
        this.ngZone.run(() => this.service.goTo(country));
      };
      const onClick: EventListener = () => activateCountry();
      const onKeydown: EventListener = (event) => {
        const key = (event as KeyboardEvent).key;
        if (key === 'Enter' || key === ' ') {
          event.preventDefault();
          activateCountry();
        }
      };

      element.addEventListener('click', onClick);
      element.addEventListener('keydown', onKeydown);
      this.countryListeners.push({
        element,
        click: onClick,
        keydown: onKeydown,
      });
    }
  }

  onMapError(): void {
    this.reportMapError('The world map SVG failed to load.');
  }

  ngOnDestroy(): void {
    this.removeCountryListeners();
  }

  private reportMapError(message: string): void {
    console.error(message);
    this.mapLoadError = true;
  }

  private removeCountryListeners(): void {
    for (const { element, click, keydown } of this.countryListeners) {
      element.removeEventListener('click', click);
      element.removeEventListener('keydown', keydown);
    }
    this.countryListeners.length = 0;
  }
}
