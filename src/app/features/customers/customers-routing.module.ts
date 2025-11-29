import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { CustomersListComponent } from "./customers-list.component";
import { CustomersComponent } from "./customers.component";
import { CustomersFormComponent } from "./customers-form.component";
import { CustomersDetailComponent } from "./customers-detail.component";

const routes: Routes = [
  {
    path: "",
    component: CustomersComponent,
    children: [
      { path: "", component: CustomersListComponent },
      { path: "create", component: CustomersFormComponent },
      { path: ":id", component: CustomersDetailComponent },
      { path: ":id/edit", component: CustomersFormComponent },
    ],
  },
];

@NgModule({ imports: [RouterModule.forChild(routes)], exports: [RouterModule] })
export class CustomersRoutingModule {}
