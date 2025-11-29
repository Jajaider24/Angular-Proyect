import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { SharedModule } from "src/app/shared/shared.module";
import { CustomersListComponent } from "./customers-list.component";
import { CustomersRoutingModule } from "./customers-routing.module";
import { CustomersComponent } from "./customers.component";
import { ReactiveFormsModule } from "@angular/forms";
import { CustomersFormComponent } from "./customers-form.component";
import { CustomersDetailComponent } from "./customers-detail.component";

@NgModule({
  declarations: [CustomersComponent, CustomersListComponent, CustomersFormComponent, CustomersDetailComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, CustomersRoutingModule, SharedModule],
})
export class CustomersModule {}
