import { Component, OnInit } from '@angular/core';
import { Category } from '../models/category.model';
import { HomeService } from './home.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit{
  categories: Category[];
  constructor(private homeService: HomeService) {}
  ngOnInit(){
     this.homeService.getCategories().subscribe((response: Category[]) => {
        this.categories = response;
     });
  }
}
