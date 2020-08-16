import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController, LoadingController, AlertController } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { HomeService } from '../../home/home.service';
import { Place } from '../../models/place.model';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-edit-offer',
  templateUrl: './edit-offer.page.html',
  styleUrls: ['./edit-offer.page.scss'],
})
export class EditOfferPage implements OnInit, OnDestroy {
  place: Place;
  placeId: string;
  form: FormGroup;
  private placesSub: Subscription;
  isLoading = false;
  constructor(private route: ActivatedRoute,
    private navCtrl: NavController,
    private homeService: HomeService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController) { }

  ngOnInit() {
    this.route.paramMap.subscribe(param => {
      if (!param.has("placeId")) {
        this.navCtrl.navigateBack('/tabls/offers');
        return;
      }
      this.placeId = param.get('placeId');
      this.isLoading = true;
      this.placesSub = this.homeService.getPlace(param.get("placeId")).subscribe(place => {
        this.place = place;
        this.form = new FormGroup({
          title: new FormControl(this.place.title, {
            updateOn: 'blur',
            validators: [Validators.required]
          }),
          description: new FormControl(this.place.description, {
            updateOn: 'blur',
            validators: [Validators.required, Validators.maxLength(180)]
          }),
          price: new FormControl(this.place.price, {
            updateOn: 'blur',
            validators: [Validators.required, Validators.min(1)]
          })
        });
        this.isLoading = false;
      }, error => {
        this.alertCtrl.create({
          header: 'An error occurred!',
          message: 'Please could not be fetched. Please try again later.',
          buttons: [{
            text: 'Okay', handler: () => {
              this.router.navigate(['/tabs/offers']);
            }
          }]
        }).then(alertEl => {
          alertEl.present();
        })
      });
    });
  }
  ngOnDestroy() {
    if (this.placesSub) {
      this.placesSub.unsubscribe();
    }
  }
  onUpdateOffer() {
    if (!this.form.valid) {
      return;
    }
    const title = this.form.value.title;
    const description = this.form.value.description;
    const price = this.form.value.price;
    this.loadingCtrl.create({
      message: 'Updating place...'
    }).then(loadingEl => {
      loadingEl.present();
      this.homeService.updatePlace(this.place.id, title, description, price).subscribe(() => {
        loadingEl.dismiss();
        this.router.navigate(['/tabs/offers']);
      });
    });
  }
}
