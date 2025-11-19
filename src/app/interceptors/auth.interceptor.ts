import { Injectable } from "@angular/core";
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from "@angular/common/http";
import { catchError, Observable } from "rxjs";
import { SecurityService } from "../services/security.service";
import { Router } from "@angular/router";
import Swal from "sweetalert2";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private securityService: SecurityService,
    private router: Router
  ) {}

  intercept(  // Implementamos el método intercept y definimos sus parámetros
    request: HttpRequest<unknown>, // Implementamos el método intercept y definimos sus parámetros
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    let theUser = this.securityService.activeUserSession;
    const token = theUser["token"];
    // Si la solicitud es para la ruta de "login", no adjuntes el token
    if (
      request.url.includes("/login") ||
      request.url.includes("/token-validation")
    ) {
      console.log("no se pone token");
      return next.handle(request);
    } else {
      console.log("colocando token " + token);
      // Adjunta el token a la solicitud
      const authRequest = request.clone({
        setHeaders: { // Establece los encabezados de la solicitud HTTP
          Authorization: `Bearer ${token}`, // Agrega el token de autorización en el encabezado
        },
      });
      return next.handle(authRequest).pipe( // Maneja la solicitud HTTP modificada
        catchError((err: HttpErrorResponse) => { // Captura errores HTTP en la respuesta
          if (err.status === 401) { // Si el error es 401 (No autorizado)
            Swal.fire({ // Muestra una alerta de SweetAlert2
              title: "No está autorizado para esta operación", // Título de la alerta y mensaje
              icon: "error", // Icono de error
              timer: 5000, // Duración de la alerta en milisegundos
            });
            this.router.navigateByUrl("/dashboard"); // Redirige al usuario al dashboard
          } else if (err.status === 400) { // Si el error es 400 (Solicitud incorrecta)
            Swal.fire({ // Muestra una alerta de SweetAlert2
              title: "Existe un error, contacte al administrador", // Título de la alerta y mensaje
              icon: "error", // Icono de error
              timer: 5000, // Duración de la alerta en milisegundos
            });
          }

          return new Observable<never>();
        })
      );
    }
    // Continúa con la solicitud modificada
  }
}
