import { CdkDrag, CdkDragEnd } from '@angular/cdk/drag-drop';
import { Component, ElementRef, computed, inject, input, output, signal, viewChild } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { StageElementKind, StagePlacement } from '../../../../models/interfaces/tale-staging.interface';

/** Élément à placer : un personnage présent dans la scène ou un de ses décors. */
export interface StageElement {
  kind: StageElementKind;
  ref: string;
  label: string;
}

type Row = 'back' | 'middle' | 'front';
type Column = 'left' | 'center' | 'right';

/** Les 9 zones du plateau, du fond vers le public, du côté jardin vers le côté cour. */
export const STAGE_ZONES = (['back', 'middle', 'front'] as Row[]).flatMap((row) =>
  (['left', 'center', 'right'] as Column[]).map((column) => `${row}-${column}`),
);

/** Pas de déplacement au clavier, en pourcentage du plateau. */
const KEYBOARD_STEP = 5;

// Couleurs des personnages : contraste d'au moins 4,5:1 avec les initiales blanches.
const CHARACTER_COLORS = ['#1f7a55', '#4b4bc4', '#a3480a', '#a8326a', '#16679a', '#6342d4'];

function clamp(value: number): number {
  return Math.min(96, Math.max(4, Math.round(value)));
}

/**
 * Limite du rideau, en pourcentage de la profondeur : l'avant-scène est la bande entre
 * le rideau et la rampe. Même valeur que .stage__curtain dans le SCSS.
 */
export const CURTAIN_LINE = 80;

/** Zone d'une position : fond (premier tiers), milieu, avant-scène (devant le rideau) ; jardin, centre, cour (tiers). */
export function zoneOf(x: number, y: number): string {
  const row: Row = y < 100 / 3 ? 'back' : y < CURTAIN_LINE ? 'middle' : 'front';
  const column: Column = x < 100 / 3 ? 'left' : x < 200 / 3 ? 'center' : 'right';
  return `${row}-${column}`;
}

/** Centre d'une zone, décalé pour ne pas superposer plusieurs éléments. */
function zoneCenter(zone: string, offset: number): { x: number; y: number } {
  const [row, column] = zone.split('-') as [Row, Column];
  const x = { left: 100 / 6, center: 50, right: 500 / 6 }[column];
  const y = { back: 100 / 6, middle: (100 / 3 + CURTAIN_LINE) / 2, front: (CURTAIN_LINE + 100) / 2 }[row];
  // L'avant-scène est peu profonde : on décale surtout en largeur.
  return { x: clamp(x + offset * 6), y: clamp(y + (row === 'front' ? 0 : offset * 4)) };
}

/**
 * Espace scénique d'une scène (écran 8.3, SCRUM-102) : placement initial des personnages
 * et des décors, par glisser-déposer sur le plateau, avec les flèches du clavier, ou en
 * choisissant une zone dans la liste sous le plateau.
 */
@Component({
  imports: [TranslatePipe, CdkDrag],
  selector: 'app-scene-stage',
  styleUrl: './scene-stage.component.scss',
  templateUrl: './scene-stage.component.html',
})
export class SceneStage {
  private readonly translate = inject(TranslateService);
  private readonly floor = viewChild<ElementRef<HTMLElement>>('floor');

  readonly sceneId = input.required<string>();
  readonly elements = input<StageElement[]>([]);
  readonly placements = input<StagePlacement[]>([]);

  readonly placementsChange = output<StagePlacement[]>();

  protected readonly zones = STAGE_ZONES;
  protected readonly selected = signal<string | null>(null);
  /** Message lu par les lecteurs d'écran après un déplacement. */
  protected readonly announcement = signal('');

  /** Placements des seuls éléments encore présents dans la scène. */
  private readonly validPlacements = computed(() =>
    this.placements().filter((placement) => this.elements().some((element) => this.matches(element, placement))),
  );

  protected readonly placed = computed(() =>
    this.validPlacements().map((placement) => ({
      placement,
      element: this.elements().find((element) => this.matches(element, placement))!,
    })),
  );

