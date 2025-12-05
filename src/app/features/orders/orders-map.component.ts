/**
 * OrdersMapComponent
 * ------------------
 * Componente de mapa interactivo para visualizar en tiempo real
 * la ubicación de las motocicletas asignadas a los pedidos.
 *
 * Usa Leaflet para renderizar el mapa y TrackingService para:
 * 1. Iniciar/detener el tracking en el backend (POST /motorcycles/track/{plate})
 * 2. Escuchar las coordenadas emitidas por WebSocket (evento = placa)
 *
 * El backend (Flask-SocketIO) emite cada 5 segundos un objeto { lat, lng }
 * usando el nombre del evento igual a la placa de la moto.
 */
import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import * as L from "leaflet";
import { Subject, Subscription } from "rxjs";
import { takeUntil } from "rxjs/operators";
import Swal from "sweetalert2";
import { Position, TrackingService } from "../../services/tracking.service";

// Fix para iconos de Leaflet en Angular (problema conocido con webpack)
// Los iconos por defecto no cargan correctamente sin esto
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "assets/leaflet/marker-icon-2x.png",
  iconUrl: "assets/leaflet/marker-icon.png",
  shadowUrl: "assets/leaflet/marker-shadow.png",
});

@Component({
  selector: "app-orders-map",
  templateUrl: "./orders-map.component.html",
  styleUrls: ["./orders-map.component.scss"],
})
export class OrdersMapComponent implements OnInit, OnDestroy {
  // Referencia al contenedor del mapa en el template
  @ViewChild("map", { static: true }) mapEl!: ElementRef<HTMLDivElement>;

  // Instancia del mapa Leaflet
  private map!: L.Map;

  // Centro por defecto (Manizales, Colombia)
  private defaultCenter: L.LatLngExpression = [5.0703, -75.5138];
  private defaultZoom = 14;

  // Estado de placas activas → marcador y polilínea por cada una
  plates: string[] = [];
  markers: Record<string, L.Marker> = {};
  polylines: Record<string, L.Polyline> = {};

  // Placa que se está siguiendo activamente (el mapa se centra en ella)
  followingPlate: string | null = null;

  // Subject para manejar la destrucción del componente
  private destroy$ = new Subject<void>();

  // Suscripción al observable de posiciones del TrackingService
  private positionsSubscription?: Subscription;

  // Icono personalizado para el marcador de la moto (con fallback)
  private courierIcon: L.Icon;

  constructor(
    private route: ActivatedRoute,
    private tracking: TrackingService
  ) {
    // Crear icono personalizado de la moto
    this.courierIcon = L.icon({
      iconUrl: "assets/img/delivery.svg",
      iconSize: [48, 48],
      iconAnchor: [24, 48],
      popupAnchor: [0, -48],
    });
  }

  ngOnInit(): void {
    // Inicializar el mapa Leaflet
    this.initMap();

    // Suscribirse a las posiciones que emite el TrackingService
    this.subscribeToPositions();

    // Si llega una placa por query param, iniciar tracking automáticamente
    this.route.queryParamMap.pipe(takeUntil(this.destroy$)).subscribe((qp) => {
      const plate = qp.get("plate");
      if (plate) {
        this.startTracking(plate);
      }
    });
  }

