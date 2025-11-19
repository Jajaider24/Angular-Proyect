import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { SecurityService } from "src/app/services/security.service";
import { environment } from "src/environments/environment";

// NOTE: This uses the firebase config available previously in the project.
// If you prefer, move the config to `environment` and read from there.
const firebaseConfig = {
  apiKey: "AIzaSyDA7UmElNlXAnPfDHvfJTcWvvh9Vka8jJ8",
  authDomain: "proyecto-react-5fc5b.firebaseapp.com",
  projectId: "proyecto-react-5fc5b",
  storageBucket: "proyecto-react-5fc5b.firebasestorage.app",
  messagingSenderId: "429402941051",
  appId: "1:429402941051:web:c28445382064e5bb41e4de",
};

@Injectable({ providedIn: "root" })
export class FirebaseAuthService {
  private _user = new BehaviorSubject<any | null>(null);
  user$: Observable<any | null> = this._user.asObservable();

  // runtime references to firebase modules
  private firebaseApp: any = null;
  private firebaseAuth: any = null;
  private enabled = false;

  constructor(private security: SecurityService, private http: HttpClient) {
    // attempt to initialize firebase dynamically; if firebase is not installed
    // this will fail gracefully and provide instructions to the developer/user
    this.init().catch((err) => {
      // keep app running, but mark firebase as disabled
      console.warn(
        "Firebase not available. Run `npm install` to enable social login.",
        err
      );
      this.enabled = false;
    });
  }

  private async init() {
    // dynamic import to avoid hard dependency at compile time
    const fbApp = await import("firebase/app");
    const fbAuth = await import("firebase/auth");

    // initialize app and auth
    this.firebaseApp = fbApp.initializeApp(firebaseConfig);
    this.firebaseAuth = fbAuth.getAuth(this.firebaseApp);
    this.enabled = true;

    // listen auth state
    fbAuth.onAuthStateChanged(this.firebaseAuth, async (user: any) => {
      this._user.next(user);
      if (user) {
        const idToken = await user.getIdToken();
        // try to exchange idToken with backend to get application JWT
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
          // expect backend to return { id, name, email, token }
          this.security.saveSession(resp);
        } catch (err) {
          // fallback: save firebase idToken directly
          this.security.saveSession({
            id: user.uid || null,
            name: user.displayName,
            email: user.email,
            token: idToken,
          });
        }
      } else {
        this.security.logout();
      }
    });
  }

  private ensureEnabled() {
    if (!this.enabled)
      throw new Error(
        "Firebase not initialized. Run `npm install` and restart the dev server."
      );
  }

  async signInWithGoogle(): Promise<void> {
    this.ensureEnabled();
    const fbAuth = await import("firebase/auth");
    const provider = new fbAuth.GoogleAuthProvider();
    await fbAuth.signInWithPopup(this.firebaseAuth, provider);
  }

  async signInWithGithub(): Promise<void> {
    this.ensureEnabled();
    const fbAuth = await import("firebase/auth");
    const provider = new fbAuth.GithubAuthProvider();
    provider.addScope("user:email");
    await fbAuth.signInWithPopup(this.firebaseAuth, provider);
  }

  async signInWithMicrosoft(): Promise<void> {
    this.ensureEnabled();
    const fbAuth = await import("firebase/auth");
    const provider = new fbAuth.OAuthProvider("microsoft.com");
    provider.addScope("email");
    await fbAuth.signInWithPopup(this.firebaseAuth, provider);
  }

  async signOut(): Promise<void> {
    if (!this.enabled) return this.security.logout();
    const fbAuth = await import("firebase/auth");
    await fbAuth.signOut(this.firebaseAuth);
    this.security.logout();
  }
}
