import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
// Importar el módulo de Lucide Icons para usar iconos SVG modernos
import { LucideAngularModule, BarChart3, Package, ShoppingBag, Users, FileText, MapPin, Bike, UserCircle, Calendar, AlertCircle, Image } from "lucide-angular";
import { RippleDirective } from "../shared/directives/ripple.directive";
import { FooterComponent } from "./footer/footer.component";
import { NavbarComponent } from "./navbar/navbar.component";
import { SidebarComponent } from "./sidebar/sidebar.component";

@NgModule({
  imports: [
    CommonModule, 
    RouterModule, 
    NgbModule,
    // Registrar el módulo de Lucide con los iconos específicos que usamos en el sidebar
    LucideAngularModule.pick({ 
      BarChart3,      // Icono para gráficos/dashboard
      Package,        // Icono para productos
      ShoppingBag,    // Icono para restaurantes
      Users,          // Icono para clientes
      FileText,       // Icono para órdenes
      MapPin,         // Icono para direcciones
      Bike,           // Icono para motos
      UserCircle,     // Icono para conductores
      Calendar,       // Icono para turnos
      AlertCircle,    // Icono para incidencias
      Image           // Icono para fotos
    })
  ],
  declarations: [
    FooterComponent,
    NavbarComponent,
    SidebarComponent,
    RippleDirective,
  ],
  exports: [
    FooterComponent,
    NavbarComponent,
    SidebarComponent,
    RippleDirective,
  ],
})
export class ComponentsModule {}
