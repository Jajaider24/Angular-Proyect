import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { MenusListComponent } from "./menus-list.component";
import { MenusComponent } from "./menus.component";
import { MenusFormComponent } from "./menus-form.component";
import { MenusDetailComponent } from "./menus-detail.component";

const routes: Routes = [
  {
    path: "",
    component: MenusComponent,
    children: [
      { path: "", component: MenusListComponent },
      { path: "create", component: MenusFormComponent },
      { path: ":id", component: MenusDetailComponent },
      { path: ":id/edit", component: MenusFormComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MenusRoutingModule {}
