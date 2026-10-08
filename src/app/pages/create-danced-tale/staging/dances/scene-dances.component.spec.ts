import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { SceneDances } from './scene-dances.component';
import { findCatalogDance } from './dance-catalog';
import { SceneDance } from '../../../../models/interfaces/tale-staging.interface';

const ROUND: SceneDance = { id: 'd1', danceId: 'festiveRound', name: 'Ronde', moment: 'beginning', style: 'traditional' };
const DUEL: SceneDance = { id: 'd2', danceId: 'rhythmicDuel', name: 'Duel', moment: 'end', style: 'contemporary' };

const afterRender = () => new Promise((resolve) => setTimeout(resolve));

describe('SceneDances', () => {
  let fixture: ComponentFixture<SceneDances>;
  let component: SceneDances;
  let element: HTMLElement;
  let emitted: SceneDance[][];

  async function setup(dances: SceneDance[] = []): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [SceneDances],
      providers: [provideTranslateService()],
    }).compileComponents();

    fixture = TestBed.createComponent(SceneDances);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('sceneId', 's1');
    fixture.componentRef.setInput('sceneNumber', 1);
    fixture.componentRef.setInput('dances', dances);
    emitted = [];
    // Le parent renvoie la nouvelle liste, comme l'écran de mise en scène.
    component.dancesChange.subscribe((value) => {
      emitted.push(value);
      fixture.componentRef.setInput('dances', value);
    });
    element = fixture.nativeElement;
    await fixture.whenStable();
  }

  function last(): SceneDance[] {
    return emitted.at(-1)!;
  }

  function drop(event: Partial<CdkDragDrop<SceneDance[]>>): void {
    (component as unknown as { onDrop(e: unknown): void }).onDrop(event);
    fixture.detectChanges();
  }

  it('affiche toujours la zone de dépôt, même quand la scène a déjà des danses', async () => {
    await setup([ROUND]);

    expect(element.querySelector('.scene-dances__drop-hint')).not.toBeNull();
  });

  it('ajoute une danse au clavier et place le focus sur son nom', async () => {
    await setup();
    const select = element.querySelector<HTMLSelectElement>('#scene-s1-add-dance')!;

    select.value = 'dream';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    element.querySelector<HTMLElement>('.scene-dances__add app-button')!.click();
    fixture.detectChanges();
    await afterRender();

    expect(last()).toEqual([
      { id: expect.any(String), danceId: 'dream', name: expect.any(String), moment: 'beginning', style: 'contemporary' },
    ]);
    expect(document.activeElement).toBe(element.querySelector('.dance input[type="text"]'));
    expect(select.value).toBe('');
  });

  it('ajoute une danse déposée depuis la bibliothèque, à l\'endroit du dépôt', async () => {
    await setup([ROUND, DUEL]);
    const list = {};

    drop({ previousContainer: {} as never, container: list as never, currentIndex: 1, item: { data: findCatalogDance('storm') } as never });

    expect(last().map((dance) => dance.danceId)).toEqual(['festiveRound', 'storm', 'rhythmicDuel']);
  });

  it('réordonne les danses d\'une même scène', async () => {
    await setup([ROUND, DUEL]);
    const list = {};

    drop({ previousContainer: list as never, container: list as never, previousIndex: 0, currentIndex: 1, item: { data: ROUND } as never });

    expect(last()).toEqual([DUEL, ROUND]);
  });

  it('modifie le nom, le moment et le style d\'une danse', async () => {
    await setup([ROUND]);
    const dance = () => element.querySelector<HTMLElement>('li.dance')!;

    const name = dance().querySelector<HTMLInputElement>('input[type="text"]')!;
    name.value = 'Ronde du banquet';
    name.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    dance().querySelectorAll<HTMLInputElement>('input[type="radio"]')[2].click();
    fixture.detectChanges();

    const style = dance().querySelector<HTMLSelectElement>('select')!;
    style.value = 'classical';
    style.dispatchEvent(new Event('change'));

    expect(last()).toEqual([{ ...ROUND, name: 'Ronde du banquet', moment: 'end', style: 'classical' }]);
  });

  it('replie l\'ajout sans glisser-déposer par défaut', async () => {
    await setup();

    expect(element.querySelector<HTMLDetailsElement>('.scene-dances__add-panel')!.open).toBe(false);
  });

  it('supprime une danse et rend le focus au titre du bloc d\'ajout, ou à sa liste s\'il est déplié', async () => {
    await setup([ROUND, DUEL]);

    element.querySelector<HTMLButtonElement>('.dance__remove')!.click();
    fixture.detectChanges();
    await afterRender();

    expect(last()).toEqual([DUEL]);
    expect(document.activeElement).toBe(element.querySelector('#scene-s1-add-summary'));

    element.querySelector<HTMLDetailsElement>('.scene-dances__add-panel')!.open = true;
    element.querySelector<HTMLButtonElement>('.dance__remove')!.click();
    fixture.detectChanges();
    await afterRender();

    expect(document.activeElement).toBe(element.querySelector('#scene-s1-add-dance'));
    expect(element.querySelector('[aria-live="polite"]')!.textContent).toContain(
      'createDancedTale.dances.scene.announce.removed',
    );
  });

  it('accepte les danses de la bibliothèque et les siennes, pas celles d\'une autre scène', async () => {
    await setup();
    const canEnter = (component as unknown as { canEnter(drag: unknown, drop: unknown): boolean }).canEnter;
    const ownList = {};

    expect(canEnter({ data: findCatalogDance('storm'), dropContainer: {} }, ownList)).toBe(true);
    expect(canEnter({ data: ROUND, dropContainer: ownList }, ownList)).toBe(true);
    expect(canEnter({ data: ROUND, dropContainer: {} }, ownList)).toBe(false);
  });
});
