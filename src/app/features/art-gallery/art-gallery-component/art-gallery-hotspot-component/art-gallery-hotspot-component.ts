import { Component, computed, inject, input, Signal, signal, WritableSignal, InputSignal } from '@angular/core';
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
  imageUrl: WritableSignal<string | undefined>;
  text: WritableSignal<string | undefined>;

  readonly detailsId: Signal<string>;
  readonly isOpened: WritableSignal<boolean>;

  constructor() {
    this.artGalleryService = inject(ArtGalleryService);
    this.artGalleryHotspotService = inject(ArtGalleryHotspotService);

    this.imageUrl = signal(undefined);
    this.text = signal(undefined);
    
    this.detailsId = computed(
      () => `hotspot-details-${this.artGalleryService.getCurrentCountry()}-${this.id()}`,
    );
    
    this.isOpened = signal(false);
  }
  
  async display(): Promise<void> {
    this.isOpened.update((isOpened) => !isOpened);
    let serviceResult: ArtGalleryHotspotModel | undefined = await this.artGalleryHotspotService.getHotspot(this.artGalleryService.getCurrentCountry(), this.id());
    
    this.imageUrl.set(serviceResult?.uri);
    this.text.set(serviceResult?.text);
  }

  close(): void {
    this.isOpened.set(false);
  }
}
