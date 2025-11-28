import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { OrdersListComponent } from "./orders-list.component";
import { OrdersComponent } from "./orders.component";
import { OrdersMapComponent } from "./orders-map.component";
import { OrdersFormComponent } from "./orders-form.component";
import { OrdersDetailComponent } from "./orders-detail.component";

const routes: Routes = [
  {
    path: "",
    component: OrdersComponent,
    children: [
      { path: "", component: OrdersListComponent },
      { path: "map", component: OrdersMapComponent },
      { path: "create", component: OrdersFormComponent },
      { path: ":id", component: OrdersDetailComponent },
      { path: ":id/edit", component: OrdersFormComponent },
    ],
  },
];

@NgModule({ imports: [RouterModule.forChild(routes)], exports: [RouterModule] })
export class OrdersRoutingModule {}
