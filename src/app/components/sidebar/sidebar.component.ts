import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";

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
export class SidebarComponent implements OnInit {
  public menuItems: any[];
  public isCollapsed = true;

  constructor(private router: Router) {}

  ngOnInit() {
    this.menuItems = ROUTES.filter((menuItem) => menuItem);
    this.router.events.subscribe((event) => {
      this.isCollapsed = true;
    });
  }
}
