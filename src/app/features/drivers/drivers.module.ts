import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { SharedModule } from "src/app/shared/shared.module";
import { DriversDetailComponent } from "./drivers-detail.component";
import { DriversFormComponent } from "./drivers-form.component";
import { DriversListComponent } from "./drivers-list.component";
import { DriversRoutingModule } from "./drivers-routing.module";
import { DriversComponent } from "./drivers.component";

/**
 * Módulo para gestión completa de Drivers (Conductores/Repartidores).
 * 
 * Campos clave:
 * - name: Nombre completo del conductor
 * - license_number: Número de licencia (único)
 * - phone: Teléfono de contacto
 * - email: Email (opcional)
 * - status: available|on_shift|unavailable
 */
@NgModule({
  declarations: [
    DriversComponent,
    DriversListComponent,
    DriversDetailComponent,
    DriversFormComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DriversRoutingModule,
    SharedModule,
  ],
})
export class DriversModule {}
