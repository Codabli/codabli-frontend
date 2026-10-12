import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Button } from './button.component';

describe('Button', () => {
  let component: Button;
  let fixture: ComponentFixture<Button>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Button],
    }).compileComponents();

    fixture = TestBed.createComponent(Button);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render a labelled circular carousel chevron', () => {
    fixture.componentRef.setInput('carouselIcon', 'left');
    fixture.componentRef.setInput('ariaLabel', 'Actualité précédente');
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector(
      'button',
    ) as HTMLButtonElement;

    expect(button.classList).toContain('button--carousel-icon');
    expect(button.getAttribute('aria-label')).toBe('Actualité précédente');
    expect(
      button.querySelector(
        '.button__carousel-icon--circle-chevron .fa-chevron-left',
      ),
    ).toBeTruthy();
  });
});
