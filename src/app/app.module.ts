import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouterModule } from "@angular/router";

import { AppComponent } from "./app.component";
import { AdminLayoutComponent } from "./layouts/admin-layout/admin-layout.component";
import { AuthLayoutComponent } from "./layouts/auth-layout/auth-layout.component";

import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

// Importamos solo los iconos de Lucide que realmente usamos en el sidebar
import {
  ShoppingBag,
  Package,
  BookOpen,
  Users,
  ShoppingCart,
  MapPin,
  Bike,
  UserCircle,
  CalendarDays,
  AlertCircle,
  Camera,
  BarChart3
} from "lucide-angular";
import { LucideAngularModule } from "lucide-angular";
import { AppRoutingModule } from "./app-routing.module";
import { ComponentsModule } from "./components/components.module";
import { CoreModule } from "./core/core.module";
import { AuthInterceptor } from "./interceptors/auth.interceptor";
import { AutoRippleService } from "./shared/directives/auto-ripple.service";
import { SharedModule } from "./shared/shared.module";

@NgModule({
  imports: [
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    ComponentsModule,
    NgbModule,
    // Register Lucide icons (solo los que usamos para optimizar el bundle)
    LucideAngularModule.pick({
      ShoppingBag,
      Package,
      BookOpen,
      Users,
      ShoppingCart,
      MapPin,
      Bike,
      UserCircle,
      CalendarDays,
      AlertCircle,
      Camera,
      BarChart3
    }),
    RouterModule,
    AppRoutingModule,
    CoreModule,
    SharedModule,
  ],
  declarations: [AppComponent, AdminLayoutComponent, AuthLayoutComponent],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true, // 👈 importante: permite múltiples interceptores
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  // inject AutoRippleService so it is instantiated at app startup
  constructor(private _autoRipple: AutoRippleService) {}
}
