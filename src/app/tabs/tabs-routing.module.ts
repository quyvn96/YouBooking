import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'home',
        children: [
          {
            path: '',
            loadChildren: () => import('../home/home.module').then(m => m.HomePageModule)
          },
          {
            path: ':categoryId',
            loadChildren: () => import('../home/categories/categories.module').then(m => m.CategoriesPageModule)
          },
          {
            path: ':categoryId/:placeId',
            loadChildren: () => import('../home/categories/place-detail/place-detail.module').then(m => m.PlaceDetailPageModule)
          }
        ]
      },
      {
        path: 'offers',
        children: [
          {
            path: '',
            loadChildren: () => import('../offers/offers.module').then(m => m.OffersPageModule)
          },
          {
            path: 'new',
            loadChildren: () => import('../offers/new-offer/new-offer.module').then(m => m.NewOfferPageModule)
          },
          {
            path: 'edit/:placeId',
            loadChildren: () => import('../offers/edit-offer/edit-offer.module').then(m => m.EditOfferPageModule)
          }
        ]
      },
      {
        path: 'bookings',
        children: [
          {
            path: '',
            loadChildren: () => import('../bookings/bookings.module').then(m => m.BookingsPageModule)
          }
        ]
      },
      {
        path: 'settings',
        children: [
          {
            path: '',
            loadChildren: () => import('../settings/settings.module').then(m => m.SettingsPageModule)
          }
        ]
      },
      {
        path: '',
        redirectTo: '/tabs/home',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/home',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsPageRoutingModule { }
