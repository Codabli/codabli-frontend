import { Component, DestroyRef, ElementRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ButtonComponent } from '@shared/components/button/button.component';
import { Modal } from '@shared/components/modal/modal.component';
import { ClassResourceFileStore } from '@core/services/class-resource-file-store.service';
import { CreateDancedTaleDraftService } from '@core/services/create-danced-tale-draft.service';
import { LanguageService } from '@core/services/language.service';
import { ClassResource, ClassResourceKind } from '@models/interfaces/tale-class-resources.interface';
import { newId } from '../new-id';
import {
  ACCEPTED_FORMATS,
  ACCEPT_ATTRIBUTE,
  FileRejection,
  checkFile,
  isYouTube,
  nameFromFile,
  parseLink,
} from './class-resource-files';

export const CLASS_RESOURCE_NAME_MAX_LENGTH = 100;

/** Fichier refusé au dépôt, avec la raison affichée. */
interface RejectedFile {
  fileName: string;
  reason: FileRejection | 'storage';
}

const KIND_ICONS: Record<ClassResourceKind, string> = {
  pdf: 'fa-solid fa-file-pdf',
  image: 'fa-solid fa-image',
  audio: 'fa-solid fa-headphones',
  video: 'fa-solid fa-film',
  link: 'fa-solid fa-link',
};

/**
 * Écran 4 du parcours « Créer mon conte dansé » (SCRUM-89) : dépôt des ressources propres
 * à la classe (documents, dessins scannés, photos, enregistrements) et ajout de liens.
 * Les créations sont privées par défaut ; chaque dépôt exige l'attestation des droits d'utilisation.
 */
@Component({
  imports: [ReactiveFormsModule, TranslatePipe, ButtonComponent, Modal],
  selector: 'app-tale-class-resources',
  styleUrl: './tale-class-resources.component.scss',
  templateUrl: './tale-class-resources.component.html',
})
export class TaleClassResourcesComponent {
  private readonly draftService = inject(CreateDancedTaleDraftService);
  private readonly store = inject(ClassResourceFileStore);
  private readonly translate = inject(TranslateService);
  private readonly language = inject(LanguageService).currentLanguage;
  private readonly sanitizer = inject(DomSanitizer);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly accept = ACCEPT_ATTRIBUTE;
  protected readonly formats = ACCEPTED_FORMATS;
  protected readonly nameMaxLength = CLASS_RESOURCE_NAME_MAX_LENGTH;

  protected readonly items = signal<ClassResource[]>(this.draftService.classResources()?.items ?? []);
  protected readonly fileCount = computed(() => this.items().filter((item) => item.kind !== 'link').length);
  protected readonly linkCount = computed(() => this.items().filter((item) => item.kind === 'link').length);

  /** Attestation des droits : obligatoire avant tout dépôt de fichier. */
  protected readonly rightsConfirmed = new FormControl(false, { nonNullable: true });
  protected readonly rightsError = signal(false);
  protected readonly rejected = signal<RejectedFile[]>([]);
  protected readonly dragging = signal(false);
  protected readonly storageFull = signal(false);

  protected readonly linkForm = new FormGroup({
    url: new FormControl('', { nonNullable: true }),
    name: new FormControl('', { nonNullable: true }),
  });
  protected readonly linkError = signal(false);

  protected readonly renamingId = signal<string | null>(null);
  protected readonly previewed = signal<ClassResource | null>(null);
  protected readonly deleting = signal<ClassResource | null>(null);
  protected readonly announcement = signal('');

  /** Adresse de chaque fichier chargé depuis IndexedDB. */
  protected readonly urls = signal<Record<string, string>>({});
  /** Fichiers introuvables sur cet appareil (déposés depuis un autre navigateur, données effacées...). */
  protected readonly missing = signal<ReadonlySet<string>>(new Set());
  private readonly objectUrls = new Set<string>();

  constructor() {
    for (const item of this.items()) {
      if (item.fileId) {
        void this.load(item.fileId);
      }
    }

    this.rightsConfirmed.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((confirmed) => confirmed && this.rightsError.set(false));
    inject(DestroyRef).onDestroy(() => this.objectUrls.forEach((url) => URL.revokeObjectURL(url)));
  }

  protected kindIcon(item: ClassResource): string {
    return item.kind === 'link' && item.url && isYouTube(item.url) ? 'fa-brands fa-youtube' : KIND_ICONS[item.kind];
  }

  protected maxSizeMb(maxSize: number): number {
    return maxSize / (1024 * 1024);
  }

  protected formatSize(size = 0): string {
    const megabytes = size / (1024 * 1024);
    const value = megabytes >= 1 ? megabytes : size / 1024;
    const number = new Intl.NumberFormat(this.language(), { maximumFractionDigits: 1 }).format(value);

    return this.translate.instant(`createDancedTale.classResources.size.${megabytes >= 1 ? 'mb' : 'kb'}`, {
      value: number,
    });
  }

  protected hostOf(url = ''): string {
    return parseLink(url)?.hostname.replace(/^www\./, '') ?? url;
  }

  // ---------- Dépôt de fichiers ----------

