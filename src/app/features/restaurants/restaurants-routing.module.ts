import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RestaurantsComponent } from './restaurants.component';
import { RestaurantsListComponent } from './restaurants-list.component';
import { RestaurantsDetailComponent } from './restaurants-detail.component';
import { RestaurantsFormComponent } from './restaurants-form.component';

const routes: Routes = [
  {
    path: '',
    component: RestaurantsComponent,
    children: [
      { path: '', component: RestaurantsListComponent },
      { path: 'create', component: RestaurantsFormComponent },
      { path: ':id', component: RestaurantsDetailComponent },
      { path: ':id/edit', component: RestaurantsFormComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RestaurantsRoutingModule {}
