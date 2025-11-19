import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { RestaurantsRoutingModule } from './restaurants-routing.module';
import { RestaurantsComponent } from './restaurants.component';
import { RestaurantsListComponent } from './restaurants-list.component';
import { RestaurantsDetailComponent } from './restaurants-detail.component';
import { RestaurantsFormComponent } from './restaurants-form.component';


@NgModule({
  declarations: [
    RestaurantsComponent,
    RestaurantsListComponent,
    RestaurantsDetailComponent,
    RestaurantsFormComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RestaurantsRoutingModule,
  ],
})
export class RestaurantsModule {}
