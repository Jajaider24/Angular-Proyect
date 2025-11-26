import { Component } from "@angular/core";

/**
 * Componente contenedor principal del módulo Addresses.
 * Sirve como layout wrapper para todas las vistas hijas (list, detail, form).
 *
 * Este componente no tiene lógica compleja, solo actúa como punto de anidación
 * para las rutas hijas mediante <router-outlet>.
 *
 * Podría extenderse para incluir:
 * - Breadcrumbs compartidos
 * - Header con acciones globales
 * - Sidebar con filtros persistentes
 */
@Component({
  selector: "app-addresses",
  templateUrl: "./addresses.component.html",
  styleUrls: ["./addresses.component.scss"],
})
export class AddressesComponent {
  constructor() {}
}
