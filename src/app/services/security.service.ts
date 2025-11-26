import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { map } from "rxjs/operators";

import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { environment } from "src/environments/environment";
import { User } from "../models/User";

@Injectable({
  providedIn: "root",
})
export class SecurityService {
  // Servicio para manejar la seguridad y autenticación de usuarios y sesiones y almacenamiento en local storage
  theUser = new BehaviorSubject<User>(new User()); // Objeto BehaviorSubject para almacenar la información del usuario logueado
  constructor(private http: HttpClient) {
    // Inyección de dependencias del cliente HTTP para realizar peticiones al backend
    this.verifyActualSession(); // Verifica si hay una sesión activa al inicializar el servicio
  }

  /**
   * Realiza la petición al backend con el correo y la contraseña
   * para verificar si existe o no en la plataforma
   * @param infoUsuario JSON con la información de correo y contraseña
   * @returns Respuesta HTTP la cual indica si el usuario tiene permiso de acceso
   */
  login(user: User): Observable<any> {
    // Método para iniciar sesión del usuario y enviar sus credenciales al backend
    return this.http.post<any>(`${environment.url_security}/login`, user); // Realiza una petición POST al endpoint de login del backend con la información del usuario
  }
  /**
   * Fallback local login: busca un customer por email en el backend
   * y guarda la sesión en localStorage sin requerir cambios backend.
   * Útil para prototipado cuando no existe endpoint /login.
   */
  loginByEmail(email: string) {
    // Llamamos al endpoint de customers y buscamos el email
    return this.http.get<any[]>(`${environment.url_backend}/customers`).pipe(
      map((resp: any) => {
        const found = Array.isArray(resp)
          ? resp.find(
              (u) => u.email && u.email.toLowerCase() === email.toLowerCase()
            )
          : null;
        if (!found) {
          // Si está habilitado el modo de desarrollo, crear una sesión local "comodín"
          if (environment.allowLocalLogin) {
            const fakeId = Math.floor(Date.now() / 1000); // id temporal
            const dataSesion: any = {
              id: fakeId,
              name: email,
              email: email,
              token: "", // Sin token real en este modo
            };
            this.saveSession(dataSesion);
            return dataSesion;
          }
          throw new Error("Usuario no encontrado");
        }
        const dataSesion: any = {
          id: found.id,
          name: found.name || found.email,
          email: found.email,
          token: "", // Sin token real en este modo
        };
        this.saveSession(dataSesion);
        return dataSesion;
      })
    );
  }
  /*
  Guardar la información de usuario en el local storage
  */
  saveSession(dataSesion: any) {
    console.log(dataSesion);
    let data: User = {
      id: dataSesion["id"],
      name: dataSesion["name"],
      email: dataSesion["email"],
      password: "",
      // Prefer explicit token, otherwise fallback to providerAccessToken (GitHub/MS providers)
      token: dataSesion["token"] || dataSesion["providerAccessToken"] || "",
      photoURL: dataSesion["photoURL"] || "",
    };
    localStorage.setItem("sesion", JSON.stringify(data)); // Guarda la información del usuario en el local storage del navegador
    this.setUser(data); // Actualiza la información del usuario en el BehaviorSubject
  }
  /**
   * Permite actualizar la información del usuario
   * que acabó de validarse correctamente
   * @param user información del usuario logueado
   */
  setUser(user: User) {
    // Método para actualizar la información del usuario logueado
    this.theUser.next(user); // Actualiza el valor del BehaviorSubject con la información del usuario logueado
  }
  /**
   * Permite obtener la información del usuario
   * con datos tales como el identificador y el token
   * @returns
   */
  getUser() {
    return this.theUser.asObservable();
  }
  /**
   * Permite obtener la información de usuario
   * que tiene la función activa y servirá
   * para acceder a la información del token
   */
  public get activeUserSession(): User {
    return this.theUser.value;
  }

  /**
   * Permite cerrar la sesión del usuario
   * que estaba previamente logueado
   */
  logout() {
    localStorage.removeItem("sesion"); // Elimina la información de la sesión del local storage
    this.setUser(new User()); //Actualiza por un nuevo usuario vacío
  }
  /**
   * Permite verificar si actualmente en el local storage
   * existe información de un usuario previamente logueado
   */
  verifyActualSession() {
    // En modo dev (allowLocalLogin), no restauramos sesiones antiguas para
    // obligar siempre a un nuevo inicio de sesión al recargar la app.
    if (environment.allowLocalLogin) {
      this.logout();
      return;
    }

    const actualSesion = this.getSessionData();
    if (actualSesion) {
      try {
        this.setUser(JSON.parse(actualSesion));
      } catch {
        this.logout();
      }
    }
  }
  /**
   * Verifica si hay una sesion activa
   * @returns
   */
  existSession(): boolean {
    // Método para verificar si existe una sesión activa
    let sesionActual = this.getSessionData(); // Obtiene la información de la sesión del local storage
    // Log para depuración: mostrar si hay datos en localStorage y su longitud
    try {
      console.debug(
        "SecurityService.existSession: sesion raw =>",
        sesionActual
      );
      if (sesionActual) {
        const parsed = JSON.parse(sesionActual);
        console.debug("SecurityService.existSession: parsed =>", parsed);
      }
    } catch (e) {
      console.warn(
        "SecurityService.existSession: no se pudo parsear sesion",
        e
      );
    }
    return sesionActual ? true : false; // Retorna true si existe una sesión activa, de lo contrario retorna false
  }
  /**
   * Permite obtener los dato de la sesión activa en el
   * local storage
   * @returns
   */
  getSessionData() {
    let sesionActual = localStorage.getItem("sesion");
    return sesionActual;
  }
}
