import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { GoogleMapsModule } from "@angular/google-maps";
import { SharedModule } from "src/app/shared/shared.module";
import { OrdersListComponent } from "./orders-list.component";
import { OrdersRoutingModule } from "./orders-routing.module";
import { OrdersComponent } from "./orders.component";
import { OrdersMapComponent } from "./orders-map.component";
import { OrdersFormComponent } from "./orders-form.component";
import { OrdersDetailComponent } from "./orders-detail.component";

@NgModule({
  declarations: [
    OrdersComponent,
    OrdersListComponent,
    OrdersMapComponent,
    OrdersFormComponent,
    OrdersDetailComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    OrdersRoutingModule,
    SharedModule,
  ],
})
export class OrdersModule {}
