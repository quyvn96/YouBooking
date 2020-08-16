import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonItemSliding } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { Place } from '../models/place.model';
import { HomeService } from '../home/home.service';

@Component({
  selector: 'app-offers',
  templateUrl: './offers.page.html',
  styleUrls: ['./offers.page.scss'],
})
export class OffersPage implements OnInit, OnDestroy {
  offers: Place[];
  isLoading = false;
  private placesSub: Subscription;

  constructor(private homeService: HomeService,
    private router: Router) { }

  ngOnInit() {
    this.placesSub = this.homeService.places.subscribe(places => {
      this.offers = places;
    });
  }
  ionViewWillEnter(){
    this.isLoading = true;
    this.homeService.fetchPlaces().subscribe(() => {
      this.isLoading = false;
    });
  }
  onEdit(offerId: string, slidingItem: IonItemSliding) {
    slidingItem.close();
    this.router.navigate(['/','tabs', 'offers', 'edit', offerId]);
  }
  ngOnDestroy() {
    if (this.placesSub) {
      this.placesSub.unsubscribe();
    }
  }
}
