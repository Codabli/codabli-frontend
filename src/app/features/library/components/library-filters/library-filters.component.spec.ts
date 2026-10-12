import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LibraryFiltersComponent } from './library-filters.component';

describe('LibraryFiltersComponent', () => {
  let component: LibraryFiltersComponent;
  let fixture: ComponentFixture<LibraryFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LibraryFiltersComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LibraryFiltersComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
