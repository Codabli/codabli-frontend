import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import {
  getCenteredItemIndex,
  scrollToCenteredItem,
} from '../../../../shared/utils/centered-carousel';

@Component({
  imports: [ButtonComponent, TranslatePipe],
  selector: 'app-shop-preview',
  styleUrl: './shop-preview.component.scss',
  templateUrl: './shop-preview.component.html',
})
export class ShopPreviewComponent implements AfterViewInit, OnDestroy {
  @ViewChild('shopTrack') private shopTrack?: ElementRef<HTMLElement>;
  private scrollEndTimer?: ReturnType<typeof setTimeout>;
  private initialPositionObserver?: ResizeObserver;
  private initialPositionFrame?: number;

  private readonly products = [
    {
      nameKey: 'home.shop.productName',
      price: 5,
      image: '/assets/images/shop/bookmark_1.png',
      imageAltKey: 'home.shop.imageAlt.first',
    },
    {
      nameKey: 'home.shop.productName',
      price: 5,
      image: '/assets/images/shop/bookmark_2.png',
      imageAltKey: 'home.shop.imageAlt.second',
    },
    {
      nameKey: 'home.shop.productName',
      price: 5,
      image: '/assets/images/shop/bookmark_3.png',
      imageAltKey: 'home.shop.imageAlt.third',
    },
    {
      nameKey: 'home.shop.productName',
      price: 5,
      image: '/assets/images/shop/bookmark_4.png',
      imageAltKey: 'home.shop.imageAlt.fourth',
    },
  ];

  protected readonly originalProductCount = this.products.length;
  protected centeredProductIndex = this.products.length;
  protected readonly carouselProducts = [
    ...this.products,
    ...this.products,
    ...this.products,
  ];

  ngAfterViewInit(): void {
    const track = this.shopTrack?.nativeElement;
    if (!track) return;

    this.initialPositionObserver = new ResizeObserver(() => {
      const firstCard = track.querySelector<HTMLElement>('.shop-card');
      if (!track.clientWidth || !firstCard?.clientWidth) return;

      this.initialPositionObserver?.disconnect();
      this.initialPositionFrame = requestAnimationFrame(() => {
        this.scrollToProduct(this.products.length, true);
        this.centeredProductIndex = getCenteredItemIndex(track, '.shop-card');
      });
    });
    this.initialPositionObserver.observe(track);
  }

  ngOnDestroy(): void {
    if (this.scrollEndTimer) clearTimeout(this.scrollEndTimer);
    this.initialPositionObserver?.disconnect();
    if (this.initialPositionFrame !== undefined) {
      cancelAnimationFrame(this.initialPositionFrame);
    }
  }

  protected scrollProducts(direction: -1 | 1): void {
    const track = this.shopTrack?.nativeElement;
    if (!track) return;

    const currentIndex = getCenteredItemIndex(track, '.shop-card');
    this.scrollToProduct(currentIndex + direction);
  }

  protected onProductsScroll(): void {
    const track = this.shopTrack?.nativeElement;
    if (!track) return;

    this.centeredProductIndex = getCenteredItemIndex(track, '.shop-card');
    if (this.scrollEndTimer) clearTimeout(this.scrollEndTimer);
    this.scrollEndTimer = setTimeout(() => this.recenterProducts(), 250);
  }

  protected onProductsScrollEnd(): void {
    if (this.scrollEndTimer) clearTimeout(this.scrollEndTimer);
    this.recenterProducts();
  }

  protected isSideProduct(index: number): boolean {
    const activeProduct = this.centeredProductIndex % this.products.length;
    const productIndex = index % this.products.length;
    const distance = Math.abs(productIndex - activeProduct);
    return Math.min(distance, this.products.length - distance) > 1;
  }

  private scrollToProduct(index: number, instant = false): void {
    const track = this.shopTrack?.nativeElement;
    if (!track) return;
    scrollToCenteredItem(track, '.shop-card', index, instant);
  }

  private recenterProducts(): void {
    this.scrollEndTimer = undefined;
    const centeredIndex = this.centeredProductIndex;
    const count = this.products.length;

    if (centeredIndex < count) {
      this.centeredProductIndex = centeredIndex + count;
      this.scrollToProduct(this.centeredProductIndex, true);
    } else if (centeredIndex >= count * 2) {
      this.centeredProductIndex = centeredIndex - count;
      this.scrollToProduct(this.centeredProductIndex, true);
    }
  }
}
