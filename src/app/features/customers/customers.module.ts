import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { SharedModule } from "src/app/shared/shared.module";
import { CustomersListComponent } from "./customers-list.component";
import { CustomersRoutingModule } from "./customers-routing.module";
import { CustomersComponent } from "./customers.component";

@NgModule({
  declarations: [CustomersComponent, CustomersListComponent],
  imports: [CommonModule, FormsModule, CustomersRoutingModule, SharedModule],
})
export class CustomersModule {}
