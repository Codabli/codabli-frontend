import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ArtGalleryCentralFieldPanelComponent } from './art-gallery-central-field-panel-component';

describe('ArtGalleryCentralFieldPanelComponent', () => {
  let component: ArtGalleryCentralFieldPanelComponent;
  let fixture: ComponentFixture<ArtGalleryCentralFieldPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArtGalleryCentralFieldPanelComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ArtGalleryCentralFieldPanelComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
