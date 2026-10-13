import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ArtGalleryWorldMapPanelComponent } from './art-gallery-world-map-panel-component';

describe('ArtGalleryWorldMapPanelComponent', () => {
  let component: ArtGalleryWorldMapPanelComponent;
  let fixture: ComponentFixture<ArtGalleryWorldMapPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArtGalleryWorldMapPanelComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ArtGalleryWorldMapPanelComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
