import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { OrdersListComponent } from "./orders-list.component";
import { OrdersComponent } from "./orders.component";

const routes: Routes = [
  {
    path: "",
    component: OrdersComponent,
    children: [{ path: "", component: OrdersListComponent }],
  },
];

@NgModule({ imports: [RouterModule.forChild(routes)], exports: [RouterModule] })
export class OrdersRoutingModule {}
