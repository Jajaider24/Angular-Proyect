import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ProductsFormComponent } from "./products-form.component";
import { ProductsListComponent } from "./products-list.component";
import { ProductsComponent } from "./products.component";
import { ProductsDetailComponent } from "./products-detail.component";

const routes: Routes = [
  {
    path: "",
    component: ProductsComponent,
    children: [
      { path: "", component: ProductsListComponent },
      { path: "create", component: ProductsFormComponent },
      { path: ":id", component: ProductsDetailComponent },
      { path: ":id/edit", component: ProductsFormComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProductsRoutingModule {}
