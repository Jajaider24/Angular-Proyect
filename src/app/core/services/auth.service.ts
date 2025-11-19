import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { SecurityService } from "src/app/services/security.service";

@Injectable({ providedIn: "root" })
export class AuthService {
  constructor(private security: SecurityService) {}

  // Use existing SecurityService for username/password login
  login(credentials: any): Observable<any> {
    return this.security.login(credentials);
  }

  logout() {
    this.security.logout();
  }

  // Placeholders for social login flows; actual implementation
  // should use provider SDKs or backend exchanges.
  loginWithGoogle() {
    throw new Error(
      "Not implemented: use angularx-social-login or backend flow"
    );
  }

  loginWithMicrosoft() {
    throw new Error("Not implemented: use MSAL or backend flow");
  }

  loginWithGithub() {
    throw new Error("Not implemented: use backend exchange for GitHub OAuth");
  }
}
