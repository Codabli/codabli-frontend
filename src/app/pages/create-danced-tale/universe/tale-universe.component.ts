import { Component, ElementRef, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Button } from '../../../shared/components/button/button.component';
import { CreateDancedTaleDraftService } from '../../../core/services/create-danced-tale-draft.service';
import {
  ImageResizeError,
  ImageResizeErrorKind,
  ImageResizeService,
} from '../../../core/services/image-resize.service';
import {
  UNIVERSE_SECTIONS,
  UniverseSection,
} from '../../../models/interfaces/tale-universe.interface';
import {
  CARD_NAME_MAX_LENGTH,
  CARD_ROLE_MAX_LENGTH,
  CARD_TEXT_MAX_LENGTH,
  TaleUniverseForm,
  UniverseCardForm,
} from './tale-universe.form';

type CardField = 'name' | 'description' | 'role' | 'goal';

const SECTION_ICONS: Record<UniverseSection, string> = {
  places: 'fa-mountain-sun',
  characters: 'fa-user-group',
  periods: 'fa-hourglass-half',
  objects: 'fa-key',
};

// Suggestions de rôles, la saisie reste libre.
const ROLE_SUGGESTION_KEYS = ['hero', 'ally', 'opponent', 'mentor', 'secondary'] as const;

@Component({
  imports: [ReactiveFormsModule, TranslatePipe, Button],
  selector: 'app-tale-universe',
  styleUrl: './tale-universe.component.scss',
  templateUrl: './tale-universe.component.html',
})
export class TaleUniverseComponent {
  private readonly draftService = inject(CreateDancedTaleDraftService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly imageResize = inject(ImageResizeService);

  protected readonly sections = UNIVERSE_SECTIONS;
  protected readonly sectionIcons = SECTION_ICONS;
  protected readonly roleSuggestionKeys = ROLE_SUGGESTION_KEYS;
  protected readonly nameMaxLength = CARD_NAME_MAX_LENGTH;
  protected readonly roleMaxLength = CARD_ROLE_MAX_LENGTH;
  protected readonly textMaxLength = CARD_TEXT_MAX_LENGTH;

  protected readonly theme = this.draftService.context()?.theme ?? '';
  protected readonly form = new TaleUniverseForm();
  protected readonly submitted = signal(false);
  protected readonly storageFull = signal(false);

  /** Erreur d'image par identifiant de carte. */
  protected readonly imageErrors = signal<Record<string, ImageResizeErrorKind>>({});

  constructor() {
    const savedUniverse = this.draftService.universe();

    if (savedUniverse) {
      this.form.fromTaleUniverse(savedUniverse);
    }

    this.form.addDefaultCards();
  }

  protected cards(section: UniverseSection): UniverseCardForm[] {
    return this.form.controls[section].controls;
  }

  protected fieldId(card: UniverseCardForm, field: CardField | 'image'): string {
    return `card-${card.controls.id.value}-${field}`;
  }

  protected hasError(card: UniverseCardForm, field: CardField): boolean {
    const control = card.controls[field];
    return control.invalid && (control.touched || this.submitted());
  }

  protected describedBy(card: UniverseCardForm, field: CardField): string | null {
    return this.hasError(card, field) ? `${this.fieldId(card, field)}-error` : null;
  }

  protected addCard(section: UniverseSection): void {
    const card = this.form.addCard(section);
    this.focus(`#${this.fieldId(card, 'name')}`);
  }

  protected removeCard(section: UniverseSection, index: number): void {
    const cardId = this.cards(section)[index].controls.id.value;
    this.form.removeCard(section, index);
    this.imageErrors.update(({ [cardId]: _, ...others }) => others);

    // Le bouton supprimé disparaît : le focus revient sur l'ajout de la sous-section.
    this.focus(`#add-${section} button`);
  }

  protected async onImageSelected(card: UniverseCardForm, event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    // Permet de choisir à nouveau le même fichier.
    input.value = '';

    if (!file) {
      return;
    }

    const cardId = card.controls.id.value;

    try {
      card.controls.image.setValue(await this.imageResize.resize(file));
      this.imageErrors.update(({ [cardId]: _, ...others }) => others);
    } catch (error) {
      const kind = error instanceof ImageResizeError ? error.kind : 'unreadable';
      this.imageErrors.update((errors) => ({ ...errors, [cardId]: kind }));
    }
  }

  protected removeImage(card: UniverseCardForm): void {
    card.controls.image.setValue(null);
    this.focus(`#${this.fieldId(card, 'image')}`);
  }

  protected onPrevious(): void {
    // Le brouillon garde une saisie incomplète : rien n'est perdu en revenant en arrière.
    // Si rien n'a été saisi, on n'enregistre pas : les cartes par défaut reviendront.
    const universe = this.form.toTaleUniverse();
    const hasCards = Object.values(universe).some((cards) => cards.length);

    if (hasCards || this.draftService.universe()) {
      this.draftService.saveUniverse(universe);
    }

    this.router.navigate(['../discovery'], { relativeTo: this.route });
  }

  protected onNext(): void {
    this.submitted.set(true);

    // Une carte laissée vide n'est pas une erreur : elle est retirée.
    this.form.removeBlankCards();

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.focus('input.ng-invalid, textarea.ng-invalid');
      return;
    }

    if (!this.draftService.saveUniverse(this.form.toTaleUniverse())) {
      this.storageFull.set(true);
      this.focus('#storage-error');
      return;
    }

    this.storageFull.set(false);
    this.router.navigate(['../structure'], { relativeTo: this.route });
  }

  private focus(selector: string): void {
    // Après le rendu (nouvelle carte, messages d'erreur).
    setTimeout(() => {
      this.host.nativeElement.querySelector<HTMLElement>(selector)?.focus();
    });
  }
}
