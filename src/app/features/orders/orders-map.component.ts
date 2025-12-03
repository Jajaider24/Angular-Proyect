import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import * as L from "leaflet";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { WebSocketService } from "src/app/services/web-socket-service.service";
import { Position, TrackingService } from "./tracking.service";

@Component({
  selector: "app-orders-map",
  templateUrl: "./orders-map.component.html",
  styleUrls: ["./orders-map.component.scss"],
})
export class OrdersMapComponent implements OnInit, OnDestroy {
  @ViewChild("map", { static: true }) mapEl!: ElementRef<HTMLDivElement>;

  // Leaflet map instance
  private map!: L.Map;

  // Centro por defecto (Manizales aprox.)
  private defaultCenter: L.LatLngExpression = [5.0703, -75.5138];
  private defaultZoom = 14;

  // Estado de placas activas → marcador y polilínea
  plates: string[] = [];
  markers: Record<string, L.Marker> = {};
  polylines: Record<string, L.Polyline> = {};

  private destroy$ = new Subject<void>();

  // Icono de repartidor (SVG en assets). Si no carga, Leaflet usará el default.
  private courierIcon = L.icon({
    iconUrl: "/assets/img/delivery.svg",
    iconSize: [36, 36],
    iconAnchor: [18, 28],
    popupAnchor: [0, -28],
  });

  constructor(
    private route: ActivatedRoute,
    private tracking: TrackingService,
    // Servicio WebSocket adicional (escucha eventos crudos por placa)
    private webSocketService: WebSocketService
  ) {}

  ngOnInit(): void {
    // Inicializa Leaflet
    this.map = L.map(this.mapEl.nativeElement).setView(
      this.defaultCenter,
      this.defaultZoom
    );
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);

    // Conectamos el socket únicamente en esta vista
    this.tracking.connect();

    // Si llega una placa por query param, la activamos
    this.route.queryParamMap.pipe(takeUntil(this.destroy$)).subscribe((qp) => {
      const plate = qp.get("plate");
      if (plate) this.addPlate(plate);
    });
  }

  addPlate(plate: string) {
    const normalized = (plate || "").trim().toUpperCase();
    if (!normalized) return;
    if (this.plates.includes(normalized)) return;
    this.plates.push(normalized);

    // Crear una polyline vacía para la placa y añadirla al mapa
    const poly = L.polyline([], { color: "#2dce89", weight: 4 });
    poly.addTo(this.map);
    this.polylines[normalized] = poly;

    // Suscribirnos a posiciones en tiempo real para la placa
    this.tracking
      .positions$(normalized)
      .pipe(takeUntil(this.destroy$))
      .subscribe((pos: Position | undefined) => {
        if (!pos) return;
        console.log(`[MAP] Posición recibida ${normalized}:`, pos);
        const latlng: L.LatLngExpression = [pos.lat, pos.lng];

        // Actualizar polilínea: append punto y limitar tamaño
        const current = this.polylines[normalized].getLatLngs() as L.LatLng[];
        current.push(L.latLng(pos.lat, pos.lng));
        if (current.length > 600) current.shift();
        this.polylines[normalized].setLatLngs(current);

        // Actualizar marcador
        const existing = this.markers[normalized];
        if (existing) {
          existing.setLatLng(latlng);
        } else {
          const marker = L.marker(latlng, {
            title: normalized,
            icon: this.courierIcon,
          });
          marker.addTo(this.map);
          this.markers[normalized] = marker;
        }

        // Centrar al primer punto recibido
        if (current.length === 1) {
          this.map.setView(latlng as L.LatLngExpression, this.defaultZoom);
        }
      });

    // Escuchar también el evento WebSocket crudo de la placa
    // Esto permite compatibilidad con emisores que publican objetos variados.
    this.webSocketService.setNameEvent(normalized);
    const sub = this.webSocketService.callback.subscribe((message) => {
      // Pedagógico: mostramos cualquier payload que llegue para la placa
      console.log(`[WS] Mensaje crudo (${normalized}):`, message);
      // Si el payload contiene lat/lng, lo aplicamos igual que arriba
      const maybeLat = message && (message.lat ?? message.latitude);
      const maybeLng = message && (message.lng ?? message.longitude);
      if (typeof maybeLat === "number" && typeof maybeLng === "number") {
        const latlng: L.LatLngExpression = [maybeLat, maybeLng];
        const current = this.polylines[normalized].getLatLngs() as L.LatLng[];
        current.push(L.latLng(maybeLat, maybeLng));
        if (current.length > 600) current.shift();
        this.polylines[normalized].setLatLngs(current);
        const existing = this.markers[normalized];
        if (existing) existing.setLatLng(latlng);
        else {
          const marker = L.marker(latlng, {
            title: normalized,
            icon: this.courierIcon,
          });
          marker.addTo(this.map);
          this.markers[normalized] = marker;
        }
      }
    });
    // Aseguramos el lifecycle: al destruir, cancelar esta suscripción
    this.destroy$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => sub.unsubscribe());
  }

  // Inicia o detiene tracking en backend (opcional desde la vista)
  start(plate: string) {
    const p = (plate || "").trim().toUpperCase();
    if (!p) return;
    this.tracking.start(p).subscribe();
  }
  stop(plate: string) {
    const p = (plate || "").trim().toUpperCase();
    if (!p) return;
    this.tracking.stop(p).subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.tracking.disconnect();
    if (this.map) this.map.remove();
  }
}
