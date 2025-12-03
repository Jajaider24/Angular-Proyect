import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";

import { SharedModule } from "src/app/shared/shared.module";
import { ShiftsDetailComponent } from "./shifts-detail.component";
import { ShiftsFormComponent } from "./shifts-form.component";
import { ShiftsListComponent } from "./shifts-list.component";
import { ShiftsRoutingModule } from "./shifts-routing.module";

@NgModule({
  declarations: [
    ShiftsListComponent,
    ShiftsDetailComponent,
    ShiftsFormComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    ShiftsRoutingModule,
    SharedModule,
  ],
})
export class ShiftsModule {}
