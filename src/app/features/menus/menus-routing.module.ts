import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { MenusListComponent } from "./menus-list.component";
import { MenusComponent } from "./menus.component";

const routes: Routes = [
  {
    path: "",
    component: MenusComponent,
    children: [{ path: "", component: MenusListComponent }],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MenusRoutingModule {}
