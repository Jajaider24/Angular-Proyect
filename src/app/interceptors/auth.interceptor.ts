import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { catchError, Observable, throwError } from "rxjs";
import Swal from "sweetalert2";
import { SecurityService } from "../services/security.service";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private securityService: SecurityService,
    private router: Router
  ) {}

  intercept(
    // Implementamos el método intercept y definimos sus parámetros
    request: HttpRequest<unknown>, // Implementamos el método intercept y definimos sus parámetros
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const theUser = this.securityService.activeUserSession || {};
    const token = theUser["token"];

    // No añadir token en llamadas públicas (login/token-validation)
    const isPublic =
      request.url.includes("/login") ||
      request.url.includes("/token-validation");

    const authRequest =
      isPublic || !token
        ? request
        : request.clone({
            setHeaders: {
              Authorization: `Bearer ${token}`,
            },
          });

    if (!isPublic) {
      console.log(
        token
          ? "Adjuntando Authorization header"
          : "No hay token disponible para adjuntar"
      );
    }

    return next.handle(authRequest).pipe(
      catchError((err: HttpErrorResponse) => {
        // Loguear errores y repropagarlos; no forzamos logout/navegación aquí
        if (err.status === 401) {
          console.warn("AuthInterceptor: 401 recibido", err.message || err);
          try {
            Swal.fire({
              title: "No autorizado",
              text: "La acción requiere autenticación.",
              icon: "warning",
              timer: 3000,
            });
          } catch (e) {
            console.warn("No se pudo mostrar Swal", e);
          }
        } else if (err.status === 400) {
          console.warn("AuthInterceptor: 400 recibido", err.message || err);
        }

        return throwError(() => err);
      })
    );
    // Continúa con la solicitud modificada
  }
}
