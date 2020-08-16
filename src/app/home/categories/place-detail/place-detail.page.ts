import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavController, ModalController, ActionSheetController, LoadingController, AlertController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { HomeService } from '../../home.service';
import { Place } from '../../../models/place.model';
import { CreateBookingComponent } from '../../../bookings/create-booking/create-booking.component';
import { BookingService } from '../../../bookings/bookings.service';
import { AuthService } from 'src/app/auth/auth.service';
import { MapModalComponent } from '../../../shared/map-modal/map-modal.component';
import { switchMap, take } from 'rxjs/operators';

@Component({
  selector: 'app-place-detail',
  templateUrl: './place-detail.page.html',
  styleUrls: ['./place-detail.page.scss'],
})
export class PlaceDetailPage implements OnInit, OnDestroy {
  place: Place;
  private placesSub: Subscription;
  isBookable = false;
  isLoading = false;
  constructor(private route: ActivatedRoute,
    private navCtrl: NavController,
    private homeService: HomeService,
    private modalCtrl: ModalController,
    private actionSheetCtrl: ActionSheetController,
    private bookingService: BookingService,
    private loadingCtrl: LoadingController,
    private authService: AuthService,
    private alertCtrl: AlertController,
    private router: Router) { }

  ngOnInit() {
    this.route.paramMap.subscribe(param => {
      if (!param.has("placeId")) {
        this.navCtrl.navigateBack('/places/tabs/discover');
        return;
      }
      this.isLoading = true;
      let fetchedUserId: string;
      this.authService.userId.pipe(
        take(1),
        switchMap(userId => {
         if(!userId){
           throw new Error('Found no user!');
         }
         fetchedUserId = userId;
         return this.homeService.getPlace(param.get("placeId"));
        })
      ).subscribe(place => {
        this.place = place;
        this.isBookable = place.userId !== fetchedUserId;
        this.isLoading = false;
      }, error => {
        this.alertCtrl.create({
          header: 'An error ocurred!',
          message: 'Could not load place',
          buttons: [
            {
              text: 'Okay',
              handler: () => {
                this.router.navigate(['/places/tabs/discover']);
              }
            }
          ]
        }).then(alertEL => {
          alertEL.present();
        });
      });
    });
  }
  ngOnDestroy() {
    if (this.placesSub) {
      this.placesSub.unsubscribe();
    }
  }
  onBookPlace() {
    this.actionSheetCtrl.create({
      header: 'Choose an Action',
      buttons: [
        {
          text: 'Select Date',
          handler: () => {
            this.openBookingModal('select');
          }
        },
        {
          text: 'Random Date',
          handler: () => {
            this.openBookingModal('random');
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    }).then(actionSheetEl => {
      actionSheetEl.present();
    });

  }
  openBookingModal(mode: 'select' | 'random') {
    this.modalCtrl.create({
      component: CreateBookingComponent,
      componentProps: { selectedPlace: this.place, selectedMode: mode }
    }).then(modalEl => {
      modalEl.present();
      return modalEl.onDidDismiss();
    }).then(result => {
      console.log(result.data, result.role);
      if (result.role === 'confirm') {
        this.loadingCtrl.create(
          {
            message: 'Booking place...'
          }
        ).then(bookingEL => {
          bookingEL.present();
          const data = result.data.bookingData;
          this.bookingService.addBooking(
            this.place.id,
            this.place.title,
            this.place.imageUrl,
            this.place.categoryId,
            data.firstName,
            data.lastName,
            data.guestNumber,
            data.startDate,
            data.endDate
          ).subscribe(() => {
            bookingEL.dismiss();
          });
        })

      }
    });
  }
  onShowFullMap() {
    this.modalCtrl.create({
      component: MapModalComponent, componentProps: {
        center: { lat: this.place.location.lat, lng: this.place.location.lng },
        selectable: false,
        closeButtonText: 'Close',
        title: this.place.location.address
      }
    })
      .then(modelEl => {
        modelEl.present();
      })
  }
}
