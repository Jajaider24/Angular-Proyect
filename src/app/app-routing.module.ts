import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule, Routes } from "@angular/router";

import { AuthenticationGuard } from "./guards/authentication.guard";
import { NoAuthenticationGuard } from "./guards/no-authentication.guard";
import { AdminLayoutComponent } from "./layouts/admin-layout/admin-layout.component";
import { AuthLayoutComponent } from "./layouts/auth-layout/auth-layout.component";

const routes: Routes = [
  // Ruta raíz: decide según si hay sesión (los guards lo gestionan)
  {
    path: "",
    redirectTo: "login",
    pathMatch: "full",
  },
  {
    path: "",
    component: AdminLayoutComponent,
    canActivate: [AuthenticationGuard],
    children: [
      {
        path: "",
        loadChildren: () =>
          import("src/app/layouts/admin-layout/admin-layout.module").then(
            (m) => m.AdminLayoutModule
          ),
      },
    ],
  },
  {
    path: "",
    component: AuthLayoutComponent,
    canActivate: [NoAuthenticationGuard],
    children: [
      {
        path: "",
        loadChildren: () =>
          import("src/app/layouts/auth-layout/auth-layout.module").then(
            (m) => m.AuthLayoutModule
          ),
      },
    ],
  },
  {
    path: "restaurants",
    canActivate: [AuthenticationGuard],
    loadChildren: () =>
      import("./features/restaurants/restaurants.module").then(
        (m) => m.RestaurantsModule
      ),
  },
  {
    path: "products",
    canActivate: [AuthenticationGuard],
    loadChildren: () =>
      import("./features/products/products.module").then(
        (m) => m.ProductsModule
      ),
  },
  {
    path: "menus",
    canActivate: [AuthenticationGuard],
    loadChildren: () =>
      import("./features/menus/menus.module").then((m) => m.MenusModule),
  },
  {
    path: "customers",
    canActivate: [AuthenticationGuard],
    loadChildren: () =>
      import("./features/customers/customers.module").then(
        (m) => m.CustomersModule
      ),
  },
  {
    path: "orders",
    canActivate: [AuthenticationGuard],
    loadChildren: () =>
      import("./features/orders/orders.module").then((m) => m.OrdersModule),
  },
  {
    path: "**",
    redirectTo: "login",
  },
];

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    RouterModule.forRoot(routes, {
      useHash: true,
    }),
  ],
  exports: [],
})
export class AppRoutingModule {}
