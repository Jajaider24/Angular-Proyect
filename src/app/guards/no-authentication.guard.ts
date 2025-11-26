import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from "@angular/router";
import { Observable } from "rxjs";
import { SecurityService } from "../services/security.service";

@Injectable({
  providedIn: "root",
})
export class NoAuthenticationGuard implements CanActivate {
  constructor(
    private securityService: SecurityService,
    private router: Router
  ) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    if (!this.securityService.existSession()) {
      // Verifica si no existe una sesión activa
      return true; // Permite el acceso a la ruta si no hay sesión activa
    } else {
      // Reemplazamos la URL para evitar que el usuario vuelva atrás al login
      this.router.navigate(["/dashboard"], { replaceUrl: true }); // Redirige al dashboard si hay una sesión activa
      return false; // No permite el acceso a la ruta si hay sesión activa
    }
  }
}
