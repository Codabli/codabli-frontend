import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ArtGalleryCountryPresentationPanelComponent } from './art-gallery-country-presentation-panel-component';

describe('ArtGalleryCountryPresentationPanelComponent', () => {
  let component: ArtGalleryCountryPresentationPanelComponent;
  let fixture: ComponentFixture<ArtGalleryCountryPresentationPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArtGalleryCountryPresentationPanelComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(
      ArtGalleryCountryPresentationPanelComponent,
    );
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
