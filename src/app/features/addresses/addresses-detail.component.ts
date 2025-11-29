import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Subject, takeUntil } from "rxjs";
import { Address } from "src/app/core/models";
import { AddressesService } from "src/app/core/services/addresses.service";
import { AddressLocationCacheService } from "src/app/core/services/address-location-cache.service";
import * as L from "leaflet";

// Configuración explícita del ícono de Leaflet (evita problemas de ruta en bundlers Angular)
const DEFAULT_LEAFLET_ICON = L.icon({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
// Aplicar como ícono por defecto para todos los marcadores
// (Esto previene el recuadro vacío cuando las imágenes no se resuelven por Webpack)
// @ts-ignore
L.Marker.prototype.options.icon = DEFAULT_LEAFLET_ICON;

/**
 * Componente para mostrar el detalle completo de una dirección.
 *
 * Funcionalidades:
 * - Muestra todos los campos de la dirección en formato de lectura
 * - Navegación rápida a edición y eliminación
 * - Muestra información relacionada (orden asociada, cliente)
 * - Breadcrumbs para navegación
 */
@Component({
  selector: "app-addresses-detail",
  templateUrl: "./addresses-detail.component.html",
  styleUrls: ["./addresses-detail.component.scss"],
})
export class AddressesDetailComponent implements OnInit, OnDestroy {
  // Dirección actual (normalizada a camelCase)
  address?: Address;

  // Estados de UI
  loading = false;

  // ID de la dirección
  addressId!: number;

  // Gestión de suscripciones y mapa
  private destroy$ = new Subject<void>();
  private map?: L.Map;
  private marker?: L.Marker;

  constructor(
    private addressesService: AddressesService,
    private route: ActivatedRoute,
    private router: Router,
    private locationCache: AddressLocationCacheService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get("id");
    if (!idParam) {
      this.router.navigate(["/addresses"]);
      return;
    }
    this.addressId = Number(idParam);
    this.loadAddress();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.map) {
      this.map.remove();
      this.map = undefined;
    }
  }

  /** Carga el detalle y configura el mapa si hay coordenadas */
  loadAddress(): void {
    this.loading = true;
    this.addressesService
      .get(this.addressId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          this.address = this.normalize(data);
          // Recuperar coords de cache si backend no las provee
          if ((!this.address.lat || !this.address.lng) && this.address.id) {
            const cached = this.locationCache.get(this.address.id);
            if (cached) {
              this.address.lat = cached.lat;
              this.address.lng = cached.lng;
            }
          }
          this.loading = false;
          if (this.address?.lat && this.address?.lng) {
            setTimeout(() => this.initMap(this.address!), 0);
          }
        },
        error: (err) => {
          console.error("Error al cargar dirección:", err);
          this.loading = false;
          this.router.navigate(["/addresses"]);
        },
      });
  }

  /** Normaliza posibles campos snake_case a camelCase */
  private normalize(a: any): Address {
    return {
      id: a.id,
      street: a.street,
      city: a.city,
      state: a.state,
      postalCode: a.postalCode ?? a.postal_code,
      lat: a.lat != null ? Number(a.lat) : a.latitude != null ? Number(a.latitude) : undefined,
      lng: a.lng != null ? Number(a.lng) : a.longitude != null ? Number(a.longitude) : undefined,
      orderId: a.orderId ?? a.order_id,
      // Metadatos
      // @ts-ignore - extendemos Address con createdAt para formateo
      createdAt: a.createdAt ?? a.created_at,
    } as Address;
  }

  /** Inicializa Leaflet y coloca un marcador en la dirección */
  private initMap(addr: Address): void {
    if (this.map) {
      this.map.remove();
      this.map = undefined;
    }
    const centerLat = Number(addr.lat!);
    const centerLng = Number(addr.lng!);
    this.map = L.map("addressMap", {
      center: [centerLat, centerLng],
      zoom: 16,
    });
    // Aseguramos recalcular tamaño por si el contenedor se renderiza después
    setTimeout(() => this.map?.invalidateSize(), 150);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(this.map);
    this.marker = L.marker([centerLat, centerLng]).addTo(this.map);
    this.marker
      .bindPopup(`<b>Dirección #${addr.id}</b><br>${addr.street}`)
      .openPopup();
  }

  /** Navega al formulario de edición */
  editAddress(): void {
    this.router.navigate(["/addresses", this.addressId, "edit"]);
  }

  /** Elimina la dirección con confirmación */
  deleteAddress(): void {
    const confirmDelete = confirm(
      "¿Estás seguro de eliminar esta dirección? Esta acción no se puede deshacer."
    );
    if (!confirmDelete) return;
    this.addressesService
      .delete(this.addressId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.router.navigate(["/addresses"]),
        error: (err) => console.error("Error al eliminar dirección:", err),
      });
  }

  /** Regresa al listado */
  goBack(): void {
    this.router.navigate(["/addresses"]);
  }

  /** Formatea fecha ISO a legible */
  formatDate(dateString?: string): string {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
}
