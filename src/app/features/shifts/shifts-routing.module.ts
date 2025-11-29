import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ShiftsListComponent } from "./shifts-list.component";
import { ShiftsDetailComponent } from "./shifts-detail.component";
import { ShiftsFormComponent } from "./shifts-form.component";

const routes: Routes = [
  { path: "", component: ShiftsListComponent },
  { path: "create", component: ShiftsFormComponent },
  { path: ":id", component: ShiftsDetailComponent },
  { path: ":id/edit", component: ShiftsFormComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ShiftsRoutingModule {}
