import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { TeacherAccountComponent } from './teacher-account.component';

describe('TeacherAccountComponent', () => {
  let component: TeacherAccountComponent;
  let fixture: ComponentFixture<TeacherAccountComponent>;
  let element: HTMLElement;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeacherAccountComponent],
      providers: [
        provideRouter([]),
        provideTranslateService(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TeacherAccountComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should render the fields of the mockup in order', async () => {
    http.expectOne('/api/ecoles').flush([]);
    await fixture.whenStable();

    const ids = Array.from(element.querySelectorAll('form input, form select')).map((el) => el.id);

    expect(ids).toEqual([
      'schoolId',
      'academy',
      'ageRange',
      'girlsCount',
      'boysCount',
      'platformGoal',
      'lastName',
      'firstName',
      'email',
      'password',
      'passwordConfirmation',
    ]);
  });

  it('should list the schools returned by the API', async () => {
    http.expectOne('/api/ecoles').flush([
      { id: 'a', nom: 'École Jules Ferry', pays: 'France', ville: 'Lyon' },
      { id: 'b', nom: 'Collège Victor Hugo', pays: 'France', ville: null },
    ]);
    await fixture.whenStable();

    const options = Array.from(element.querySelectorAll('#schoolId option')).map((o) =>
      o.textContent!.trim(),
    );

    expect(options.slice(1)).toEqual(['École Jules Ferry (Lyon)', 'Collège Victor Hugo']);
  });

  it('should warn when the schools cannot be loaded', async () => {
    http.expectOne('/api/ecoles').flush(null, { status: 0, statusText: 'Unknown Error' });
    await fixture.whenStable();

    expect(component.schoolsUnavailable()).toBe(true);
    expect(element.querySelector('#schoolId-error')).not.toBeNull();
  });

  it('should show errors only after a submit attempt', async () => {
    http.expectOne('/api/ecoles').flush([]);
    await fixture.whenStable();

    expect(element.querySelectorAll('.form-field__error').length).toBe(0);

    element.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    await fixture.whenStable();

    expect(element.querySelectorAll('.form-field__error').length).toBeGreaterThan(0);
  });
});
