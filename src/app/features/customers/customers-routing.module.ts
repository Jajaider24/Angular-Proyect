import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { CustomersListComponent } from "./customers-list.component";
import { CustomersComponent } from "./customers.component";

const routes: Routes = [
  {
    path: "",
    component: CustomersComponent,
    children: [{ path: "", component: CustomersListComponent }],
  },
];

@NgModule({ imports: [RouterModule.forChild(routes)], exports: [RouterModule] })
export class CustomersRoutingModule {}
