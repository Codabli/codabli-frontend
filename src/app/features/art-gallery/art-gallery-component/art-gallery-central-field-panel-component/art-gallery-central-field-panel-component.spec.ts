import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { ArtGalleryHotspotService } from '../../art-gallery-hotspot-service';
import { ArtGalleryCentralFieldPanelComponent } from './art-gallery-central-field-panel-component';

describe('ArtGalleryCentralFieldPanelComponent', () => {
  let component: ArtGalleryCentralFieldPanelComponent;
  let fixture: ComponentFixture<ArtGalleryCentralFieldPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArtGalleryCentralFieldPanelComponent],
      providers: [
        provideTranslateService(),
        // Hotspot data comes from json-server; tests must not depend on it.
        {
          provide: ArtGalleryHotspotService,
          useValue: { getHotspot: () => Promise.resolve(undefined) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ArtGalleryCentralFieldPanelComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it.todo('displays the room selected through the horizontal navigation');
});
