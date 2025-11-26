import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { SharedModule } from "src/app/shared/shared.module";
import { AddressesDetailComponent } from "./addresses-detail.component";
import { AddressesFormComponent } from "./addresses-form.component";
import { AddressesListComponent } from "./addresses-list.component";
import { AddressesRoutingModule } from "./addresses-routing.module";
import { AddressesComponent } from "./addresses.component";

/**
 * Módulo feature para gestión completa de Addresses (Direcciones de entrega).
 * Proporciona CRUD completo con lazy loading para optimizar carga inicial.
 * 
 * Componentes incluidos:
 * - AddressesComponent: Contenedor principal con layout
 * - AddressesListComponent: Listado con búsqueda, filtros y paginación
 * - AddressesDetailComponent: Vista detallada de una dirección
 * - AddressesFormComponent: Formulario para crear/editar con validaciones reactivas
 * 
 * Este módulo se carga de forma diferida (lazy) cuando el usuario navega a /addresses
 */
@NgModule({
  declarations: [
    AddressesComponent,
    AddressesListComponent,
    AddressesDetailComponent,
    AddressesFormComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AddressesRoutingModule,
    SharedModule,
  ],
})
export class AddressesModule {}
