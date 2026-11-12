import { Component, computed, effect, inject, input, signal, Signal, WritableSignal, InputSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '@ngx-translate/core';
import { ArtGalleryCountryEnum } from '../../art-gallery-country-enum';
import { ArtGalleryHotspotModel } from '../../models/art-gallery-hotspot-model';
import { ArtGalleryService } from '../../art-gallery-service';
import {ArtGalleryHotspotService} from '../../art-gallery-hotspot-service';

@Component({
  imports: [TranslatePipe],
  selector: 'app-art-gallery-hotspot-component',
  styleUrl: './art-gallery-hotspot-component.scss',
  templateUrl: './art-gallery-hotspot-component.html',
})
export class ArtGalleryHotspotComponent {
  private readonly artGalleryService: ArtGalleryService;
  private readonly artGalleryHotspotService: ArtGalleryHotspotService;

  readonly id: InputSignal<number> = input.required<number>();
  readonly positionLeft: InputSignal<number> = input.required<number>();
  readonly positionTop: InputSignal<number> = input.required<number>();
  
  name: WritableSignal<string | undefined>;
  imageUrl: WritableSignal<string | undefined>;
  text: WritableSignal<string | undefined>;

  readonly detailsId: Signal<string>;
  readonly isOpened: WritableSignal<boolean>;

  constructor() {
    this.artGalleryService = inject(ArtGalleryService);
    this.artGalleryHotspotService = inject(ArtGalleryHotspotService);

    this.name = signal(undefined);
    this.imageUrl = signal(undefined);
    this.text = signal(undefined);
    
    this.detailsId = computed(
      () => `hotspot-details-${this.artGalleryService.getCurrentCountry()}-${this.id()}`,
    );

    effect(() =>
      this.artGalleryHotspotService.getHotspot(this.artGalleryService.getCurrentCountry(), this.id()).then((serviceResult: ArtGalleryHotspotModel | undefined) => {
        this.name.set(serviceResult?.name);
        this.imageUrl.set(serviceResult?.uri);
        this.text.set(serviceResult?.text);
      })
    );
    
    this.isOpened = signal(false);
  }
  
  display(): void {
    this.isOpened.update((isOpened) => !isOpened);
  }

  close(): void {
    this.isOpened.set(false);
  }
}
