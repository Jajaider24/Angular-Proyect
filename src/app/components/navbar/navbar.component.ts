import {
  Location,
  LocationStrategy,
  PathLocationStrategy,
} from "@angular/common";
import { Component, ElementRef, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Subscription } from "rxjs";
import { User } from "src/app/models/User";
import { NotificationService } from "src/app/services/notification.service";
import { SecurityService } from "src/app/services/security.service";
import { WebSocketService } from "src/app/services/web-socket-service.service";
import { ROUTES } from "../sidebar/sidebar.component";
import { SidebarService } from "../sidebar/sidebar.service";

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.scss"],
})
export class NavbarComponent implements OnInit, OnDestroy {
  public focus;
  public listTitles: any[];
  public location: Location;
  public currentTitle: string | null = null;
  user: User; // Usuario logueado
  subscription: Subscription;
  private subs: Subscription[] = [];
  constructor(
    location: Location,
    private element: ElementRef,
    private router: Router,
    private securityService: SecurityService,
    private webSocketService: WebSocketService,
    private sidebarService: SidebarService,
    private notificationService: NotificationService
  ) {
    this.location = location;
    this.subscription = this.securityService.getUser().subscribe((data) => {
      //Estar pendiente de la variable global reactiva (Subscription --> simulacion de conectado a una api)
      this.user = data; //Pendiente de que haya un cambio
    });

    // Suscribirse al evento WebSocket para recibir notificaciones de nuevos pedidos
    // El evento "new_order" es emitido por el backend cuando se crea un nuevo pedido
    this.webSocketService.setNameEvent("new_order");
    this.webSocketService.callback.subscribe((message) => {
      // Manejar el mensaje recibido: reproducir sonido y mostrar notificación
      console.log("🔔 Nuevo pedido recibido: ", message);

      // Reproducir sonido de notificación y mostrar alerta visual
      this.notificationService.notifyNewOrder(message);
    });
  }

  /**
   * Método para probar el sonido de notificación manualmente.
   * Útil para verificar que el audio funciona correctamente.
   */
  testNotificationSound(): void {
    console.log("🔔 Probando sonido de notificación...");
    this.notificationService.notifyNewOrder({
      id: 999,
      customerName: "Prueba de sonido",
    });
  }

  ngOnInit() {
    this.listTitles = ROUTES.filter((listTitle) => listTitle);
    // subscribe to the centralized activePath to update the title
    this.subs.push(
      this.sidebarService.activePath$.subscribe((path) => {
        const p =
          path || this.location.prepareExternalUrl(this.location.path());
        let found = this.listTitles.find(
          (item) =>
            item.path === p ||
            p.startsWith(item.path + "/") ||
            p.startsWith(item.path + "?")
        );
        this.currentTitle = found ? found.title : "Dashboard";
        // compute accent key from the found item's icon class (eg 'text-primary' -> 'primary')
        if (found && found.icon) {
          const token = (found.icon as string)
            .split(/\s+/)
            .find((t) => t.startsWith("text-") || t.startsWith("bg-"));
          this.currentAccentKey = token
            ? token.replace(/^(text-|bg-)/, "")
            : "muted";
        } else {
          this.currentAccentKey = "muted";
        }
        // propagate accent globally so other components (buttons, lists) can style accordingly
        try {
          document.body.setAttribute(
            "data-accent",
            this.currentAccentKey || "muted"
          );
        } catch (e) {
          // server-side or test environments may not have document
        }
      })
    );
  }
  public currentAccentKey: string = "muted";
  getTitle() {
    return (
      this.currentTitle ||
      (() => {
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
      })()
    );
  }

  ngOnDestroy() {
    this.subs.forEach((s) => s.unsubscribe());
    if (this.subscription) this.subscription.unsubscribe();
  }

  // Cerrar sesión desde el menú del navbar
  onLogout() {
    this.webSocketService.disconnect();
    this.securityService.logout();
    this.router.navigate(["/login"]);
  }

  toggleSidebar() {
    this.sidebarService.toggle();
  }
}
