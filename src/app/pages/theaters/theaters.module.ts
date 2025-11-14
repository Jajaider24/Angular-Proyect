import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";

import { ListComponent } from "./list/list.component";
import { ManageComponent } from "./manage/manage.component";
import { TheatersRoutingModule } from "./theaters-routing.module";

@NgModule({
  declarations: [ListComponent, ManageComponent],
  imports: [CommonModule, TheatersRoutingModule, ReactiveFormsModule],
})
export class TheatersModule {}
