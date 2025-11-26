import { Component, OnDestroy, OnInit } from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { SidebarService } from "./sidebar.service";

declare interface RouteInfo {
  path: string;
  title: string;
  icon: string;
  subtitle?: string;
  class: string;
}
export const ROUTES: RouteInfo[] = [
  // Primary entities (show icons) with short subtitles
  {
    path: "/restaurants",
    title: "Restaurantes",
    icon: "ni-shop text-primary",
    subtitle: "Gestionar locales y datos",
    class: "",
  },
  {
    path: "/products",
    title: "Productos",
    icon: "ni-basket text-info",
    subtitle: "Catalogar productos",
    class: "",
  },
  {
    path: "/menus",
    title: "Menús",
    icon: "ni-books text-success",
    subtitle: "Asignar productos a restaurantes",
    class: "",
  },
  {
    path: "/customers",
    title: "Clientes",
    icon: "ni-single-02 text-warning",
    subtitle: "Usuarios finales",
    class: "",
  },
  {
    path: "/orders",
    title: "Pedidos",
    icon: "ni-delivery-fast text-danger",
    subtitle: "Órdenes y estado de entrega",
    class: "",
  },
  // Secondary / supporting entities (icons present but subtle)
  {
    path: "/addresses",
    title: "Direcciones",
    icon: "ni-pin-3 text-muted",
    subtitle: "Direcciones de entrega",
    class: "",
  },
  {
    path: "/motorcycles",
    title: "Motocicletas",
    icon: "ni-scooter text-muted",
    subtitle: "Vehículos de reparto",
    class: "",
  },
  {
    path: "/drivers",
    title: "Conductores",
    icon: "ni-user-run text-muted",
    subtitle: "Gestión de conductores",
    class: "",
  },
  {
    path: "/shifts",
    title: "Turnos",
    icon: "ni-calendar-grid-58 text-muted",
    subtitle: "Asignaciones moto-conductor",
    class: "",
  },
  {
    path: "/issues",
    title: "Incidencias",
    icon: "ni-alert-circle text-muted",
    subtitle: "Registrar fallas y accidentes",
    class: "",
  },
  {
    path: "/photos",
    title: "Fotos",
    icon: "ni-camera-compact text-muted",
    subtitle: "Evidencias y fotos",
    class: "",
  },
];

@Component({
  selector: "app-sidebar",
  templateUrl: "./sidebar.component.html",
  styleUrls: ["./sidebar.component.scss"],
})
export class SidebarComponent implements OnInit, OnDestroy {
  public menuItems: any[];
  public isCollapsed = false;
  public activePath = "";
  private subs: Subscription[] = [];

  constructor(private router: Router, private sidebarService: SidebarService) {}

  ngOnInit() {
    // Enriquecer cada item con una clave de color (ej: 'primary','info','success')
    this.menuItems = ROUTES.filter((menuItem) => menuItem).map((m) => {
      const icon = (m.icon || "").toString();
      const colorToken = icon
        .split(/\s+/)
        .find((t) => t.startsWith("text-") || t.startsWith("bg-"));
      const colorKey = colorToken
        ? colorToken.replace(/^(text-|bg-)/, "")
        : "muted";
      return { ...m, colorKey };
    });
    this.subs.push(
      this.sidebarService.collapsed$.subscribe((c) => (this.isCollapsed = c))
    );
    // subscribe to centralized activePath from SidebarService
    this.subs.push(
      this.sidebarService.activePath$.subscribe(
        (p) => (this.activePath = p || this.router.url || "")
      )
    );
  }

  isActive(path: string) {
    if (!path) return false;
    const current = this.activePath || this.router.url || "";
    return (
      current === path ||
      current.startsWith(path + "/") ||
      current.startsWith(path + "?")
    );
  }

  toggle() {
    this.sidebarService.toggle();
  }

  ngOnDestroy() {
    this.subs.forEach((s) => s.unsubscribe());
  }
}
