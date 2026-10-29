import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ConteDanseService } from '@core/services/conte-danse.service';
import { ConteDanse } from '@models/interfaces/conte-danse.interface';
import { PageBannerComponent } from '@shared/components/page-banner/page-banner.component';
import { TaleDetailInfoComponent } from './components/tale-detail-info/tale-detail-info.component';
import { ConteDanseTraduction } from '@models/interfaces/conte-danse-traduction.model';
import { IconComponent } from '@shared/components/icon/icon.component';
import { TranslatePipe } from '@ngx-translate/core';
import { TaleDetailMediaComponent } from './components/tale-detail-media/tale-detail-media.component';

@Component({
  imports: [
    PageBannerComponent,
    TaleDetailInfoComponent,
    TaleDetailMediaComponent,
    IconComponent,
    TranslatePipe,
  ],
  selector: 'app-tale-detail',
  styleUrl: './tale-detail.component.scss',
  templateUrl: './tale-detail.component.html',
})
export class TaleDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private readonly conteDanseService = inject(ConteDanseService);

  protected readonly conte = signal<ConteDanse | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly traductions = signal<ConteDanseTraduction[]>([]);
  protected readonly selectedLanguage = signal<string | null>(null);

  protected readonly availableLanguages = computed(() => {
    const conte = this.conte();
    if (!conte) {
      return [];
    }
    return [
      ...new Set([
        conte.langueOriginale,
        ...this.traductions().map((traduction) => traduction.langue),
      ]),
    ];
  });

  ngOnInit(): void {
    // You can access route parameters here
    const taleId = this.route.snapshot.paramMap.get('id');
    if (!taleId) {
      this.error.set('Identifiant du conte introuvable.');
      this.isLoading.set(false);
      return;
    }

    this.conteDanseService.getById(taleId).subscribe({
      next: (conte) => {
        this.conte.set(conte);
        this.traductions.set(conte.traductions || []);
        this.selectedLanguage.set(conte.langueOriginale);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erreur lors du chargement du conte :', err);
        this.error.set('Impossible de charger ce conte.');
        this.isLoading.set(false);
      },
    });
  }

  protected onLanguageChange(language: string): void {
    this.selectedLanguage.set(language);
  }
}