  protected onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    // Permet de choisir à nouveau les mêmes fichiers.
    input.value = '';
    void this.addFiles(files);
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(true);
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(false);
    void this.addFiles(Array.from(event.dataTransfer?.files ?? []));
  }

  private async addFiles(files: File[]): Promise<void> {
    if (!files.length) {
      return;
    }

    if (!this.rightsConfirmed.value) {
      this.rightsError.set(true);
      this.focus('#class-resources-rights');
      return;
    }

    const rejected: RejectedFile[] = [];
    const added: ClassResource[] = [];

    for (const file of files) {
      const check = checkFile(file);

      if ('rejection' in check) {
        rejected.push({ fileName: file.name, reason: check.rejection });
        continue;
      }

      const fileId = newId();
      try {
        await this.store.put(fileId, file);
      } catch {
        rejected.push({ fileName: file.name, reason: 'storage' });
        continue;
      }

      this.setUrl(fileId, file);
      added.push({
        id: newId(),
        kind: check.kind,
        name: nameFromFile(file.name).slice(0, CLASS_RESOURCE_NAME_MAX_LENGTH),
        addedAt: new Date().toISOString(),
        visibility: 'private',
        fileId,
        fileName: file.name,
        mimeType: file.type,
        size: file.size,
        rightsConfirmed: true,
      });
    }

    this.rejected.set(rejected);

    if (added.length) {
      this.save([...this.items(), ...added]);
      this.announce('filesAdded', { count: added.length });
    }
  }

  // ---------- Liens ----------

  protected addLink(): void {
    const { url: value, name } = this.linkForm.getRawValue();
    const url = parseLink(value);

    if (!url) {
      this.linkError.set(true);
      this.focus('#class-resources-link-url');
      return;
    }

    const item: ClassResource = {
      id: newId(),
      kind: 'link',
      name: (name.trim() || url.hostname.replace(/^www\./, '')).slice(0, CLASS_RESOURCE_NAME_MAX_LENGTH),
      addedAt: new Date().toISOString(),
      visibility: 'private',
      url: url.href,
    };

    this.linkError.set(false);
    this.linkForm.reset();
    this.save([...this.items(), item]);
    this.announce('linkAdded', { name: item.name });
  }

  // ---------- Liste : renommage, suppression ----------

  protected startRename(item: ClassResource): void {
    this.renamingId.set(item.id);
    this.focus(`#rename-${item.id}`);
  }

  /** Entrée ou sortie du champ : enregistre le nouveau nom (un nom vide garde l'ancien). */
  protected confirmRename(item: ClassResource, value: string): void {
    if (this.renamingId() !== item.id) {
      return;
    }

    const name = value.trim().slice(0, CLASS_RESOURCE_NAME_MAX_LENGTH);
    this.renamingId.set(null);

    if (name && name !== item.name) {
      this.save(this.items().map((other) => (other.id === item.id ? { ...other, name } : other)));
      this.announce('renamed', { name });
    }

    this.focus(`#rename-button-${item.id}`);
  }

  protected cancelRename(item: ClassResource): void {
    this.renamingId.set(null);
    this.focus(`#rename-button-${item.id}`);
  }

  protected confirmDelete(): void {
    const item = this.deleting();
    if (!item) {
      return;
    }

    this.deleting.set(null);
    this.save(this.items().filter((other) => other.id !== item.id));
    if (item.fileId) {
      void this.store.delete(item.fileId).catch(() => undefined);
    }
    this.announce('deleted', { name: item.name });
    // La carte supprimée disparaît : le focus revient sur la zone de dépôt.
    this.focus('#class-resources-file');
  }

  /** Aperçu d'un PDF : adresse locale (blob:) du fichier, autorisée explicitement pour l'iframe. */
  protected pdfUrl(item: ClassResource): SafeResourceUrl | null {
    const url = item.fileId ? this.urls()[item.fileId] : undefined;
    return url ? this.sanitizer.bypassSecurityTrustResourceUrl(url) : null;
  }

  protected onPrevious(): void {
    this.router.navigate(['../resources'], { relativeTo: this.route });
  }

  protected onNext(): void {
    this.router.navigate(['../universe'], { relativeTo: this.route });
  }

  private save(items: ClassResource[]): void {
    this.items.set(items);
    this.storageFull.set(!this.draftService.saveClassResources({ items }));
  }

  private announce(key: string, params: Record<string, unknown>): void {
    this.announcement.set(this.translate.instant(`createDancedTale.classResources.announce.${key}`, params));
  }

  private async load(fileId: string): Promise<void> {
    let blob: Blob | undefined;

    try {
      blob = await this.store.get(fileId);
    } catch {
      // Stockage indisponible : le fichier est signalé comme absent de cet appareil.
    }

    if (blob) {
      this.setUrl(fileId, blob);
    } else {
      this.missing.update((missing) => new Set(missing).add(fileId));
    }
  }

  private setUrl(fileId: string, blob: Blob): void {
    const url = URL.createObjectURL(blob);
    this.objectUrls.add(url);
    this.urls.update((urls) => ({ ...urls, [fileId]: url }));
  }

  private focus(selector: string): void {
    setTimeout(() => this.host.nativeElement.querySelector<HTMLElement>(selector)?.focus());
  }
}
