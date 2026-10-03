import { Component, ElementRef, ViewChild } from '@angular/core';
import { Button } from '../../../../shared/components/button/button.component';

@Component({
  imports: [Button],
  selector: 'app-news-carousel',
  styleUrl: './news-carousel.component.scss',
  templateUrl: './news-carousel.component.html',
})
export class NewsCarouselComponent {
  @ViewChild('newsTrack') private newsTrack?: ElementRef<HTMLElement>;

  protected readonly news = [
    {
      title: 'Les histoires prennent vie avec le Conte Dansé',
      date: 'Publiée le 10 septembre 2026',
      image: '/assets/images/news/Visuel.png',
    },
    {
      title: 'Place à l’imagination : inventez votre propre conte',
      date: 'Publiée le 25 janvier 2026',
      image: '/assets/images/Video.png',
    },
    {
      title: 'Des œuvres et des histoires à regarder autrement',
      date: 'Publiée le 23 mars 2026',
      image: '/assets/images/news/Visuel.png',
    },
    {
      title: 'Des idées pour faire vivre les histoires au quotidien',
      date: 'Publiée le 05 octobre 2026',
      image: '/assets/images/Video.png',
    },
  ];

  protected scrollNews(direction: -1 | 1): void {
    const track = this.newsTrack?.nativeElement;
    if (!track) return;

    const firstCard = track.querySelector<HTMLElement>('.news-card');
    const cardWidth = firstCard?.getBoundingClientRect().width ?? 0;
    const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;
    const maxScroll = track.scrollWidth - track.clientWidth;
    const atEnd = track.scrollLeft >= maxScroll - 1;
    const atStart = track.scrollLeft <= 1;

    if (direction > 0 && atEnd) {
      track.scrollTo({ left: 0 });
    } else if (direction < 0 && atStart) {
      track.scrollTo({ left: maxScroll });
    } else {
      track.scrollBy({
        left: direction * (cardWidth + gap),
      });
    }
  }
}
