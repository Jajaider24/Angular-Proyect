import { Component, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { User } from "src/app/models/User";

import { FirebaseAuthService } from "src/app/core/services/firebase-auth.service";
import { SecurityService } from "src/app/services/security.service";
import { WebSocketService } from 'src/app/services/web-socket-service.service';
import Swal from "sweetalert2";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent implements OnInit, OnDestroy {
  user: User;
  constructor(
    private securityService: SecurityService,
    private router: Router,
    private firebaseAuth: FirebaseAuthService,
    private webSocketService: WebSocketService
  ) {
    this.user = { email: "", password: "" };
  }

  async socialSignIn(provider: "google" | "github" | "microsoft") {
    try {
      if (provider === "google") await this.firebaseAuth.signInWithGoogle();
      if (provider === "github") await this.firebaseAuth.signInWithGithub();
      if (provider === "microsoft")
        await this.firebaseAuth.signInWithMicrosoft();
      // onAuthStateChanged in FirebaseAuthService will save session and redirect
      this.router.navigate(["dashboard"]);
    } catch (err: any) {
      console.error("social sign in error", err);
      Swal.fire(
        "Error",
        "No fue posible iniciar sesión con el proveedor",
        "error"
      );
    }
  }
  login() {
    // Método para autenticar al usuario
    console.log("componente " + JSON.stringify(this.user)); // Log del usuario que intenta iniciar sesión
    // Intentamos el login tradicional al backend si existe el endpoint
    this.securityService.login(this.user).subscribe({
      next: (data) => {
        console.log("data " + JSON.stringify(data));
        this.securityService.saveSession(data);
        // Conectar socket sólo después de guardar sesión para evitar conexión con user_id vacío
        try { this.webSocketService.connect(); } catch (e) {}
        this.router.navigate(["dashboard"]);
      },
      error: (error) => {
        // Si el backend no tiene /login (o devuelve error), usamos el fallback por email
        console.warn('login backend failed, trying local email-based login', error);
        this.securityService.loginByEmail(this.user.email).subscribe({
          next: (sess) => {
            console.log('loginByEmail success', sess);
            // Conectar socket después del login por email
            try { this.webSocketService.connect(); } catch (e) {}
            this.router.navigate(['dashboard']);
          },
          error: (err) => {
            console.error('loginByEmail error', err);
            Swal.fire(
              'Autenticación Inválida',
              'Usuario no encontrado',
              'error'
            );
          }
        });
      },
    });
  }

  ngOnInit() {}
  ngOnDestroy() {}
}
