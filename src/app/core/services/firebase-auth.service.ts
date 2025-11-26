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

      // Escuchamos cambios de estado en Firebase y mantenemos una sesión local
      // totalmente cliente (NO se realizan peticiones al backend). Aquí guardamos
      // el usuario en `SecurityService` y en `localStorage` para que los guards
      // y el interceptor funcionen basados exclusivamente en estado local.
      onAuthStateChanged(this.firebaseAuth, async (user: any) => {
        this._user.next(user);
        if (user) {
          // Indicamos que estamos procesando el inicio de sesión localmente
          this._processing.next(true);
          try {
            const idToken = await user.getIdToken();
            // Construimos la sesión mínima necesaria y la guardamos en localStorage
            const dataSesion: any = {
              id: user.uid || null,
              name: user.displayName || user.email,
              email: user.email,
              token: idToken,
              photoURL: user.photoURL || "",
            };
            // Guardar sesión de aplicación en el servicio de seguridad (localStorage)
            this.security.saveSession(dataSesion);
            try {
              localStorage.setItem(TOKEN_KEY, idToken);
            } catch {}
            // Redirigimos al dashboard (reemplazando la entrada de historial)
            try {
              this.router.navigate(["/dashboard"], { replaceUrl: true });
            } catch (e) {}
          } finally {
            this._processing.next(false);
          }
        } else {
          // Si no hay usuario en Firebase, limpiamos la sesión local
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

  // NOTE: Backend exchange attempts are disabled. The app uses a local-only
  // session persisted in `localStorage` via `SecurityService.saveSession()`.
  // This avoids any network calls to exchange provider tokens with a backend
  // that does not implement OAuth endpoints.

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
    const credential: any = (result as any).credential;
    const providerAccessToken = credential?.accessToken || null;
    const user = result.user;
    const idToken = await user.getIdToken();
    try {
      // Construimos la sesión mínima a partir de Firebase y la guardamos localmente
      const dataSesion: any = {
        id: user.uid || null,
        name: user.displayName || user.email,
        email: user.email,
        token: idToken,
        providerAccessToken: providerAccessToken,
        photoURL: user.photoURL || "",
      };
      this.security.saveSession(dataSesion);
      try {
        localStorage.setItem(TOKEN_KEY, idToken);
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
    this._processing.next(true);
    const provider = new GithubAuthProvider();
    provider.addScope("user:email");
    const result = await signInWithPopup(this.firebaseAuth, provider);
    const credential: any = (result as any).credential;
    const providerAccessToken = credential?.accessToken || null;
    const user = result.user;
    const idToken = await user.getIdToken();

    try {
      const dataSesion: any = {
        id: user.uid || null,
        name: user.displayName || user.email,
        email: user.email,
        token: idToken,
        providerAccessToken: providerAccessToken,
        photoURL: user.photoURL || "",
      };
      this.security.saveSession(dataSesion);
      try {
        localStorage.setItem(TOKEN_KEY, idToken);
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
   * Inicia sesión con Microsoft (OAuth) mediante popup y guarda la sesión.
   */
  async signInWithMicrosoft(): Promise<any> {
    this.ensureEnabled();
    this._processing.next(true);
    const provider = new OAuthProvider("microsoft.com");
    provider.addScope("email");
    const result = await signInWithPopup(this.firebaseAuth, provider as any);
    const credential: any = (result as any).credential;
    const providerAccessToken = credential?.accessToken || null;
    const user = result.user;
    const idToken = await user.getIdToken();
    try {
      const dataSesion: any = {
        id: user.uid || null,
        name: user.displayName || user.email,
        email: user.email,
        token: idToken,
        providerAccessToken: providerAccessToken,
        photoURL: user.photoURL || "",
      };
      this.security.saveSession(dataSesion);
      try {
        localStorage.setItem(TOKEN_KEY, idToken);
      } catch {}
      try {
        this.router.navigate(["/dashboard"], { replaceUrl: true });
      } catch (e) {}
      return dataSesion;
    } finally {
      this._processing.next(false);
    }
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
