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
      // choose oauth endpoint: use proxy during development to avoid CORS
      const oauthEndpoint = environment.production
        ? `${environment.url_security}/oauth-login`
        : `/oauth-login`;

      onAuthStateChanged(this.firebaseAuth, async (user: any) => {
        this._user.next(user);
        if (user) {
          const idToken = await user.getIdToken();
          // indicamos que empezamos el intercambio con el backend
          this._processing.next(true);
          // try exchange with backend to obtain application JWT
          try {
            const body = {
              provider:
                user.providerData && user.providerData[0]
                  ? user.providerData[0].providerId
                  : "firebase",
              idToken,
            };

            // If in production, stick to configured URL; in dev try common alternatives
            const endpointsToTry = environment.production
              ? [oauthEndpoint]
              : [
                  "/oauth-login",
                  "/auth/oauth-login",
                  "/api/oauth-login",
                  "/login/oauth",
                  "/auth/login",
                ];

            // TypeScript may resolve a different FirebaseAuthService type (there's
            // another service with the same class name in the workspace). Cast
            // to `any` here to avoid a spurious TS2339 while keeping runtime
            // behavior intact.
            const resp: any = await (this as any).tryExchangeEndpoints(
              endpointsToTry,
              body
            );
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
            console.error("OAuth exchange error", err);
            try {
              // Import dinámico para evitar romper si sweetalert2 no está instalado
              // (pero por defecto está en package.json de este proyecto)
              // eslint-disable-next-line @typescript-eslint/no-var-requires
              const Swal = require("sweetalert2");
              Swal.fire({
                icon: "warning",
                title: "Error al validar sesión con el backend",
                html:
                  "No se pudo completar el intercambio con el servidor. Verifica CORS o usa el proxy de Angular para el entorno de desarrollo." +
                  (err && err.status
                    ? `<br><small>HTTP ${err.status}</small>`
                    : ""),
                confirmButtonText: "Entendido",
              });
            } catch (e) {
              console.warn(
                "No se pudo mostrar la alerta (sweetalert2 no disponible)",
                e
              );
            }
            // Si estamos en modo desarrollo y el backend no tiene la ruta
            // (404) o no está disponible, permitir un fallback local opcional
            // para facilitar el desarrollo (crear sesión local usando idToken).
            // Esto se controla mediante `environment.allowLocalLogin`.
            try {
              const httpStatus = err && err.status ? Number(err.status) : null;
              if (
                environment.allowLocalLogin &&
                (httpStatus === 404 || httpStatus === 0 || !httpStatus)
              ) {
                console.warn(
                  "Backend oauth-login not found — creating local session because allowLocalLogin=true"
                );
                const dataSesion: any = {
                  id: user.uid || null,
                  name: user.displayName || user.email,
                  email: user.email,
                  token: idToken,
                  photoURL: user.photoURL || "",
                };
                this.security.saveSession(dataSesion);
                try {
                  localStorage.setItem(TOKEN_KEY, idToken);
                } catch {}
                try {
                  this.router.navigate(["/dashboard"], { replaceUrl: true });
                } catch (e) {}
                // return early — evitamos cerrar sesión
                return;
              }

              // Si no aplicamos el fallback, cerramos la sesión de Firebase
              // para evitar redirecciones sin sesión de aplicación válida.
              // cerrar sesión de Firebase (evita que onAuthStateChanged vuelva a disparar un usuario)
              // eslint-disable-next-line @typescript-eslint/no-var-requires
              const { signOut } = require("firebase/auth");
              try {
                await signOut(this.firebaseAuth);
              } catch (e) {
                try {
                  // como fallback, intentamos el alias importado
                  // eslint-disable-next-line @typescript-eslint/no-var-requires
                  const fb = require("firebase/auth");
                  if (fb && fb.signOut) {
                    await fb.signOut(this.firebaseAuth);
                  }
                } catch (e2) {
                  console.warn(
                    "No se pudo cerrar sesión de Firebase automáticamente",
                    e2
                  );
                }
              }
            } catch (e) {
              console.warn(
                "Error durante el intento de cerrar sesión tras fallo de intercambio",
                e
              );
            }
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

  // Try a list of endpoints sequentially until one returns a successful response.
  private async tryExchangeEndpoints(
    endpoints: string[],
    body: any
  ): Promise<any | null> {
    for (const ep of endpoints) {
      try {
        console.log("Attempting OAuth exchange at", ep);
        // Use relative endpoints so Angular proxy can forward in dev
        const r = await this.http.post(ep, body).toPromise();
        console.log("Exchange succeeded at", ep);
        return r;
      } catch (err: any) {
        const status = err && err.status ? err.status : null;
        console.warn(`Exchange attempt to ${ep} failed`, status || err);
        // If failure is not 404, stop and propagate error to surface server problems
        if (status && status !== 404) throw err;
        // otherwise try next endpoint
      }
    }
    return null;
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
