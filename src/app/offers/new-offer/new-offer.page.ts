import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';

import { HomeService } from '../../home/home.service';
import { PlaceLocation } from '../../models/location.model';
import { switchMap } from 'rxjs/operators';
import { DataService } from 'src/app/shared/data.service';
import { CommonService } from 'src/app/shared/common.service';

@Component({
  selector: 'app-new-offer',
  templateUrl: './new-offer.page.html',
  styleUrls: ['./new-offer.page.scss'],
})
export class NewOfferPage implements OnInit {
  form: FormGroup;
  constructor(private homeService: HomeService,
    private dataService: DataService,
    private commonService: CommonService,
    private router: Router,
    private loadingCtrl: LoadingController) { }

  ngOnInit() {
    this.form = new FormGroup({
      title: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required]
      }),
      description: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required, Validators.maxLength(180)]
      }),
      price: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required, Validators.min(1)]
      }),
      categoryId: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required]
      }),
      dateFrom: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required]
      }),
      dateTo: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required]
      }),
      location: new FormControl(null, { validators: [Validators.required] }),
      image: new FormControl(null)
    });
  }
  onCreateOffer() {
    if (!this.form.valid || !this.form.get('image').value) {
      return;
    }
    const title = this.form.value.title;
    const description = this.form.value.description;
    const price = +this.form.value.price;
    const categoryId = this.form.value.categoryId;
    const dateFrom = new Date(this.form.value.dateFrom);
    const dateTo = new Date(this.form.value.dateTo);
    this.loadingCtrl.create({
      message: 'Creating place...'
    }).then(loadingEl => {
      loadingEl.present();
      this.dataService.uploadImage(this.form.get('image').value).pipe(switchMap(uploadRes => {
        return this.homeService.addPlace(title, categoryId, description, price, dateFrom, dateTo, this.form.value.location, uploadRes.imageUrl);
      }))
        .subscribe(() => {
          loadingEl.dismiss();
          this.form.reset();
          this.router.navigate(['/tabs/offers']);
        });
    });
  }
  onLocationPicked(location: PlaceLocation) {
    this.form.patchValue({ location: location });
  }
  onImagePicked(imageData: string | File) {
    let imageFile;
    if (typeof imageData === 'string') {
      try {
        imageFile = this.commonService.base64toBlob(imageData.replace('data:image/jpeg;base64,', ''), 'image/jpeg');
      } catch (error) {
        return;
      }
    } else {
      imageFile = imageData;
    }
    this.form.patchValue({ image: imageFile });
  }
}
