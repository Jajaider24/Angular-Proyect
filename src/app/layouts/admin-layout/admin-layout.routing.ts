import { Routes } from "@angular/router";

import { DashboardComponent } from "../../pages/dashboard/dashboard.component";
export const AdminLayoutRoutes: Routes = [
  { path: "dashboard", component: DashboardComponent },
  { path: "", redirectTo: "dashboard", pathMatch: "full" },
  // feature modules routed inside the admin layout so sidebar keeps the layout
  {
    path: "restaurants",
    loadChildren: () =>
      import("../../features/restaurants/restaurants.module").then(
        (m) => m.RestaurantsModule
      ),
  },
  {
    path: "products",
    loadChildren: () =>
      import("../../features/products/products.module").then(
        (m) => m.ProductsModule
      ),
  },
  {
    path: "menus",
    loadChildren: () =>
      import("../../features/menus/menus.module").then((m) => m.MenusModule),
  },
  {
    path: "customers",
    loadChildren: () =>
      import("../../features/customers/customers.module").then(
        (m) => m.CustomersModule
      ),
  },
  {
    path: "orders",
    loadChildren: () =>
      import("../../features/orders/orders.module").then((m) => m.OrdersModule),
  },
  {
    path: "reports",
    loadChildren: () =>
      import("../../features/reports/reports.module").then(
        (m) => m.ReportsModule
      ),
  },
  // ===== NUEVOS MÓDULOS CRUD =====
  // Direcciones de entrega asociadas a órdenes
  {
    path: "addresses",
    loadChildren: () =>
      import("../../features/addresses/addresses.module").then(
        (m) => m.AddressesModule
      ),
  },
  // Gestión de flota de motocicletas
  {
    path: "motorcycles",
    loadChildren: () =>
      import("../../features/motorcycles/motorcycles.module").then(
        (m) => m.MotorcyclesModule
      ),
  },
  // Gestión de conductores/repartidores
  {
    path: "drivers",
    loadChildren: () =>
      import("../../features/drivers/drivers.module").then(
        (m) => m.DriversModule
      ),
  },
  // TODO: Descomentar cuando se creen los módulos
  // // Turnos de trabajo (conductor + moto)
  {
    path: "shifts",
    loadChildren: () =>
      import("../../features/shifts/shifts.module").then((m) => m.ShiftsModule),
  },
  // // Incidencias/problemas de las motos
  // {
  //   path: "issues",
  //   loadChildren: () =>
  //     import("../../features/issues/issues.module").then((m) => m.IssuesModule),
  // },
  // // Fotos de evidencia de incidencias
  // {
  //   path: "photos",
  //   loadChildren: () =>
  //     import("../../features/photos/photos.module").then((m) => m.PhotosModule),
  // },
];
