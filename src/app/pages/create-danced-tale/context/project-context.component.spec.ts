import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { ProjectContextComponent } from './project-context.component';
import { CreateDancedTaleDraftService } from '../../../core/services/create-danced-tale-draft.service';
import { ProjectContext } from '../../../models/interfaces/project-context.interface';

describe('ProjectContextComponent', () => {
  let fixture: ComponentFixture<ProjectContextComponent>;
  let element: HTMLElement;
  let router: Router;
  let draftService: CreateDancedTaleDraftService;

  async function setup(savedContext?: ProjectContext): Promise<void> {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [ProjectContextComponent],
      providers: [provideRouter([]), provideTranslateService()],
    }).compileComponents();

    draftService = TestBed.inject(CreateDancedTaleDraftService);
    if (savedContext) {
      draftService.saveContext(savedContext);
    }

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(ProjectContextComponent);
    element = fixture.nativeElement;
    await fixture.whenStable();
  }

  function input(id: string): HTMLInputElement {
    return element.querySelector<HTMLInputElement>(`#${id}`)!;
  }

  function type(id: string, value: string): void {
    input(id).value = value;
    input(id).dispatchEvent(new Event('input'));
  }

  function clickNext(): void {
    element.querySelector<HTMLElement>('.project-context__actions app-button')!.click();
    fixture.detectChanges();
  }

  it('affiche les 5 tranches d\'âge et les 4 espaces de représentation', async () => {
    await setup();

    expect(element.querySelectorAll('input[name="ageRange"]')).toHaveLength(5);
    expect(element.querySelectorAll('input[name="performanceSpace"]')).toHaveLength(4);
  });

  it('bloque le passage à l\'étape suivante et affiche les erreurs si les champs obligatoires manquent', async () => {
    await setup();

    clickNext();

    expect(router.navigate).not.toHaveBeenCalled();
    expect(draftService.context()).toBeNull();
    expect(element.querySelector('#ageRange-error')).not.toBeNull();
    expect(element.querySelector('#country-error')).not.toBeNull();
    expect(element.querySelector('#region-error')).not.toBeNull();
    expect(element.querySelector('#theme-error')).not.toBeNull();
  });

  it('ajoute une puce avec Entrée et la retire avec son bouton', async () => {
    await setup();

    type('ingredient', 'dragons');
    input('ingredient').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    fixture.detectChanges();

    expect(element.querySelectorAll('.chip')).toHaveLength(1);
    expect(input('ingredient').value).toBe('');

    element.querySelector<HTMLButtonElement>('.chip__remove')!.click();
    fixture.detectChanges();

    expect(element.querySelectorAll('.chip')).toHaveLength(0);
  });

  it('sauvegarde le contexte puis passe à l\'étape suivante', async () => {
    await setup();

    input('ageRange-9-11').click();
    input('performanceSpace-exterieur').click();
    type('country', 'France');
    type('region', 'Bretagne');
    type('city', 'Brest');
    type('theme', 'Nature et environnement');
    // Un mot-clé saisi sans Entrée est tout de même conservé.
    type('ingredient', 'la mer');

    clickNext();

    expect(draftService.context()).toEqual({
      ageRange: '9-11',
      country: 'France',
      region: 'Bretagne',
      city: 'Brest',
      theme: 'Nature et environnement',
      secretIngredients: ['la mer'],
      performanceSpace: 'exterieur',
    });
    expect(router.navigate).toHaveBeenCalledWith(['../discovery'], expect.anything());
  });

  it('pré-remplit le formulaire avec le brouillon enregistré', async () => {
    await setup({
      ageRange: '12-14',
      country: 'Belgique',
      region: 'Wallonie',
      city: '',
      theme: 'Les émotions',
      secretIngredients: ['colère', 'joie'],
      performanceSpace: 'classe',
    });

    expect(input('country').value).toBe('Belgique');
    expect(input('region').value).toBe('Wallonie');
    expect(input('ageRange-12-14').checked).toBe(true);
    expect(input('performanceSpace-classe').checked).toBe(true);
    expect(element.querySelectorAll('.chip')).toHaveLength(2);
  });
});
