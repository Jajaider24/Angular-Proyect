import { Component, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { User } from "src/app/models/User";

import { FirebaseAuthService } from "src/app/core/services/firebase-auth.service";
import { SecurityService } from "src/app/services/security.service";
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
    private firebaseAuth: FirebaseAuthService
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
    this.securityService.login(this.user).subscribe({
      // Llamada al servicio de seguridad para iniciar sesión
      next: (data) => {
        // Manejo de la respuesta exitosa y error de la autenticación
        console.log("data " + JSON.stringify(data)); // Log de los datos recibidos y guardar la sesión
        this.securityService.saveSession(data); // Guardar la sesión del usuario
        this.router.navigate(["dashboard"]); // Redirigir al usuario al dashboard
      },
      error: (error) => {
        console.error("error " + JSON.stringify(error));
        Swal.fire(
          "Autenticación Inválida",
          "Usuario o contraseña inválido",
          "error"
        );
      },
    });
  }

  ngOnInit() {}
  ngOnDestroy() {}
}
