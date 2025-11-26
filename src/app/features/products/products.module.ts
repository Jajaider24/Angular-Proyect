import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { SharedModule } from "src/app/shared/shared.module";
import { ProductsFormComponent } from "./products-form.component";
import { ProductsListComponent } from "./products-list.component";
import { ProductsRoutingModule } from "./products-routing.module";
import { ProductsComponent } from "./products.component";

@NgModule({
  declarations: [
    ProductsComponent,
    ProductsListComponent,
    ProductsFormComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ProductsRoutingModule,
    SharedModule,
  ],
})
export class ProductsModule {}
