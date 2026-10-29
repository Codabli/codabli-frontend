import { Component, computed, input, signal } from '@angular/core';
import { ConteDanse } from '@models/interfaces/conte-danse.interface';
import type { ConteDanseTraduction } from '@models/interfaces/conte-danse-traduction.model';
import { ButtonComponent } from '@shared/components/button/button.component';
import { TranslatePipe } from '@ngx-translate/core';
import { IconComponent } from '@shared/components/icon/icon.component';

type MediaMode = 'video' | 'audio' | 'resources' | 'text';

@Component({
  imports: [ButtonComponent, TranslatePipe, IconComponent],
  selector: 'app-tale-detail-media',
  styleUrl: './tale-detail-media.component.scss',
  templateUrl: './tale-detail-media.component.html',
})
export class TaleDetailMediaComponent {
  // Données reçues du composant parent
  readonly conte = input.required<ConteDanse>();
  readonly traductions = input<ConteDanseTraduction[]>([]);
  readonly selectedLanguage = input<string | null>(null);

  // Média sélectionné par l'utilisateur
  readonly activeMedia = signal<MediaMode>('video');

  // Langue à utiliser (originale par défaut)
  readonly currentLanguage = computed(
    () => this.selectedLanguage() ?? this.conte().langueOriginale,
  );

  // Vérifie si la langue sélectionnée est la langue originale
  readonly isOriginalLanguage = computed(
    () => this.currentLanguage() === this.conte().langueOriginale,
  );

  // Traduction correspondant à la langue sélectionnée
  readonly selectedTranslation = computed<ConteDanseTraduction | null>(() => {
    if (this.isOriginalLanguage()) {
      return null;
    }

    return (
      this.traductions().find(
        (translation) => translation.langue === this.currentLanguage(),
      ) ?? null
    );
  });

  // URL de la vidéo dans la langue sélectionnée
  readonly videoUrl = computed(() =>
    this.isOriginalLanguage()
      ? this.conte().fichierVideoUrl
      : (this.selectedTranslation()?.videoUrl ?? null),
  );

  // URL de l'audio dans la langue sélectionnée
  readonly audioUrl = computed(() =>
    this.isOriginalLanguage()
      ? this.conte().fichierAudioUrl
      : (this.selectedTranslation()?.audioUrl ?? null),
  );

  // URL du fichier texte original
  readonly textUrl = computed(() =>
    this.isOriginalLanguage() ? this.conte().fichierTexteUrl : null,
  );

  // Texte de la traduction
  readonly translatedText = computed(
    () => this.selectedTranslation()?.texte ?? null,
  );

  // Sous-titres de la traduction
  readonly subtitlesUrl = computed(
    () => this.selectedTranslation()?.sousTitresUrl ?? null,
  );

  // Disponibilité des différents médias
  readonly hasVideo = computed(() => !!this.videoUrl());

  readonly hasAudio = computed(() => !!this.audioUrl());

  readonly hasText = computed(
    () => !!this.textUrl() || !!this.translatedText(),
  );

  readonly hasResources = computed(() => true);

  // Changement du média affiché
  selectMedia(mode: MediaMode): void {
    this.activeMedia.set(mode);
  }

  // à modifier par le backend qui fournira l'url
  downloadText(url: string): void {
  const link = document.createElement('a');

  link.href = url;
  link.download = 'conte.txt';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
}
