import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { BehaviorSubject, Observable } from "rxjs";
import { SecurityService } from "src/app/services/security.service";
import { environment } from "src/environments/environment";

// Firebase modular SDK imports (v9+)
import { initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  getAuth,
  GithubAuthProvider,
  GoogleAuthProvider,
  OAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";

const TOKEN_KEY = "auth_token";

@Injectable({ providedIn: "root" })
export class FirebaseAuthService {
  private _user = new BehaviorSubject<any | null>(null);
  user$: Observable<any | null> = this._user.asObservable();
  // indica si estamos en el proceso de intercambio/validación del token
  private _processing = new BehaviorSubject<boolean>(false);
  processing$: Observable<boolean> = this._processing.asObservable();

  // runtime references
  private firebaseApp: any = null;
  private firebaseAuth: any = null;
  private enabled = false;

  constructor(
    private security: SecurityService,
    private http: HttpClient,
    private router: Router
  ) {
    try {
      // initialize firebase using the config in environment
      this.firebaseApp = initializeApp(environment.firebase);
      this.firebaseAuth = getAuth(this.firebaseApp);
      console.log(
        "Firebase inicializado correctamente con environment.firebase"
      );
      this.enabled = true;

      // listen auth state changes to keep session in sync
      onAuthStateChanged(this.firebaseAuth, async (user: any) => {
        this._user.next(user);
        if (user) {
          const idToken = await user.getIdToken();
          // indicamos que empezamos el intercambio con el backend
          this._processing.next(true);
          // try exchange with backend to obtain application JWT
          try {
            const resp: any = await this.http
              .post(`${environment.url_security}/oauth-login`, {
                provider:
                  user.providerData && user.providerData[0]
                    ? user.providerData[0].providerId
                    : "firebase",
                idToken,
              })
              .toPromise();
            // backend should return { id, name, email, token }
            this.security.saveSession(resp);
            try {
              localStorage.setItem(TOKEN_KEY, resp.token || idToken);
            } catch {}
            // Redirigir al dashboard reemplazando la entrada de historial
            try {
              this.router.navigate(["/dashboard"], { replaceUrl: true });
            } catch (e) {}
          } catch (err) {
            // Mostrar alerta visible para ayudar a detectar problemas de CORS/backend
            try {
              // Import dinámico para evitar romper si sweetalert2 no está instalado
              // (pero por defecto está en package.json de este proyecto)
              // eslint-disable-next-line @typescript-eslint/no-var-requires
              const Swal = require("sweetalert2");
              Swal.fire({
                icon: "warning",
                title: "Error al validar sesión con el backend",
                html: "No se pudo completar el intercambio con el servidor. Verifica CORS o usa el proxy de Angular para el entorno de desarrollo.",
                confirmButtonText: "Entendido",
              });
            } catch (e) {
              console.warn(
                "No se pudo mostrar la alerta (sweetalert2 no disponible)",
                e
              );
            }
            // fallback: save firebase idToken directly
            const dataSesion: any = {
              id: user.uid || null,
              name: user.displayName || user.email,
              email: user.email,
              token: idToken,
            };
            this.security.saveSession(dataSesion);
            try {
              localStorage.setItem(TOKEN_KEY, idToken);
            } catch {}
            try {
              this.router.navigate(["/dashboard"], { replaceUrl: true });
            } catch (e) {}
          } finally {
            // intercambio terminado
            this._processing.next(false);
          }
        } else {
          this.security.logout();
          try {
            localStorage.removeItem(TOKEN_KEY);
          } catch {}
        }
      });
    } catch (err) {
      // if Firebase SDK is not available or init fails, keep app running
      console.warn(
        "Inicialización de Firebase fallida. Verifica que 'firebase' esté instalado y que environment.firebase esté configurado.",
        err
      );
      this.enabled = false;
    }
  }

  private ensureEnabled() {
    if (!this.enabled)
      throw new Error(
        "Firebase no está inicializado. Ejecuta `npm install` y reinicia el servidor de desarrollo."
      );
  }

  /**
   * Inicia sesión con Google mediante popup y guarda la sesión en el SecurityService
   */
  async signInWithGoogle(): Promise<any> {
    this.ensureEnabled();
    // indicar comienzo del flujo de autenticación
    this._processing.next(true);
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(this.firebaseAuth, provider);
    const user = result.user;
    const token = await user.getIdToken();
    const dataSesion: any = {
      id: user.uid || null,
      name: user.displayName || user.email,
      email: user.email,
      token,
    };
    this.security.saveSession(dataSesion);
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {}
    return dataSesion;
  }

  /**
   * Inicia sesión con email y contraseña usando Firebase Auth
   */
  async signInWithEmailPassword(email: string, password: string): Promise<any> {
    this.ensureEnabled();
    this._processing.next(true);
    try {
      const result = await signInWithEmailAndPassword(
        this.firebaseAuth,
        email,
        password
      );
      const user = result.user;
      const token = await user.getIdToken();
      const dataSesion: any = {
        id: user.uid || null,
        name: user.displayName || user.email,
        email: user.email,
        token,
      };
      this.security.saveSession(dataSesion);
      try {
        localStorage.setItem(TOKEN_KEY, token);
      } catch {}
      try {
        this.router.navigate(["/dashboard"], { replaceUrl: true });
      } catch (e) {}
      return dataSesion;
    } finally {
      this._processing.next(false);
    }
  }

  /**
   * Registra un usuario con email/contraseña en Firebase
   */
  async signUpWithEmailPassword(email: string, password: string): Promise<any> {
    this.ensureEnabled();
    this._processing.next(true);
    try {
      const result = await createUserWithEmailAndPassword(
        this.firebaseAuth,
        email,
        password
      );
      const user = result.user;
      const token = await user.getIdToken();
      const dataSesion: any = {
        id: user.uid || null,
        name: user.displayName || user.email,
        email: user.email,
        token,
      };
      this.security.saveSession(dataSesion);
      try {
        localStorage.setItem(TOKEN_KEY, token);
      } catch {}
      try {
        this.router.navigate(["/dashboard"], { replaceUrl: true });
      } catch (e) {}
      return dataSesion;
    } finally {
      this._processing.next(false);
    }
  }

  /**
   * Inicia sesión con GitHub mediante popup y guarda la sesión.
   */
  async signInWithGithub(): Promise<any> {
    this.ensureEnabled();
    const provider = new GithubAuthProvider();
    provider.addScope("user:email");
    const result = await signInWithPopup(this.firebaseAuth, provider);
    const user = result.user;
    const token = await user.getIdToken();
    const dataSesion: any = {
      id: user.uid || null,
      name: user.displayName || user.email,
      email: user.email,
      token,
    };
    this.security.saveSession(dataSesion);
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {}
    return dataSesion;
  }

  /**
   * Inicia sesión con Microsoft (OAuth) mediante popup y guarda la sesión.
   */
  async signInWithMicrosoft(): Promise<any> {
    this.ensureEnabled();
    this._processing.next(true);
    const provider = new OAuthProvider("microsoft.com");
    provider.addScope("email");
    const result = await signInWithPopup(this.firebaseAuth, provider);
    const user = result.user;
    const token = await user.getIdToken();
    const dataSesion: any = {
      id: user.uid || null,
      name: user.displayName || user.email,
      email: user.email,
      token,
    };
    this.security.saveSession(dataSesion);
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {}
    return dataSesion;
  }

  async signOut(): Promise<void> {
    if (!this.enabled) return this.security.logout();
    await firebaseSignOut(this.firebaseAuth);
    this.security.logout();
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {}
  }
}
