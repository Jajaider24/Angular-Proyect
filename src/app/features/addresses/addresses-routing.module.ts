import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AddressesDetailComponent } from "./addresses-detail.component";
import { AddressesFormComponent } from "./addresses-form.component";
import { AddressesListComponent } from "./addresses-list.component";
import { AddressesComponent } from "./addresses.component";

/**
 * Configuración de rutas para el módulo de Addresses.
 *
 * Estructura de rutas:
 * /addresses          -> Listado de todas las direcciones
 * /addresses/create   -> Formulario para crear nueva dirección
 * /addresses/:id      -> Detalle de una dirección específica
 * /addresses/:id/edit -> Formulario para editar dirección existente
 *
 * Todas estas rutas son hijas del componente contenedor AddressesComponent
 * que provee el layout común (header, breadcrumbs, etc.)
 */
const routes: Routes = [
  {
    path: "",
    component: AddressesComponent,
    children: [
      {
        path: "",
        component: AddressesListComponent,
        data: { title: "Direcciones" },
      },
      {
        path: "create",
        component: AddressesFormComponent,
        data: { title: "Nueva Dirección" },
      },
      {
        path: ":id",
        component: AddressesDetailComponent,
        data: { title: "Detalle de Dirección" },
      },
      {
        path: ":id/edit",
        component: AddressesFormComponent,
        data: { title: "Editar Dirección" },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddressesRoutingModule {}
