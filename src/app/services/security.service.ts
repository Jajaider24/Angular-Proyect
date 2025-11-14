import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { environment } from "src/environments/environment";
import { User } from "../models/User";

@Injectable({
  providedIn: "root",
})
export class SecurityService {  // Servicio para manejar la seguridad y autenticación de usuarios y sesiones y almacenamiento en local storage
  theUser = new BehaviorSubject<User>(new User()); // Objeto BehaviorSubject para almacenar la información del usuario logueado
  constructor(private http: HttpClient) { // Inyección de dependencias del cliente HTTP para realizar peticiones al backend
    this.verifyActualSession(); // Verifica si hay una sesión activa al inicializar el servicio
  }

  /**
   * Realiza la petición al backend con el correo y la contraseña
   * para verificar si existe o no en la plataforma
   * @param infoUsuario JSON con la información de correo y contraseña
   * @returns Respuesta HTTP la cual indica si el usuario tiene permiso de acceso
   */
  login(user: User): Observable<any> { // Método para iniciar sesión del usuario y enviar sus credenciales al backend
    return this.http.post<any>(`${environment.url_security}/login`, user); // Realiza una petición POST al endpoint de login del backend con la información del usuario
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
      token: dataSesion["token"],
    };
    localStorage.setItem("sesion", JSON.stringify(data)); // Guarda la información del usuario en el local storage del navegador
    this.setUser(data); // Actualiza la información del usuario en el BehaviorSubject
  }
  /**
   * Permite actualizar la información del usuario
   * que acabó de validarse correctamente
   * @param user información del usuario logueado
   */
  setUser(user: User) { // Método para actualizar la información del usuario logueado
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
    let actualSesion = this.getSessionData();
    if (actualSesion) {
      this.setUser(JSON.parse(actualSesion));
    }
  }
  /**
   * Verifica si hay una sesion activa
   * @returns
   */
  existSession(): boolean {
    let sesionActual = this.getSessionData();
    return sesionActual ? true : false;
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
