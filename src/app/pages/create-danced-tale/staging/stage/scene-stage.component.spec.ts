import { CdkDragEnd } from '@angular/cdk/drag-drop';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { SceneStage, StageElement, zoneOf } from './scene-stage.component';
import { StagePlacement } from '../../../../models/interfaces/tale-staging.interface';

const ARTHUR: StageElement = { kind: 'character', ref: 'arthur', label: 'Arthur' };
const MERLIN: StageElement = { kind: 'character', ref: 'merlin', label: 'Merlin' };
const THRONE: StageElement = { kind: 'prop', ref: 'Trône', label: 'Trône' };

describe('zoneOf', () => {
  it('découpe le plateau en 9 zones, du fond vers le public et du jardin vers la cour', () => {
    expect(zoneOf(10, 10)).toBe('back-left');
    expect(zoneOf(50, 50)).toBe('middle-center');
    expect(zoneOf(90, 90)).toBe('front-right');
    // L'avant-scène commence au rideau (80 %), pas au dernier tiers.
    expect(zoneOf(50, 75)).toBe('middle-center');
  });
});

describe('SceneStage', () => {
  let fixture: ComponentFixture<SceneStage>;
  let component: SceneStage;
  let element: HTMLElement;
  let emitted: StagePlacement[][];

  async function setup(placements: StagePlacement[] = [], elements = [ARTHUR, MERLIN, THRONE]): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [SceneStage],
      providers: [provideTranslateService()],
    }).compileComponents();

    fixture = TestBed.createComponent(SceneStage);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('sceneId', 's1');
    fixture.componentRef.setInput('elements', elements);
    fixture.componentRef.setInput('placements', placements);
    emitted = [];
    // Le parent renvoie les placements, comme l'écran de mise en scène.
    component.placementsChange.subscribe((value) => {
      emitted.push(value);
      fixture.componentRef.setInput('placements', value);
    });
    element = fixture.nativeElement;
    await fixture.whenStable();
  }

  function last(): StagePlacement[] {
    return emitted.at(-1)!;
  }

  function onStage(): HTMLElement[] {
    return Array.from(element.querySelectorAll<HTMLElement>('.stage__floor .token'));
  }

  function zoneSelect(index: number): HTMLSelectElement {
    return element.querySelectorAll<HTMLSelectElement>('.placement-list select')[index];
  }

  it('met les éléments pas encore placés dans « À placer »', async () => {
    await setup([{ kind: 'character', ref: 'arthur', x: 50, y: 50 }]);

    expect(onStage()).toHaveLength(1);
    expect(element.querySelectorAll('.token--tray')).toHaveLength(2);
  });

  it('ignore les placements d\'éléments qui ne sont plus dans la scène', async () => {
    await setup([{ kind: 'prop', ref: 'Ancien décor', x: 20, y: 20 }]);

    expect(onStage()).toHaveLength(0);
  });

  it('place un élément au centre de la zone choisie dans la liste', async () => {
    await setup();

    zoneSelect(2).value = 'back-right';
    zoneSelect(2).dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(last()).toEqual([{ kind: 'prop', ref: 'Trône', x: 83, y: 17 }]);
    expect(onStage()[0].getAttribute('aria-label')).toContain('Trône');
  });

  it('décale un second élément placé dans la même zone', async () => {
    await setup([{ kind: 'character', ref: 'arthur', x: 50, y: 50 }]);

    zoneSelect(1).value = 'middle-center';
    zoneSelect(1).dispatchEvent(new Event('change'));

    const merlin = last().find((placement) => placement.ref === 'merlin')!;
    expect(merlin).not.toMatchObject({ x: 50, y: 50 });
    expect(zoneOf(merlin.x, merlin.y)).toBe('middle-center');
  });

  it('déplace un élément placé avec les flèches du clavier', async () => {
    await setup([{ kind: 'character', ref: 'arthur', x: 50, y: 50 }]);
    const token = onStage()[0];

    token.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    token.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));

    expect(last()).toEqual([{ kind: 'character', ref: 'arthur', x: 45, y: 55 }]);
    fixture.detectChanges();
    expect(element.querySelector('[aria-live="polite"]')!.textContent).toContain('Arthur');
  });

  it('remet un élément « à placer » quand on choisit « Hors scène »', async () => {
    await setup([{ kind: 'character', ref: 'arthur', x: 50, y: 50 }]);

    zoneSelect(0).value = '';
    zoneSelect(0).dispatchEvent(new Event('change'));

    expect(last()).toEqual([]);
  });

  it('place un élément lâché sur le plateau, et le retire s\'il est lâché ailleurs', async () => {
    await setup();
    const floor = element.querySelector<HTMLElement>('.stage__floor')!;
    vi.spyOn(floor, 'getBoundingClientRect').mockReturnValue(new DOMRect(100, 100, 400, 200));
    const reset = vi.fn();
    const end = (x: number, y: number) =>
      ({ dropPoint: { x, y }, source: { reset } }) as unknown as CdkDragEnd;
    const onDragEnded = (component as unknown as { onDragEnded(e: StageElement, ev: CdkDragEnd): void })
      .onDragEnded.bind(component);

    onDragEnded(ARTHUR, end(300, 150));
    expect(last()).toEqual([{ kind: 'character', ref: 'arthur', x: 50, y: 25 }]);
    expect(reset).toHaveBeenCalled();

    onDragEnded(ARTHUR, end(50, 50));
    expect(last()).toEqual([]);
  });

  it('réinitialise le plateau', async () => {
    await setup([{ kind: 'character', ref: 'arthur', x: 50, y: 50 }]);

    element.querySelector<HTMLButtonElement>('.scene-stage__reset')!.click();

    expect(last()).toEqual([]);
  });

  it('invite à ajouter des personnages ou des décors quand la scène n\'en a pas', async () => {
    await setup([], []);

    expect(element.querySelector('.stage')).toBeNull();
    expect(element.querySelector('.scene-stage__hint')!.textContent).toContain(
      'createDancedTale.stage.noElements',
    );
  });
});
