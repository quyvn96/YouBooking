import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { take } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { HomeService } from '../home.service';
import { Place } from 'src/app/models/place.model';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.page.html',
  styleUrls: ['./categories.page.scss'],
})
export class CategoriesPage implements OnInit, OnDestroy {

  loadedPlaces: Place[];
  listLoadedPlaces: Place[];
  relevantPlaces: Place[];
  private filter = 'all';
  private placesSub: Subscription;
  isLoading = false;
  constructor(private homeService: HomeService,
    private authService: AuthService) { }

  ngOnInit() {
    this.placesSub = this.homeService.places.subscribe(places => {
      this.loadedPlaces = places;
      this.relevantPlaces = this.loadedPlaces;
      this.listLoadedPlaces = this.loadedPlaces.slice(1);
      this.onFilterUpdate(this.filter);
    });
  }
  ionViewWillEnter() {
    this.isLoading = true;
    this.homeService.fetchPlaces().subscribe(() => {
      this.isLoading = false;
    });
  }
  onFilterUpdate(filter: string) {
    this.authService.userId.pipe(take(1)).subscribe(userId => {
      const isShown = place => filter === 'all' || place.userId === userId;
      this.relevantPlaces = this.loadedPlaces.filter(isShown);
      this.filter = filter;
    });
  }
  ngOnDestroy() {
    if (this.placesSub) {
      this.placesSub.unsubscribe();
    }
  }

}
