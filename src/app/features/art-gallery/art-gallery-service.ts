import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {ArtGalleryCountryEnum} from './art-gallery-country-enum'

@Injectable({
    providedIn: 'root',
})
export class ArtGalleryService {
    private currentCountry: ArtGalleryCountryEnum;
    private currentCountrySubject: BehaviorSubject<ArtGalleryCountryEnum>;
    public currentCountryObservable: Observable<ArtGalleryCountryEnum>;

    constructor() {
        this.currentCountry = ArtGalleryCountryEnum.LEBANON;
        this.currentCountrySubject = new BehaviorSubject<ArtGalleryCountryEnum>(this.currentCountry);
        this.currentCountryObservable = this.currentCountrySubject.asObservable();
    }
    
    public GetCurrentCountry(): ArtGalleryCountryEnum {
        return this.currentCountry;
    }

    public GoNextCountry(): void {
        if (this.currentCountry !== ArtGalleryCountryEnum.VIETNAM) {
            this.currentCountry++;
            this.currentCountrySubject.next(this.currentCountry);
        }
    }
}
