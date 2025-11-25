import { Component, OnInit, ElementRef } from "@angular/core";
import { ROUTES } from "../sidebar/sidebar.component";
import {
  Location,
  LocationStrategy,
  PathLocationStrategy,
} from "@angular/common";
import { Router } from "@angular/router";
import { User } from "src/app/models/User";
import { SecurityService } from "src/app/services/security.service";
import { Subscription } from "rxjs";
import { WebSocketService } from "src/app/services/web-socket-service.service";

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.scss"],
})
export class NavbarComponent implements OnInit {
  public focus;
  public listTitles: any[];
  public location: Location;
  user: User;  // Usuario logueado 
  subscription: Subscription; 
  constructor( 
    location: Location,
    private element: ElementRef,
    private router: Router,
    private securityService: SecurityService,
    private webSocketService: WebSocketService
  ) {
    this.location = location;
    this.subscription = this.securityService.getUser().subscribe((data) => { //Estar pendiente de la variable global reactiva (Subscription --> simulacion de conectado a una api)
      this.user = data; //Pendiente de que haya un cambio
    });

    this.webSocketService.setNameEvent("ABC123"); // Suscribirse al evento WebSocket y escuchar mensajes
    this.webSocketService.callback.subscribe((message) => { // Manejar el mensaje recibido y mostrar en consola
      console.log("Mensaje recibido en el navbar: ", message); // Mostrar el mensaje recibido en la consola y hacer algo con él
    });
  }

  ngOnInit() {
    this.listTitles = ROUTES.filter((listTitle) => listTitle);
  }
  getTitle() {
    var titlee = this.location.prepareExternalUrl(this.location.path());
    if (titlee.charAt(0) === "#") {
      titlee = titlee.slice(1);
    }

    for (var item = 0; item < this.listTitles.length; item++) {
      if (this.listTitles[item].path === titlee) {
        return this.listTitles[item].title;
      }
    }
    return "Dashboard";
  }

  // Cerrar sesión desde el menú del navbar
  onLogout() {
    this.webSocketService.disconnect();
    this.securityService.logout();
    this.router.navigate(["/login"]);
  }
}
