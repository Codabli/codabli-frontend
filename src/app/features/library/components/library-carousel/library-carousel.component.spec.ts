import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LibraryCarouselComponent } from './library-carousel.component';

describe('LibraryCarouselComponent', () => {
  let component: LibraryCarouselComponent;
  let fixture: ComponentFixture<LibraryCarouselComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LibraryCarouselComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LibraryCarouselComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
