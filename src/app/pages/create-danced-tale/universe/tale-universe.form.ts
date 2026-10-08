import { FormArray, FormControl, FormGroup } from '@angular/forms';
import {
  TaleCharacter,
  TaleUniverse,
  UniverseCard,
  UniverseSection,
} from '../../../models/interfaces/tale-universe.interface';
import { requiredText } from '../context/project-context.form';
import { newId } from '../new-id';

export const CARD_NAME_MAX_LENGTH = 60;
export const CARD_ROLE_MAX_LENGTH = 40;
export const CARD_TEXT_MAX_LENGTH = 500;

/**
 * Carte d'une sous-section. Tous les types de carte partagent les mêmes contrôles :
 * `role` et `goal` ne sont utilisés (et obligatoires) que pour les personnages (RG-CMC-08).
 */
export class UniverseCardForm extends FormGroup<{
  id: FormControl<string>;
  name: FormControl<string>;
  description: FormControl<string>;
  role: FormControl<string>;
  goal: FormControl<string>;
  image: FormControl<string | null>;
}> {
  constructor(
    readonly section: UniverseSection,
    card?: Partial<TaleCharacter>,
  ) {
    const isCharacter = section === 'characters';
    const characterOnly = isCharacter ? requiredText : [];

    super({
      id: new FormControl(card?.id ?? newId(), { nonNullable: true }),
      name: new FormControl(card?.name ?? '', { nonNullable: true, validators: requiredText }),
      description: new FormControl(card?.description ?? '', {
        nonNullable: true,
        validators: characterOnly,
      }),
      role: new FormControl(card?.role ?? '', { nonNullable: true, validators: characterOnly }),
      goal: new FormControl(card?.goal ?? '', { nonNullable: true, validators: characterOnly }),
      image: new FormControl<string | null>(card?.image ?? null),
    });
  }

  get isCharacter(): boolean {
    return this.section === 'characters';
  }

  /** Carte jamais remplie (ex. la carte proposée par défaut) : elle est ignorée. */
  get isBlank(): boolean {
    const { name, description, role, goal, image } = this.getRawValue();
    return !image && ![name, description, role, goal].some((text) => text.trim());
  }

  toCard(): UniverseCard {
    const value = this.getRawValue();

    return {
      id: value.id,
      name: value.name.trim(),
      description: value.description.trim(),
      image: value.image,
    };
  }

  toCharacter(): TaleCharacter {
    const value = this.getRawValue();

    return { ...this.toCard(), role: value.role.trim(), goal: value.goal.trim() };
  }
}

export class TaleUniverseForm extends FormGroup<Record<UniverseSection, FormArray<UniverseCardForm>>> {
  constructor() {
    super({
      places: new FormArray<UniverseCardForm>([]),
      characters: new FormArray<UniverseCardForm>([]),
      periods: new FormArray<UniverseCardForm>([]),
      objects: new FormArray<UniverseCardForm>([]),
    });
  }

  addCard(section: UniverseSection): UniverseCardForm {
    const card = new UniverseCardForm(section);
    this.controls[section].push(card);
    return card;
  }

  removeCard(section: UniverseSection, index: number): void {
    this.controls[section].removeAt(index);
  }

  /** Une carte vide dans chaque sous-section qui n'en a aucune (elle est ignorée si elle reste vide). */
  addDefaultCards(): void {
    for (const section of Object.keys(this.controls) as UniverseSection[]) {
      if (!this.controls[section].length) {
        this.addCard(section);
      }
    }
  }

  removeBlankCards(): void {
    for (const cards of Object.values(this.controls)) {
      for (let i = cards.length - 1; i >= 0; i--) {
        if (cards.at(i).isBlank) {
          cards.removeAt(i);
        }
      }
    }
  }

  fromTaleUniverse(universe: TaleUniverse): void {
    for (const section of Object.keys(this.controls) as UniverseSection[]) {
      const cards = this.controls[section];
      cards.clear();
      universe[section].forEach((card) => cards.push(new UniverseCardForm(section, card)));
    }
  }

  /**
   * Peut être appelé sur un formulaire invalide : le brouillon accepte une saisie incomplète.
   * Les cartes vides ne sont pas conservées.
   */
  toTaleUniverse(): TaleUniverse {
    const cards = (section: UniverseSection) =>
      this.controls[section].controls.filter((card) => !card.isBlank);

    return {
      places: cards('places').map((card) => card.toCard()),
      characters: cards('characters').map((card) => card.toCharacter()),
      periods: cards('periods').map((card) => card.toCard()),
      objects: cards('objects').map((card) => card.toCard()),
    };
  }
}
