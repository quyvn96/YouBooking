import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonItemSliding, LoadingController } from '@ionic/angular';
import { Booking } from '../models/booking.model';
import { BookingService } from './bookings.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.page.html',
  styleUrls: ['./bookings.page.scss'],
})
export class BookingsPage implements OnInit, OnDestroy {
  loadedBookings: Booking[];
  private bookingSub: Subscription;
  isLoading = false;
  constructor(private bookingService: BookingService,
    private loadingCtrl: LoadingController) { }

  ngOnInit() {
    this.bookingSub = this.bookingService.bookings.subscribe(bookings => {
      this.loadedBookings = bookings;
    });
  }
  ionViewWillEnter() {
    this.isLoading = true;
    this.bookingService.fetchBookings().subscribe(() => {
      this.isLoading = false;
    });
  }
  onCancelBooking(bookingId: string, slidingBooking: IonItemSliding) {
    slidingBooking.close();
    this.loadingCtrl.create({
      message: 'Canceling...'
    }).then(bookingEl => {
      bookingEl.present();
      this.bookingService.cancelBooking(bookingId).subscribe(() => {
        bookingEl.dismiss();
      });
    });
  }
  ngOnDestroy() {
    if (this.bookingSub) {
      this.bookingSub.unsubscribe();
    }
  }
}
