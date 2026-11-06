import {
  Component,
  computed,
  input,
  linkedSignal,
  signal,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import {
  NgxExtendedPdfViewerModule,
  PdfLoadedEvent,
} from 'ngx-extended-pdf-viewer';
import { ButtonComponent } from '@shared/components/button/button.component';

// Zoom du viewer en pourcentage (100 = taille réelle)
const ZOOM_STEP = 25;
const ZOOM_MIN = 50;
const ZOOM_MAX = 300;
const ZOOM_DEFAULT = 100;

@Component({
  imports: [NgxExtendedPdfViewerModule, ButtonComponent, TranslatePipe],
  selector: 'app-pdf-reader',
  styleUrl: './pdf-reader.component.scss',
  templateUrl: './pdf-reader.component.html',
})
export class PdfReaderComponent {
  // URL ou Blob du document
  readonly src = input<string | Blob>();

  // Échec du chargement du document en amont (ex. requête HTTP en erreur)
  readonly failed = input(false);

  // État du lecteur, réinitialisé à chaque nouveau document
  readonly currentPage = linkedSignal({
    source: this.src,
    computation: () => 1,
  });
  readonly totalPages = linkedSignal({
    source: this.src,
    computation: () => 0,
  });
  readonly loading = linkedSignal({
    source: this.src,
    computation: () => true,
  });
  readonly hasError = linkedSignal({
    source: () => ({ src: this.src(), failed: this.failed() }),
    computation: ({ failed }) => failed,
  });
  readonly zoom = signal<number | 'page-fit'>('page-fit');

  // Navigation
  readonly canGoPrevious = computed(() => this.currentPage() > 1);

  readonly canGoNext = computed(() => this.currentPage() < this.totalPages());

  // Zoom
  readonly canZoomOut = computed(() => this.zoomPercent() > ZOOM_MIN);

  readonly canZoomIn = computed(() => this.zoomPercent() < ZOOM_MAX);

  private readonly zoomPercent = computed(() => {
    const zoom = this.zoom();
    return zoom === 'page-fit' ? ZOOM_DEFAULT : zoom;
  });

  onPdfLoaded(event: PdfLoadedEvent): void {
    this.totalPages.set(event.pagesCount);
    this.currentPage.set(1);
    this.loading.set(false);
    this.hasError.set(false);
  }

  onPdfError(): void {
    this.loading.set(false);
    this.hasError.set(true);
  }

  onPageChange(page: number | undefined): void {
    if (page) {
      this.currentPage.set(page);
    }
  }

  previousPage(): void {
    if (this.canGoPrevious()) {
      this.currentPage.update((page) => page - 1);
    }
  }

  nextPage(): void {
    if (this.canGoNext()) {
      this.currentPage.update((page) => page + 1);
    }
  }

  zoomIn(): void {
    this.zoom.set(Math.min(this.zoomPercent() + ZOOM_STEP, ZOOM_MAX));
  }

  zoomOut(): void {
    this.zoom.set(Math.max(this.zoomPercent() - ZOOM_STEP, ZOOM_MIN));
  }

  resetZoom(): void {
    this.zoom.set('page-fit');
  }
}

