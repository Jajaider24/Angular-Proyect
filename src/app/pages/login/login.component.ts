import { Component, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Subscription } from "rxjs";
import { User } from "src/app/models/User";

import { FirebaseAuthService } from "src/app/core/services/firebase-auth.service";
import { SecurityService } from "src/app/services/security.service";
import { WebSocketService } from "src/app/services/web-socket-service.service";
import Swal from "sweetalert2";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent implements OnInit, OnDestroy {
  user: User;
  isLoading = false;
  private _subs: Subscription[] = [];
  constructor(
    private securityService: SecurityService,
    private router: Router,
    private firebaseAuth: FirebaseAuthService,
    private webSocketService: WebSocketService
  ) {
    this.user = { email: "", password: "" };
  }

  async socialSignIn(provider: "google" | "github" | "microsoft") {
    // Evitar múltiples clicks: si ya hay un proceso en curso, ignorar
    if (this.isLoading) return;
    try {
      let result: any = null;
      if (provider === "google")
        result = await this.firebaseAuth.signInWithGoogle();
      if (provider === "github")
        result = await this.firebaseAuth.signInWithGithub();
      if (provider === "microsoft")
        result = await this.firebaseAuth.signInWithMicrosoft();

      console.log("socialSignIn result:", result);

      // Si por alguna razón onAuthStateChanged no realizó la redirección,
      // hacemos un fallback: si la sesión está guardada, navegamos al dashboard.
      if (this.securityService.existSession()) {
        this.router.navigate(["/dashboard"], { replaceUrl: true });
      }
    } catch (err: any) {
      console.error("social sign in error", err);
      Swal.fire(
        "Error",
        err && err.message
          ? err.message
          : "No fue posible iniciar sesión con el proveedor",
        "error"
      );
    }
  }
  login() {
    // Método para autenticar al usuario
    console.log("componente " + JSON.stringify(this.user)); // Log del usuario que intenta iniciar sesión
    if (this.isLoading) return; // evitar envíos múltiples
    this.isLoading = true;

    // Intentamos el login tradicional al backend si existe el endpoint
    this.securityService.login(this.user).subscribe({
      next: (data) => {
        console.log("data " + JSON.stringify(data));
        this.securityService.saveSession(data);
        // Conectar socket sólo después de guardar sesión para evitar conexión con user_id vacío
        try {
          this.webSocketService.connect();
        } catch (e) {}
        this.isLoading = false;
        this.router.navigate(["/dashboard"], { replaceUrl: true });
      },
      error: async (error) => {
        // Si el backend no tiene /login (o devuelve error), intentamos Firebase email/password
        console.warn(
          "login backend failed, trying firebase email/password fallback",
          error
        );
        try {
          const sess = await this.firebaseAuth.signInWithEmailPassword(
            this.user.email,
            this.user.password
          );
          console.log("Firebase email login success", sess);
          try {
            this.webSocketService.connect();
          } catch (e) {}
          this.isLoading = false;
          this.router.navigate(["/dashboard"], { replaceUrl: true });
          return;
        } catch (fbErr) {
          console.warn("Firebase email login failed", fbErr);
        }

        // Si todo falla, usamos el fallback por email en modo prototipo
        this.securityService.loginByEmail(this.user.email).subscribe({
          next: (sess) => {
            console.log("loginByEmail success", sess);
            try {
              this.webSocketService.connect();
            } catch (e) {}
            this.isLoading = false;
            this.router.navigate(["/dashboard"], { replaceUrl: true });
          },
          error: (err) => {
            console.error("loginByEmail error", err);
            this.isLoading = false;
            Swal.fire(
              "Autenticación Inválida",
              "Usuario no encontrado",
              "error"
            );
          },
        });
      },
    });
  }

  ngOnInit() {
    // Suscribirse al estado de procesamiento del servicio de auth
    const s = this.firebaseAuth.processing$.subscribe((v) => {
      this.isLoading = v;
    });
    this._subs.push(s);
  }
  ngOnDestroy() {
    this._subs.forEach((s) => s.unsubscribe());
  }
}
