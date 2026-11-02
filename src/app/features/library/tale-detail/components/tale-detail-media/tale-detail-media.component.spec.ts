import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { ConteDanse } from '@models/interfaces/conte-danse.interface';
import { TaleDetailMediaComponent } from './tale-detail-media.component';

const conteMock: ConteDanse = {
  id: 'conte-1',
  titre: 'Conte test',
  description: '',
  thematique: '',
  langueOriginale: 'fr',
  couvertureUrl: null,
  pays: null,
  culture: null,
  ageMin: null,
  ageMax: null,
  dureeMinutes: null,
  credits: null,
  statut: 'publie',
  acces: 'gratuit',
  isbn: null,
  fichierTexteUrl: null,
  fichierAudioUrl: null,
  fichierVideoUrl: null,
  dateCreation: '2026-01-01',
  datePublication: null,
  createurId: 'user-1',
  createurNom: 'Nom',
  createurPrenom: 'Prénom',
  traductions: [],
};

describe('TaleDetailMediaComponent', () => {
  let component: TaleDetailMediaComponent;
  let fixture: ComponentFixture<TaleDetailMediaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaleDetailMediaComponent],
      providers: [provideTranslateService()],
    }).compileComponents();

    fixture = TestBed.createComponent(TaleDetailMediaComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('conte', conteMock);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
