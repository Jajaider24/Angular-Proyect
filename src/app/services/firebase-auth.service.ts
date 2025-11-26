import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { SecurityService } from "./security.service";

import {
  signOut as firebaseSignOut,
  getAuth,
  signInWithEmailAndPassword,
  signInWithPopup,
  User,
} from "firebase/auth";

// import providers and initialized auth from project-level firebaseConfig.js
import {
  auth as firebaseAuth,
  githubProvider,
  googleProvider,
  microsoftProvider,
} from "../../../firebaseConfig";

@Injectable({ providedIn: "root" })
export class FirebaseAuthService {
  // observable local copy of the current user (profile + photo)
  private currentUserSubject = new BehaviorSubject<any>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  // expose a processing observable so components can show spinners
  processing$ = new BehaviorSubject<boolean>(false);

  constructor(private security: SecurityService) {
    // If there's a saved session in localStorage, restore it into the subject
    const saved = this.security.getSessionData();
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.currentUserSubject.next(parsed);
      } catch {
        // ignore
      }
    }

    // Also wire firebase auth state changes to keep SecurityService in sync
    try {
      const a = (firebaseAuth as any) || getAuth();
      // @ts-ignore
      a.onAuthStateChanged(async (user: User | null) => {
        if (user) {
          const idToken = await user.getIdToken();
          const profile = {
            id: user.uid,
            name: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            token: idToken,
          };
          this.currentUserSubject.next(profile);
          this.security.saveSession(profile);
        } else {
          this.currentUserSubject.next(null);
          this.security.logout();
        }
      });
    } catch (e) {
      console.warn(
        "FirebaseAuthService: could not attach onAuthStateChanged",
        e
      );
    }
  }

  // Compatibility method names expected by existing components
  async signInWithGoogle() {
    return this.loginWithGoogle();
  }

  async signInWithGithub() {
    return this.loginWithGithub();
  }

  async signInWithMicrosoft() {
    return this.loginWithMicrosoft();
  }

  async signInWithEmailPassword(email: string, password: string) {
    this.processing$.next(true);
    try {
      const result = await signInWithEmailAndPassword(
        firebaseAuth as any,
        email,
        password
      );
      const user = result.user;
      const idToken = await user.getIdToken();
      const profile = {
        id: user.uid,
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        token: idToken,
      };
      this.currentUserSubject.next(profile);
      this.security.saveSession(profile);
      return profile;
    } finally {
      this.processing$.next(false);
    }
  }

  async loginWithGoogle() {
    this.processing$.next(true);
    try {
      const result = await signInWithPopup(firebaseAuth as any, googleProvider);
      const user = result.user;
      const idToken = await user.getIdToken();
      const profile = {
        id: user.uid,
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        token: idToken,
      };
      this.currentUserSubject.next(profile);
      this.security.saveSession(profile);
      return profile;
    } catch (err) {
      console.error("Google login failed", err);
      throw err;
    } finally {
      this.processing$.next(false);
    }
  }

  async loginWithGithub() {
    this.processing$.next(true);
    try {
      const result = await signInWithPopup(firebaseAuth as any, githubProvider);
      const credential: any = (result as any).credential;
      const accessToken = credential?.accessToken;
      const user = result.user;
      const idToken = await user.getIdToken();
      const profile = {
        id: user.uid,
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        token: idToken,
        providerAccessToken: accessToken,
      };
      this.currentUserSubject.next(profile);
      this.security.saveSession(profile);
      return profile;
    } catch (err) {
      console.error("GitHub login failed", err);
      throw err;
    } finally {
      this.processing$.next(false);
    }
  }

  async loginWithMicrosoft() {
    this.processing$.next(true);
    try {
      // Add scopes if needed
      try {
        microsoftProvider.addScope("user.read");
      } catch {}
      const result = await signInWithPopup(
        firebaseAuth as any,
        microsoftProvider as any
      );
      const credential: any = (result as any).credential;
      const accessToken = credential?.accessToken;
      const user = result.user;
      const idToken = await user.getIdToken();
      const profile = {
        id: user.uid,
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        token: idToken,
        providerAccessToken: accessToken,
      };
      this.currentUserSubject.next(profile);
      this.security.saveSession(profile);
      return profile;
    } catch (err) {
      console.error("Microsoft login failed", err);
      throw err;
    } finally {
      this.processing$.next(false);
    }
  }

  async logout() {
    try {
      await firebaseSignOut(firebaseAuth as any);
    } catch (e) {
      console.warn("Firebase signOut error", e);
    }
    this.currentUserSubject.next(null);
    this.security.logout();
  }

  getAccessToken(): string | null {
    const s = this.security.getSessionData();
    if (!s) return null;
    try {
      const parsed = JSON.parse(s);
      return parsed.token || null;
    } catch {
      return null;
    }
  }
}
