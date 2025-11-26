import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { DriversDetailComponent } from "./drivers-detail.component";
import { DriversFormComponent } from "./drivers-form.component";
import { DriversListComponent } from "./drivers-list.component";
import { DriversComponent } from "./drivers.component";

const routes: Routes = [
  {
    path: "",
    component: DriversComponent,
    children: [
      { path: "", component: DriversListComponent },
      { path: "create", component: DriversFormComponent },
      { path: ":id", component: DriversDetailComponent },
      { path: ":id/edit", component: DriversFormComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DriversRoutingModule {}
