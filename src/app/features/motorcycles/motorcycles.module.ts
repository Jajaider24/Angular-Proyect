import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { SharedModule } from "src/app/shared/shared.module";
import { MotorcyclesDetailComponent } from "./motorcycles-detail.component";
import { MotorcyclesFormComponent } from "./motorcycles-form.component";
import { MotorcyclesListComponent } from "./motorcycles-list.component";
import { MotorcyclesRoutingModule } from "./motorcycles-routing.module";
import { MotorcyclesComponent } from "./motorcycles.component";

/**
 * Módulo feature para gestión completa de Motorcycles (Motocicletas).
 * Gestiona la flota de motos disponibles para delivery.
 *
 * Campos clave:
 * - license_plate: Placa única de identificación
 * - brand: Marca de la moto
 * - year: Año de fabricación
 * - status: Estado (available, in_use, maintenance)
 *
 * Relaciones:
 * - Una moto puede tener múltiples Orders asignadas
 * - Una moto puede tener múltiples Shifts (turnos)
 * - Una moto puede tener múltiples Issues (incidencias)
 */
@NgModule({
  declarations: [
    MotorcyclesComponent,
    MotorcyclesListComponent,
    MotorcyclesDetailComponent,
    MotorcyclesFormComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MotorcyclesRoutingModule,
    SharedModule,
  ],
})
export class MotorcyclesModule {}
