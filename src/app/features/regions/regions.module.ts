import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";

import { RegionsRoutingModule } from "./regions.routing";
import { RegionsComponent } from "./regions.component";

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, RouterModule, RegionsRoutingModule],
  declarations: [RegionsComponent],
})
export class RegionsModule {}
