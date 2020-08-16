import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, take, tap, switchMap } from 'rxjs/operators';
import { DataService } from '../shared/data.service';
import { SystemConstant } from '../shared/constants/system.constant';
import { PlaceLocation } from '../models/location.model';
import { BehaviorSubject, of } from 'rxjs';
import { Place } from '../models/place.model';
import { AuthService } from '../auth/auth.service';

interface PlaceData {
  availableFrom: string;
  availableTo: string;
  categoryId: string;
  description: string;
  imageUrl: string;
  price: number;
  title: string;
  userId: string;
  location: PlaceLocation
}

@Injectable({
  providedIn: 'root'
})
export class HomeService {

  private _places = new BehaviorSubject<Place[]>([]);
  get places() {
    return this._places.asObservable();
  }
  get placesResult() {
    let placesData: Place[];
    this.places.subscribe(place => {
      placesData = place;
    });
    return placesData;
  }
  constructor(private http: HttpClient, private dataSevice: DataService, private authService: AuthService) { }

  getCategories() {
    return this.dataSevice.get(`${SystemConstant.DefaultUrl.fireBaseApi}categories.json`);
  }
  getPlace(id: string) {
    return this.http.get<PlaceData>(`${SystemConstant.DefaultUrl.fireBaseApi}offered-places/${id}.json`).pipe(
      map(placeData => {
        return new Place(
          id,
          placeData.title,
          placeData.description,
          placeData.imageUrl,
          placeData.price,
          new Date(placeData.availableFrom),
          new Date(placeData.availableTo),
          null,
          placeData.categoryId,
          placeData.location
        );
      })
    );
  }
  addPlace(title: string, categoryId: string, description: string, price: number, dateFrom: Date, dateTo: Date, location: PlaceLocation, imageUrl: string) {
    let generatedId: string;
    let newPlace: Place;
    let fetchedUserId: string;
    return this.authService.userId.pipe(
      take(1),
      switchMap(userId => {
        fetchedUserId = userId;
        return userId;
      }),
      take(1),
      switchMap(() => {
        if (!fetchedUserId) {
          throw new Error('No user found!');
        }
        newPlace = new Place(Math.random().toString()
          , title
          , description
          , imageUrl
          , price
          , dateFrom
          , dateTo
          , fetchedUserId
          , categoryId
          , location);
        return this.http.post<{ name: string }>(`${SystemConstant.DefaultUrl.fireBaseApi}offered-places.json`, { ...newPlace, id: null })
      }), switchMap(response => {
        generatedId = response.name;
        return this.places;
      }),
      take(1),
      tap(places => {
        newPlace.id = generatedId;
        this._places.next(places.concat(newPlace));
      })
    );
  }
  updatePlace(placeId: string, title: string, description: string, price: number) {
    let updatedPlaces: Place[];
    return this.places.pipe(
      take(1),
      switchMap(places => {
        if (!places || places.length <= 0) {
          return this.fetchPlaces();
        } else {
          return of(places);
        }
      }),
      switchMap(places => {
        const updatePlaceIndex = places.findIndex(pl => pl.id === placeId);
        updatedPlaces = [...places];
        const oldPlace = updatedPlaces[updatePlaceIndex];
        updatedPlaces[updatePlaceIndex] = new Place(
          oldPlace.id,
          title,
          description,
          oldPlace.imageUrl,
          price,
          oldPlace.availableFrom,
          oldPlace.availableTo,
          oldPlace.userId,
          oldPlace.categoryId,
          oldPlace.location
        );
        return this.http.put(`${SystemConstant.DefaultUrl.fireBaseApi}offered-places/${placeId}.json`,
          { ...updatedPlaces[updatePlaceIndex], id: null }
        );
      })
      , tap(() => {
        this._places.next(updatedPlaces);
      })
    );
  }
  fetchPlaces() {
    return this.http.get<{ [key: string]: PlaceData }>(`${SystemConstant.DefaultUrl.fireBaseApi}offered-places.json`).pipe(
      map(response => {
        let places = [];
        for (const key in response) {
          if (response.hasOwnProperty(key)) {
            places.push(new Place(
              key,
              response[key].title,
              response[key].description,
              response[key].imageUrl,
              response[key].price,
              new Date(response[key].availableFrom),
              new Date(response[key].availableTo),
              response[key].userId,
              response[key].categoryId,
              response[key].location
            ));
          }
        }
        return places;
      }), tap(places => {
        this._places.next(places);
      })
    );
  }
}
