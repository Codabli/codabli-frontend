import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Button } from '../../../../shared/components/button/button.component';
import {
  getCenteredItemIndex,
  scrollToCenteredItem,
} from '../../../../shared/utils/centered-carousel';

@Component({
  imports: [Button, TranslatePipe],
  selector: 'app-news-carousel',
  styleUrl: './news-carousel.component.scss',
  templateUrl: './news-carousel.component.html',
})
export class NewsCarouselComponent implements AfterViewInit {
  @ViewChild('newsTrack') private newsTrack?: ElementRef<HTMLElement>;

  private readonly news = [
    {
      titleKey: 'home.news.items.first.title',
      dateKey: 'home.news.items.first.date',
      image: '/assets/images/news/Visuel.png',
      imageWidth: 395,
      imageHeight: 219,
    },
    {
      titleKey: 'home.news.items.second.title',
      dateKey: 'home.news.items.second.date',
      image: '/assets/images/Video.png',
      imageWidth: 608,
      imageHeight: 342,
    },
    {
      titleKey: 'home.news.items.third.title',
      dateKey: 'home.news.items.third.date',
      image: '/assets/images/news/Visuel.png',
      imageWidth: 395,
      imageHeight: 219,
    },
    {
      titleKey: 'home.news.items.fourth.title',
      dateKey: 'home.news.items.fourth.date',
      image: '/assets/images/Video.png',
      imageWidth: 608,
      imageHeight: 342,
    },
  ];

  protected readonly originalNewsCount = this.news.length;
  protected readonly carouselNews = [...this.news, ...this.news, ...this.news];

  ngAfterViewInit(): void {
    this.scrollToCard(this.news.length, true);
  }

  protected scrollNews(direction: -1 | 1): void {
    const track = this.newsTrack?.nativeElement;
    if (!track) return;

    const currentIndex = getCenteredItemIndex(track, '.news-card');
    this.scrollToCard(currentIndex + direction);
  }

  protected onNewsScroll(): void {
    const track = this.newsTrack?.nativeElement;
    if (!track) return;

    const centeredIndex = getCenteredItemIndex(track, '.news-card');
    if (centeredIndex < this.news.length) {
      this.scrollToCard(centeredIndex + this.news.length, true);
    } else if (centeredIndex >= this.news.length * 2) {
      this.scrollToCard(centeredIndex - this.news.length, true);
    }
  }

  private scrollToCard(index: number, instant = false): void {
    const track = this.newsTrack?.nativeElement;
    if (!track) return;
    scrollToCenteredItem(track, '.news-card', index, instant);
  }
}
