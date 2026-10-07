import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { ProjectContextComponent } from './project-context.component';
import { apiInterceptor } from '../../../core/http/api.interceptor';
import { CREATE_DANCED_TALE_DRAFT_KEY } from '../../../core/services/create-danced-tale-draft.service';
import { ProjectContext } from '../../../models/interfaces/project-context.interface';

describe('ProjectContextComponent', () => {
  let fixture: ComponentFixture<ProjectContextComponent>;
  let element: HTMLElement;
  let router: Router;
  let http: HttpTestingController;

  async function setup(cachedContext?: ProjectContext): Promise<void> {
    localStorage.clear();
    if (cachedContext) {
      localStorage.setItem(
        CREATE_DANCED_TALE_DRAFT_KEY,
        JSON.stringify({ projectId: 'projet-1', context: cachedContext }),
      );
    }

    await TestBed.configureTestingModule({
      imports: [ProjectContextComponent],
      providers: [
        provideRouter([]),
        provideTranslateService(),
        provideHttpClient(withInterceptors([apiInterceptor])),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(ProjectContextComponent);
    element = fixture.nativeElement;
    await fixture.whenStable();
  }

  afterEach(() => http.verify());

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

  function fillRequiredFields(): void {
    input('ageRange-9-11').click();
    type('country', 'France');
    type('region', 'Bretagne');
    type('theme', 'Nature et environnement');
  }

  it('affiche les 5 tranches d\'âge et les 4 espaces de représentation', async () => {
    await setup();

    expect(element.querySelectorAll('input[name="ageRange"]')).toHaveLength(5);
    expect(element.querySelectorAll('input[name="performanceSpace"]')).toHaveLength(4);
  });

  it('bloque le passage à l\'étape suivante et affiche les erreurs si les champs obligatoires manquent', async () => {
    await setup();

    clickNext();

    http.expectNone('/api/projets-contes');
    expect(router.navigate).not.toHaveBeenCalled();
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

  it('enregistre le projet puis passe à l\'étape suivante', async () => {
    await setup();

    fillRequiredFields();
    input('performanceSpace-exterieur').click();
    type('city', 'Brest');
    // Un mot-clé saisi sans Entrée est tout de même conservé.
    type('ingredient', 'la mer');

    clickNext();

    const req = http.expectOne('/api/projets-contes');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      trancheAge: '9-11',
      pays: 'France',
      region: 'Bretagne',
      ville: 'Brest',
      theme: 'Nature et environnement',
      ingredientsSecrets: ['la mer'],
      espaceRepresentation: 'exterieur',
    });
    expect(router.navigate).not.toHaveBeenCalled();

    req.flush({ ...req.request.body, id: 'projet-1', enseignantId: 'e-1' });

    expect(router.navigate).toHaveBeenCalledWith(['../discovery'], expect.anything());
  });

  it('reste sur l\'écran et affiche un message si l\'enseignant n\'est pas connecté', async () => {
    await setup();
    fillRequiredFields();

    clickNext();
    http.expectOne('/api/projets-contes').flush(null, { status: 401, statusText: 'Unauthorized' });
    fixture.detectChanges();

    expect(router.navigate).not.toHaveBeenCalled();
    expect(element.querySelector('[role="alert"]')?.textContent).toContain(
      'createDancedTale.context.saveError.unauthorized',
    );
  });

  it('pré-remplit le formulaire avec le projet en cours et le met à jour', async () => {
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

    clickNext();

    expect(http.expectOne('/api/projets-contes/projet-1').request.method).toBe('PUT');
  });
});
