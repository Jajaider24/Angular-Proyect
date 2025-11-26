import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { SharedModule } from "src/app/shared/shared.module";
import { OrdersListComponent } from "./orders-list.component";
import { OrdersRoutingModule } from "./orders-routing.module";
import { OrdersComponent } from "./orders.component";

@NgModule({
  declarations: [OrdersComponent, OrdersListComponent],
  imports: [CommonModule, FormsModule, OrdersRoutingModule, SharedModule],
})
export class OrdersModule {}
