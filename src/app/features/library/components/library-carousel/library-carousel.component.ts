import { Component, input, signal, viewChild, ElementRef, afterNextRender } from '@angular/core';
import { Tale } from '../../../../models/interfaces/tale.interface';
import { TaleCardComponent } from '../../../../shared/components/tale-card/tale-card.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import EmblaCarousel, { EmblaCarouselType } from 'embla-carousel';

@Component({
  imports: [TaleCardComponent, IconComponent],
  selector: 'app-library-carousel',
  styleUrl: './library-carousel.component.scss',
  templateUrl: './library-carousel.component.html',
})
export class LibraryCarouselComponent {
  readonly tales = input.required<Tale[]>();
  protected readonly selectedIndex = signal(1);

  private emblaApi?: EmblaCarouselType;

  private readonly viewport = viewChild.required<ElementRef<HTMLElement>>('viewport');

  constructor() {
    afterNextRender(() => {
      this.emblaApi = EmblaCarousel(this.viewport().nativeElement, {
        align: 'center',
        containScroll: false,
        loop: false,
        slidesToScroll: 1,
        startIndex: 1,
        duration: 30,
      });

      this.selectedIndex.set(this.emblaApi.selectedScrollSnap());

      this.emblaApi.on('select', this.onSelect);
    });
  }

  protected previous(): void {
    this.emblaApi?.scrollPrev();
  }

  protected next(): void {
    this.emblaApi?.scrollNext();
  }

  private readonly onSelect = (): void => {
    if (!this.emblaApi) {
      return;
    }

    this.selectedIndex.set(this.emblaApi.selectedScrollSnap());
  };

  ngOnDestroy(): void {
    this.emblaApi?.destroy();
  }
}
