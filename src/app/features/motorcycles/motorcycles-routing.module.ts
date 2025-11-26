import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { MotorcyclesDetailComponent } from "./motorcycles-detail.component";
import { MotorcyclesFormComponent } from "./motorcycles-form.component";
import { MotorcyclesListComponent } from "./motorcycles-list.component";
import { MotorcyclesComponent } from "./motorcycles.component";

const routes: Routes = [
  {
    path: "",
    component: MotorcyclesComponent,
    children: [
      { path: "", component: MotorcyclesListComponent },
      { path: "create", component: MotorcyclesFormComponent },
      { path: ":id", component: MotorcyclesDetailComponent },
      { path: ":id/edit", component: MotorcyclesFormComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MotorcyclesRoutingModule {}
