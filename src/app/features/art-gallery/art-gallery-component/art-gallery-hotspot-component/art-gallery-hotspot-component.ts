import { Component, computed, inject, input, Signal, signal, WritableSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '@ngx-translate/core';
import { ArtGalleryCountryEnum } from '../../art-gallery-country-enum';
import { ArtGalleryService } from '../../art-gallery-service';

@Component({
  imports: [TranslatePipe],
  selector: 'app-art-gallery-hotspot-component',
  styleUrl: './art-gallery-hotspot-component.scss',
  templateUrl: './art-gallery-hotspot-component.html',
})
export class ArtGalleryHotspotComponent {
  readonly hotspotId = input.required<string>();
  // Données provisoires, fournies directement par le composant parent.
  readonly imageUrl = input.required<string>();
  readonly text = input.required<string>();
  readonly x = input.required<number>();
  readonly y = input.required<number>();

  readonly currentCountry: Signal<ArtGalleryCountryEnum>;
  readonly detailsId: Signal<string>;
  readonly isOpened: WritableSignal<boolean>;

  constructor() {
    const artGalleryService = inject(ArtGalleryService);
    this.currentCountry = toSignal(artGalleryService.currentCountryObservable, {
      initialValue: ArtGalleryCountryEnum.WORLD,
    });
    this.detailsId = computed(
      () => `hotspot-details-${this.currentCountry()}-${this.hotspotId()}`,
    );
    this.isOpened = signal(false);
  }

  toggle(): void {
    this.isOpened.update((isOpened) => !isOpened);
  }

  close(): void {
    this.isOpened.set(false);
  }
}
