import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { SharedModule } from "src/app/shared/shared.module";
import { MenusListComponent } from "./menus-list.component";
import { MenusRoutingModule } from "./menus-routing.module";
import { MenusComponent } from "./menus.component";
import { ReactiveFormsModule } from "@angular/forms";
import { MenusFormComponent } from "./menus-form.component";
import { MenusDetailComponent } from "./menus-detail.component";

@NgModule({
  declarations: [MenusComponent, MenusListComponent, MenusFormComponent, MenusDetailComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MenusRoutingModule, SharedModule],
})
export class MenusModule {}