  /**
   * Inicializa el mapa Leaflet con OpenStreetMap como capa base.
   */
  private initMap(): void {
    this.map = L.map(this.mapEl.nativeElement).setView(
      this.defaultCenter,
      this.defaultZoom
    );

    // Agregar capa de tiles de OpenStreetMap
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);
  }

  /**
   * Se suscribe al observable positions$ del TrackingService.
   * Cada vez que llega una posición, actualiza el mapa.
   */
  private subscribeToPositions(): void {
    this.positionsSubscription = this.tracking.positions$
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ plate, position }) => {
        console.log(`[MAP] Posición recibida para ${plate}:`, position);
        this.updateMapForPlate(plate, position);
      });
  }

  /**
   * Actualiza el marcador y la polilínea de una placa en el mapa.
   *
   * @param plate - Placa de la motocicleta
   * @param position - Coordenadas { lat, lng }
   */
  private updateMapForPlate(plate: string, position: Position): void {
    const latlng: L.LatLngExpression = [position.lat, position.lng];

    // Crear polyline si no existe para esta placa
    if (!this.polylines[plate]) {
      const poly = L.polyline([], { color: "#2dce89", weight: 4 });
      poly.addTo(this.map);
      this.polylines[plate] = poly;
    }

    // Actualizar polilínea: agregar punto y limitar tamaño
    const currentPath = this.polylines[plate].getLatLngs() as L.LatLng[];
    currentPath.push(L.latLng(position.lat, position.lng));
    if (currentPath.length > 600) currentPath.shift(); // Limitar a 600 puntos
    this.polylines[plate].setLatLngs(currentPath);

    // Actualizar o crear marcador
    if (this.markers[plate]) {
      this.markers[plate].setLatLng(latlng);
      console.log(`[MAP] Marcador actualizado para ${plate}:`, latlng);
    } else {
      // Crear marcador con icono personalizado
      const marker = L.marker(latlng, {
        title: plate,
        icon: this.courierIcon,
      });
      marker.bindPopup(`<b>🏍️ Moto:</b> ${plate}`);
      marker.addTo(this.map);
      this.markers[plate] = marker;
      console.log(`[MAP] ✅ Marcador CREADO para ${plate}:`, latlng);
    }

    // Centrar el mapa si es el primer punto O si estamos siguiendo esta placa
    if (currentPath.length === 1 || this.followingPlate === plate) {
      this.map.setView(latlng, this.defaultZoom);
    }
  }

  /**
   * Agrega una placa a la lista de placas activas (sin iniciar tracking).
   * Útil para preparar la visualización antes de recibir coordenadas.
   *
   * @param plate - Placa de la motocicleta
   */
  addPlate(plate: string): void {
    const normalized = (plate || "").trim().toUpperCase();
    if (!normalized) return;
    if (this.plates.includes(normalized)) return;
    this.plates.push(normalized);

    // Crear polyline vacía para la placa
    const poly = L.polyline([], { color: "#2dce89", weight: 4 });
    poly.addTo(this.map);
    this.polylines[normalized] = poly;
  }

  /**
   * Activa el modo de seguimiento para una placa específica.
   * El mapa se centrará automáticamente en la moto mientras se mueve.
   *
   * @param plate - Placa de la motocicleta a seguir
   */
  followPlate(plate: string): void {
    const normalized = (plate || "").trim().toUpperCase();
    if (!normalized) {
      Swal.fire("Error", "Ingresa una placa válida", "warning");
      return;
    }

    // Agregar a la lista si no está
    this.addPlate(normalized);

    // Activar seguimiento
    this.followingPlate = normalized;

    // Si ya existe un marcador para esta placa, centrar en él
    if (this.markers[normalized]) {
      const pos = this.markers[normalized].getLatLng();
      this.map.setView(pos, this.defaultZoom);
    }

    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: `Siguiendo a ${normalized} 📍`,
      showConfirmButton: false,
      timer: 2000,
    });

    console.log(`[MAP] 📍 Modo seguimiento activado para ${normalized}`);
  }

  /**
   * Desactiva el modo de seguimiento.
   * El mapa dejará de centrarse automáticamente.
   */
  unfollowPlate(): void {
    if (this.followingPlate) {
      console.log(
        `[MAP] Modo seguimiento desactivado para ${this.followingPlate}`
      );
      this.followingPlate = null;
    }
  }

  /**
   * Inicia el tracking de una motocicleta.
   * Llama al backend POST /motorcycles/track/{plate}
   * y comienza a escuchar las coordenadas por WebSocket.
   *
   * @param plate - Placa de la motocicleta
   */
  startTracking(plate: string): void {
    const normalized = (plate || "").trim().toUpperCase();
    if (!normalized) {
      Swal.fire("Error", "Ingresa una placa válida", "warning");
      return;
    }

    // Agregar a la lista si no está
    this.addPlate(normalized);

    // Iniciar tracking en el backend
    this.tracking.start(normalized).subscribe({
      next: (response) => {
        console.log(`[MAP] Tracking iniciado para ${normalized}:`, response);
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: `Tracking iniciado para ${normalized}`,
          showConfirmButton: false,
          timer: 2000,
        });
      },
      error: (err) => {
        console.error(`[MAP] Error iniciando tracking:`, err);
        Swal.fire("Error", "No se pudo iniciar el tracking", "error");
      },
    });
  }

  /**
   * Detiene el tracking de una motocicleta.
   * Llama al backend POST /motorcycles/stop/{plate}
   *
   * @param plate - Placa de la motocicleta
   */
  stopTracking(plate: string): void {
    const normalized = (plate || "").trim().toUpperCase();
    if (!normalized) return;

    this.tracking.stop(normalized).subscribe({
      next: (response) => {
        console.log(`[MAP] Tracking detenido para ${normalized}:`, response);
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "info",
          title: `Tracking detenido para ${normalized}`,
          showConfirmButton: false,
          timer: 2000,
        });
      },
      error: (err) => {
        console.error(`[MAP] Error deteniendo tracking:`, err);
      },
    });
  }

  // Métodos públicos para el template (aliases)
  start(plate: string): void {
    this.startTracking(plate);
  }

  stop(plate: string): void {
    this.stopTracking(plate);
  }

  ngOnDestroy(): void {
    // Emitir señal de destrucción
    this.destroy$.next();
    this.destroy$.complete();

    // Cancelar suscripción a posiciones
    if (this.positionsSubscription) {
      this.positionsSubscription.unsubscribe();
    }

    // Limpiar el mapa
    if (this.map) {
      this.map.remove();
    }
  }
}
