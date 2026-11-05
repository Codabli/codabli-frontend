import { Component, computed, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ArtGalleryCountryEnum } from '../../art-gallery-country-enum';
import { ArtGalleryService } from '../../art-gallery-service';

@Component({
  imports: [],
  selector: 'app-art-gallery-hotspot-component',
  styleUrl: './art-gallery-hotspot-component.scss',
  templateUrl: './art-gallery-hotspot-component.html',
})
export class ArtGalleryHotspotComponent {
  readonly hotspotId = input.required<string>();
  readonly imageUrl = input.required<string>();
  readonly text = input.required<string>();
  readonly x = input.required<number>();
  readonly y = input.required<number>();

  private readonly artGalleryService = inject(ArtGalleryService);
  readonly currentCountry = toSignal(this.artGalleryService.currentCountryObservable, {
    initialValue: ArtGalleryCountryEnum.WORLD,
  });
  readonly detailsId = computed(
    () => `hotspot-details-${this.currentCountry()}-${this.hotspotId()}`,
  );
  readonly isOpen = signal(false);

  toggle(): void {
    this.isOpen.update((isOpen) => !isOpen);
  }
}
