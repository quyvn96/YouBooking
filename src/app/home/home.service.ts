import { Injectable } from '@angular/core';
import { DataService } from '../shared/data.service';
import { SystemConstant } from '../shared/constants/system.constant';
import { Category } from '../models/category.model';


@Injectable({
  providedIn: 'root'
})
export class HomeService {

  constructor(private dataSevice: DataService) { }

  getCategories() {
    return this.dataSevice.get(`${SystemConstant.DefaultUrl.fireBaseApi}categories.json`);
  }
}
