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
export class AuthenticationGuard implements CanActivate {
  constructor(
    private securityService: SecurityService, // Inyectamos el servicio de seguridad y el router
    private router: Router // Inyectamos el servicio de seguridad y el router
  ) {}

  canActivate(
    // Implementamos el método canActivate
    route: ActivatedRouteSnapshot, // Implementamos el método canActivate y definimos sus parámetros
    state: RouterStateSnapshot // Implementamos el método canActivate y definimos sus parámetros
  ):
    | Observable<boolean | UrlTree> // Implementamos el método canActivate y definimos su tipo de retorno
    | Promise<boolean | UrlTree> // Implementamos el método canActivate y definimos su tipo de retorno
    | boolean
    | UrlTree {
    const exists = this.securityService.existSession();
    console.log(
      "AuthenticationGuard: existSession() =>",
      exists,
      "route:",
      state.url
    );
    if (exists) {
      return true;
    } else {
      // Use replaceUrl to avoid extra history entries
      console.warn("AuthenticationGuard: no session, redirecting to /login");
      this.router.navigate(["/login"], { replaceUrl: true });
      return false;
    }
  }
}
