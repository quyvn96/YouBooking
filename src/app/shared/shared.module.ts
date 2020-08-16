import { NgModule } from '@angular/core';
import { LoadingSpinnerComponent } from './loading-spinner/loading-spinner.component';
import { CommonModule } from '@angular/common';
import { LocationPickerComponent } from './pickers/location-picker/location-picker.component';
import { ImagePickerComponent } from './pickers/image-picker/image-picker.component';
import { MapModalComponent } from './map-modal/map-modal.component';
import { IonicModule } from '@ionic/angular';

@NgModule({
    declarations: [
        LoadingSpinnerComponent
        , LocationPickerComponent
        , MapModalComponent
        , ImagePickerComponent
    ],
    imports: [
        CommonModule, IonicModule
    ],
    exports: [
        LoadingSpinnerComponent
        , LocationPickerComponent
        , MapModalComponent
        , ImagePickerComponent
    ],
    entryComponents: [MapModalComponent]
})
export class SharedModule {

}