import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ArtGalleryConstants } from './art-gallery-constants';
import { ArtGalleryCountryEnum } from './art-gallery-country-enum';

@Injectable({
    providedIn: 'root',
})
export class ArtGalleryService {
    private currentCountry: ArtGalleryCountryEnum;
    private currentCountrySubject: BehaviorSubject<ArtGalleryCountryEnum>;
    public currentCountryObservable: Observable<ArtGalleryCountryEnum>;

    private isFrescoExtended: boolean;
    private isFrescoExtendedSubject: BehaviorSubject<boolean>;
    public isFrescoExtendedObservable: Observable<boolean>;
    private hasStartedWorldMapExploration = false;

    constructor() {
        this.currentCountry = ArtGalleryCountryEnum.WORLD;
        this.currentCountrySubject = new BehaviorSubject<ArtGalleryCountryEnum>(this.currentCountry);
        this.currentCountryObservable = this.currentCountrySubject.asObservable();

        this.isFrescoExtended = false;
        this.isFrescoExtendedSubject = new BehaviorSubject<boolean>(this.isFrescoExtended);
        this.isFrescoExtendedObservable = this.isFrescoExtendedSubject.asObservable();
    }

    public getCurrentCountry(): ArtGalleryCountryEnum {
        return this.currentCountry;
    }

    public hasStartedExploring(): boolean {
        return this.hasStartedWorldMapExploration;
    }

    public startExploring(): void {
        this.hasStartedWorldMapExploration = true;
    }

    public goTo(destination: ArtGalleryCountryEnum): void {
        if (
            (destination === ArtGalleryCountryEnum.WORLD ||
                ArtGalleryConstants.VISITABLE_COUNTRIES.includes(destination)) &&
            destination !== this.currentCountry
        ) {
            this.currentCountry = destination;
            this.currentCountrySubject.next(this.currentCountry);
        }
    }

    public goNextCountry(): void {
        const currentIndex = ArtGalleryConstants.VISITABLE_COUNTRIES.indexOf(this.currentCountry);
        const nextCountry = ArtGalleryConstants.VISITABLE_COUNTRIES[currentIndex + 1];

        if (nextCountry !== undefined) {
            this.goTo(nextCountry);
        }
    }

    public extendFresco(): void {
        if (!this.isFrescoExtended) {
            this.isFrescoExtended = true;
            this.isFrescoExtendedSubject.next(this.isFrescoExtended);
        }
    }

    public shrinkFresco(): void {
        if (this.isFrescoExtended) {
            this.isFrescoExtended = false;
            this.isFrescoExtendedSubject.next(this.isFrescoExtended);
        }
    }
}
