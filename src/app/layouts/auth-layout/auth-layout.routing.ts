import { Routes } from "@angular/router";

import { NoAuthenticationGuard } from "src/app/guards/no-authentication.guard";
import { LoginComponent } from "../../pages/login/login.component";
import { RegisterComponent } from "../../pages/register/register.component";

export const AuthLayoutRoutes: Routes = [
  {
    path: "login",
    component: LoginComponent,
    canActivate: [NoAuthenticationGuard],
  },
  {
    path: "register",
    component: RegisterComponent,
    canActivate: [NoAuthenticationGuard],
  },
];
