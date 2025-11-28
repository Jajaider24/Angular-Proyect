import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { TrackingService, Position } from "./tracking.service";
import * as L from "leaflet";

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

  constructor(private route: ActivatedRoute, private tracking: TrackingService) {}

  ngOnInit(): void {
    // Inicializa Leaflet
    this.map = L.map(this.mapEl.nativeElement).setView(this.defaultCenter, this.defaultZoom);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
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
        const current = (this.polylines[normalized].getLatLngs() as L.LatLng[]);
        current.push(L.latLng(pos.lat, pos.lng));
        if (current.length > 600) current.shift();
        this.polylines[normalized].setLatLngs(current);

        // Actualizar marcador
        const existing = this.markers[normalized];
        if (existing) {
          existing.setLatLng(latlng);
        } else {
          const marker = L.marker(latlng, { title: normalized, icon: this.courierIcon });
          marker.addTo(this.map);
          this.markers[normalized] = marker;
        }

        // Centrar al primer punto recibido
        if (current.length === 1) {
          this.map.setView(latlng as L.LatLngExpression, this.defaultZoom);
        }
      });
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
