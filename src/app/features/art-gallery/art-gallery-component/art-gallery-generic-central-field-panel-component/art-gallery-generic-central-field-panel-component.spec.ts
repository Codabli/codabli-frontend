import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ArtGalleryGenericCentralFieldPanelComponent } from './art-gallery-generic-central-field-panel-component';

describe('ArtGalleryGenericCentralFieldPanelComponent', () => {
  let component: ArtGalleryGenericCentralFieldPanelComponent;
  let fixture: ComponentFixture<ArtGalleryGenericCentralFieldPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArtGalleryGenericCentralFieldPanelComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(
      ArtGalleryGenericCentralFieldPanelComponent,
    );
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
