import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ShiftsListComponent } from "./shifts-list.component";

const routes: Routes = [
  { path: "", component: ShiftsListComponent },
  { path: "create", component: ShiftsListComponent }, // placeholder for create route until form exists
  { path: ":id", component: ShiftsListComponent }, // placeholder for detail route
  { path: ":id/edit", component: ShiftsListComponent }, // placeholder for edit route
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ShiftsRoutingModule {}
