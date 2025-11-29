import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";

import { ShiftsRoutingModule } from "./shifts-routing.module";
import { ShiftsListComponent } from "./shifts-list.component";
import { ShiftsDetailComponent } from "./shifts-detail.component";
import { ShiftsFormComponent } from "./shifts-form.component";

@NgModule({
  declarations: [ShiftsListComponent, ShiftsDetailComponent, ShiftsFormComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, ShiftsRoutingModule],
})
export class ShiftsModule {}