  protected readonly unplaced = computed(() =>
    this.elements().filter((element) => !this.placementOf(element)),
  );

  protected readonly selectedZone = computed(() => {
    const key = this.selected();
    const placement = this.validPlacements().find((p) => this.key(p) === key);
    return placement ? zoneOf(placement.x, placement.y) : null;
  });

  protected key(item: StageElement | StagePlacement): string {
    return `${item.kind}:${item.ref}`;
  }

  protected placementOf(element: StageElement): StagePlacement | undefined {
    return this.validPlacements().find((placement) => this.matches(element, placement));
  }

  protected zoneOfElement(element: StageElement): string {
    const placement = this.placementOf(element);
    return placement ? zoneOf(placement.x, placement.y) : '';
  }

  protected zoneLabel(zone: string): string {
    return this.translate.instant(`createDancedTale.stage.zones.${zone}`);
  }

  protected initials(label: string): string {
    return label
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0].toUpperCase())
      .join('');
  }

  protected color(element: StageElement): string | null {
    if (element.kind !== 'character') {
      return null;
    }

    const index = this.elements().filter((e) => e.kind === 'character').indexOf(element);
    return CHARACTER_COLORS[index % CHARACTER_COLORS.length];
  }

  protected fieldId(element: StageElement): string {
    return `stage-${this.sceneId()}-${element.kind}-${this.elements().indexOf(element)}`;
  }

  /** Fin d'un glisser : position en pourcentage si l'élément est lâché sur le plateau, sinon il revient « à placer ». */
  protected onDragEnded(element: StageElement, event: CdkDragEnd): void {
    const floor = this.floor()?.nativeElement.getBoundingClientRect();
    const { x, y } = event.dropPoint;
    event.source.reset();

    if (floor && x >= floor.left && x <= floor.right && y >= floor.top && y <= floor.bottom) {
      this.place(element, ((x - floor.left) / floor.width) * 100, ((y - floor.top) / floor.height) * 100);
    } else {
      this.unplace(element);
    }
  }

  /** Flèches du clavier sur un élément du plateau. */
  protected onKeydown(element: StageElement, event: KeyboardEvent): void {
    const placement = this.placementOf(element);
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-KEYBOARD_STEP, 0],
      ArrowRight: [KEYBOARD_STEP, 0],
      ArrowUp: [0, -KEYBOARD_STEP],
      ArrowDown: [0, KEYBOARD_STEP],
    };
    const move = moves[event.key];

    if (!placement || !move) {
      return;
    }

    event.preventDefault();
    this.place(element, placement.x + move[0], placement.y + move[1]);
  }

  /** Choix d'une zone dans la liste (alternative au glisser-déposer). */
  protected onZoneChange(element: StageElement, zone: string): void {
    if (!zone) {
      this.unplace(element);
      return;
    }

    const others = this.validPlacements().filter(
      (placement) => !this.matches(element, placement) && zoneOf(placement.x, placement.y) === zone,
    );
    const { x, y } = zoneCenter(zone, others.length);
    this.place(element, x, y);
  }

  protected reset(): void {
    this.selected.set(null);
    this.placementsChange.emit([]);
  }

  private place(element: StageElement, x: number, y: number): void {
    const placement: StagePlacement = { kind: element.kind, ref: element.ref, x: clamp(x), y: clamp(y) };
    this.selected.set(this.key(element));
    this.placementsChange.emit([
      ...this.validPlacements().filter((p) => !this.matches(element, p)),
      placement,
    ]);
    this.announcement.set(`${element.label} : ${this.zoneLabel(zoneOf(placement.x, placement.y))}`);
  }

  private unplace(element: StageElement): void {
    this.placementsChange.emit(this.validPlacements().filter((p) => !this.matches(element, p)));
    this.announcement.set(
      `${element.label} : ${this.translate.instant('createDancedTale.stage.offStage')}`,
    );
  }

  private matches(element: StageElement, placement: StagePlacement): boolean {
    return element.kind === placement.kind && element.ref === placement.ref;
  }
}
