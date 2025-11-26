import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { SharedModule } from "src/app/shared/shared.module";
import { MenusListComponent } from "./menus-list.component";
import { MenusRoutingModule } from "./menus-routing.module";
import { MenusComponent } from "./menus.component";

@NgModule({
  declarations: [MenusComponent, MenusListComponent],
  imports: [CommonModule, FormsModule, MenusRoutingModule, SharedModule],
})
export class MenusModule {}
