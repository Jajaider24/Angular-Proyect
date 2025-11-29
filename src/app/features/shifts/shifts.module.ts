import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";

import { ShiftsRoutingModule } from "./shifts-routing.module";
import { ShiftsListComponent } from "./shifts-list.component";

@NgModule({
  declarations: [ShiftsListComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, ShiftsRoutingModule],
})
export class ShiftsModule {}
