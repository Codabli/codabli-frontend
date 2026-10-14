import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ArtGalleryNavigationPanelComponent } from './art-gallery-navigation-panel-component';

describe('ArtGalleryNavigationPanelComponent', () => {
  let component: ArtGalleryNavigationPanelComponent;
  let fixture: ComponentFixture<ArtGalleryNavigationPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArtGalleryNavigationPanelComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ArtGalleryNavigationPanelComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
