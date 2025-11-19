import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { SharedModule } from "src/app/shared/shared.module";
import { RestaurantsDetailComponent } from "./restaurants-detail.component";
import { RestaurantsFormComponent } from "./restaurants-form.component";
import { RestaurantsListComponent } from "./restaurants-list.component";
import { RestaurantsRoutingModule } from "./restaurants-routing.module";
import { RestaurantsComponent } from "./restaurants.component";

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
    SharedModule,
  ],
})
export class RestaurantsModule {}
