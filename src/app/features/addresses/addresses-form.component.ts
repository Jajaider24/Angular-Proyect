import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { Subject, takeUntil } from "rxjs";
import { Address } from "src/app/core/models";
import { AddressesService } from "src/app/core/services/addresses.service";
import { OrdersService } from "src/app/core/services/orders.service";
import * as L from "leaflet";
import { AddressLocationCacheService } from "src/app/core/services/address-location-cache.service";

// Ícono por defecto Leaflet (CDN) para evitar problemas de resolución de assets
const DEFAULT_LEAFLET_ICON = L.icon({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
// @ts-ignore sobrescribimos configuración global
L.Marker.prototype.options.icon = DEFAULT_LEAFLET_ICON;

/**
 * Componente para crear y editar direcciones de entrega.
 *
 * Validaciones implementadas:
 * - order_id: Requerido (FK a Order)
 * - street: Requerido, mínimo 5 caracteres, máximo 100
 * - city: Requerido, mínimo 3 caracteres, máximo 50, solo letras
 * - state: Requerido, mínimo 3 caracteres, máximo 50
 * - postal_code: Requerido, formato código postal (alfanumérico 4-10 caracteres)
 * - additional_info: Opcional, máximo 500 caracteres
 *
 * Modos de operación:
 * - CREATE: /addresses/create (isEdit = false)
 * - EDIT: /addresses/:id/edit (isEdit = true)
 */
@Component({
  selector: "app-addresses-form",
  templateUrl: "./addresses-form.component.html",
  styleUrls: ["./addresses-form.component.scss"],
})
export class AddressesFormComponent implements OnInit, OnDestroy {
  // Formulario reactivo con validaciones
  form!: FormGroup;

  // Estados de UI
  loading = false;
  isEdit = false;
  submitted = false;

  // ID de la dirección en modo edición
  addressId?: number;

  // Lista de orders disponibles para el selector
  availableOrders: any[] = [];

  // Subject para limpieza de suscripciones
  private destroy$ = new Subject<void>();
  private map?: L.Map;
  private marker?: L.Marker;

  constructor(
    private fb: FormBuilder,
    private addressesService: AddressesService,
    private ordersService: OrdersService,
    private router: Router,
    private route: ActivatedRoute,
    private locationCache: AddressLocationCacheService
  ) {}

  ngOnInit(): void {
    // Inicializar formulario con validaciones
    this.buildForm();

    // Cargar lista de órdenes disponibles
    this.loadOrders();

    // Detectar si estamos en modo edición
    const idParam = this.route.snapshot.paramMap.get("id");
    if (idParam) {
      this.isEdit = true;
      this.addressId = Number(idParam);
      this.loadAddress(this.addressId);
    } else {
      // Modo creación: inicializar mapa centrado por defecto
      setTimeout(() => this.initMap(), 0);
    }
  }

  // (Eliminado ngOnDestroy duplicado; ver al final para cleanup del mapa y suscripciones)

  /**
   * Construye el formulario reactivo con todas las validaciones.
   * Aplica validadores tanto síncronos como asíncronos si es necesario.
   */
  private buildForm(): void {
    this.form = this.fb.group({
      // Order ID: obligatorio, debe ser un número válido
      order_id: [null, [Validators.required]],

      // Calle: obligatoria, longitud entre 5-100 caracteres
      street: [
        "",
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(100),
        ],
      ],

      // Ciudad: obligatoria, solo letras y espacios, 3-50 caracteres
      city: [
        "",
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
          Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/),
        ],
      ],

      // Estado: obligatorio, 3-50 caracteres
      state: [
        "",
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
        ],
      ],

      // Código postal: obligatorio, alfanumérico 4-10 caracteres
      postal_code: [
        "",
        [
          Validators.required,
          Validators.minLength(4),
          Validators.maxLength(10),
          Validators.pattern(/^[a-zA-Z0-9\s-]+$/),
        ],
      ],

      // Información adicional: opcional, máximo 500 caracteres
      additional_info: ["", [Validators.maxLength(500)]],

      // Coordenadas opcionales para ubicación precisa
      lat: [null],
      lng: [null],
    });
  }

  /**
   * Carga la lista de órdenes disponibles para el selector.
   * Solo se muestran órdenes que no tienen dirección asignada (o la actual en edición).
   */
  private loadOrders(): void {
    this.ordersService
      .list()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (orders) => {
          this.availableOrders = orders;
        },
        error: (err) => {
          console.error("Error al cargar órdenes:", err);
        },
      });
  }

  /**
   * Carga los datos de una dirección existente para edición.
   * Hace un patch del formulario con los valores obtenidos.
   */
  private loadAddress(id: number): void {
    this.loading = true;
    this.addressesService
      .get(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (address: any) => {
          // Normalizar y hacer patch
          const normalized: Partial<Address> = {
            id: address.id,
            street: address.street,
            city: address.city,
            state: address.state,
            postalCode: address.postalCode ?? address.postal_code,
            lat: address.lat ?? address.latitude,
            lng: address.lng ?? address.longitude,
            orderId: address.orderId ?? address.order_id,
          } as any;
          this.form.patchValue({
            order_id: normalized.orderId,
            street: normalized.street,
            city: normalized.city,
            state: normalized.state,
            postal_code: normalized.postalCode,
            additional_info: (address as any).additional_info,
            lat: normalized.lat,
            lng: normalized.lng,
          });
          // Recuperar coords cache si backend no las devolvió
          if ((!normalized.lat || !normalized.lng) && this.addressId) {
            const cached = this.locationCache.get(this.addressId);
            if (cached) {
              this.form.patchValue({ lat: cached.lat, lng: cached.lng });
              setTimeout(() => this.initMap(cached.lat, cached.lng), 0);
            } else {
              setTimeout(() => this.initMap(), 0);
            }
          } else {
          // Inicializar mapa si hay coords
            if (normalized.lat && normalized.lng) {
              setTimeout(() => this.initMap(normalized.lat!, normalized.lng!), 0);
            } else {
              setTimeout(() => this.initMap(), 0);
            }
          }
          this.loading = false;
        },
        error: (err) => {
          console.error("Error al cargar dirección:", err);
          this.loading = false;
          // TODO: Mostrar notificación y redirigir
          this.router.navigate(["/addresses"]);
        },
      });
  }

  /**
   * Guarda la dirección (crear o actualizar según el modo).
   * Valida el formulario antes de enviar.
   */
  onSubmit(): void {
    this.submitted = true;

    // Validar formulario
    if (this.form.invalid) {
      // Marcar todos los campos como touched para mostrar errores
      Object.keys(this.form.controls).forEach((key) => {
        this.form.get(key)?.markAsTouched();
      });
      return;
    }

    const v = this.form.value;
    const payload: any = {
      order_id: v.order_id,
      street: v.street,
      city: v.city,
      state: v.state,
      postal_code: v.postal_code,
      additional_info: v.additional_info,
      lat: v.lat,
      lng: v.lng,
    };
    this.loading = true;

    // Decidir operación según modo
    const operation =
      this.isEdit && this.addressId
        ? this.addressesService.update(this.addressId, payload)
        : this.addressesService.create(payload);

    operation.pipe(takeUntil(this.destroy$)).subscribe({
      next: (saved: any) => {
        // Persistir coords solo en cache local
        if (v.lat && v.lng) {
          const id = this.isEdit ? this.addressId! : saved?.id;
          if (id) this.locationCache.set(id, Number(v.lat), Number(v.lng));
        }
        this.router.navigate(["/addresses"]);
      },
      error: (err) => {
        console.error("Error al guardar dirección:", err);
        this.loading = false;
        // TODO: Mostrar notificación de error
      },
    });
  }

  /**
   * Cancela la operación y regresa al listado.
   */
  onCancel(): void {
    this.router.navigate(["/addresses"]);
  }

  /**
   * Helper para acceder fácilmente a los controles del formulario en el template.
   */
  get f() {
    return this.form.controls;
  }

  /**
   * Valida si un campo tiene errores y ha sido touched.
   */
  hasError(field: string): boolean {
    const control = this.form.get(field);
    return !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched || this.submitted)
    );
  }

  /**
   * Obtiene el mensaje de error específico para un campo.
   */
  getErrorMessage(field: string): string {
    const control = this.form.get(field);
    if (!control || !control.errors) return "";

    const errors = control.errors;

    if (errors["required"]) return "Este campo es obligatorio";
    if (errors["minlength"]) {
      const min = errors["minlength"].requiredLength;
      return `Debe tener al menos ${min} caracteres`;
    }
    if (errors["maxlength"]) {
      const max = errors["maxlength"].requiredLength;
      return `No puede exceder ${max} caracteres`;
    }
    if (errors["pattern"]) {
      if (field === "city") return "Solo se permiten letras y espacios";
      if (field === "postal_code") return "Formato de código postal inválido";
    }

    return "Valor inválido";
  }

  /** Mapa interactivo para seleccionar coordenadas */
  private initMap(lat?: number, lng?: number) {
    if (this.map) {
      this.map.remove();
      this.map = undefined;
    }
    const center: [number, number] = [lat ?? 5.0703, lng ?? -75.5138]; // Manizales por defecto
    this.map = L.map("addressFormMap", { center, zoom: 14 });
    setTimeout(() => this.map?.invalidateSize(), 150);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(this.map);

    if (lat && lng) {
      this.marker = L.marker([lat, lng], { draggable: true }).addTo(this.map);
      this.marker.on("dragend", () => {
        const p = this.marker!.getLatLng();
        this.form.patchValue({ lat: p.lat, lng: p.lng });
      });
    }

    this.map.on("click", (e: L.LeafletMouseEvent) => {
      const { latlng } = e;
      if (!this.marker) {
        this.marker = L.marker(latlng, { draggable: true }).addTo(this.map!);
        this.marker.on("dragend", () => {
          const p = this.marker!.getLatLng();
          this.form.patchValue({ lat: p.lat, lng: p.lng });
        });
      } else {
        this.marker.setLatLng(latlng);
      }
      this.form.patchValue({ lat: latlng.lat, lng: latlng.lng });
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.map) {
      this.map.remove();
      this.map = undefined;
    }
  }
}
