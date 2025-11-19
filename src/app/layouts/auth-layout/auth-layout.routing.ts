import { Routes } from "@angular/router";

import { NoAuthenticationGuard } from "src/app/guards/no-authentication.guard";
import { LoginComponent } from "../../pages/login/login.component";

export const AuthLayoutRoutes: Routes = [
  {
    path: "login",
    component: LoginComponent,
    canActivate: [NoAuthenticationGuard],
  },
  { path: "", redirectTo: "login", pathMatch: "full" },
];
