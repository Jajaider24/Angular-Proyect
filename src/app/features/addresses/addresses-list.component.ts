import { Component, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Subject, takeUntil } from "rxjs";
import { Address } from "src/app/core/models";
import { AddressesService } from "src/app/core/services/addresses.service";
import { AddressLocationCacheService } from "src/app/core/services/address-location-cache.service";
import Swal from "sweetalert2";

/**
 * Componente para listar todas las direcciones de entrega del sistema.
 *
 * Funcionalidades:
 * - Listado paginado de direcciones
 * - Búsqueda en tiempo real por calle, ciudad, código postal
 * - Navegación a detalle, edición y creación
 * - Eliminación con confirmación (SweetAlert2)
 * - Manejo de estados de carga y error
 * - Limpieza automática de suscripciones con takeUntil
 *
 * Campos mostrados:
 * - ID, Calle, Ciudad, Estado, Código Postal
 * - Order ID (para identificar a qué pedido pertenece)
 */
@Component({
  selector: "app-addresses-list",
  templateUrl: "./addresses-list.component.html",
  styleUrls: ["./addresses-list.component.scss"],
})
export class AddressesListComponent implements OnInit, OnDestroy {
  // Lista de direcciones obtenida del backend
  addresses: Address[] = [];

  // Lista filtrada por búsqueda (para no mutar la original)
  filteredAddresses: Address[] = [];

  // Estados de UI
  loading = false;
  searchTerm = "";

  // Subject para limpiar suscripciones al destruir el componente
  private destroy$ = new Subject<void>();

  constructor(
    private addressesService: AddressesService,
    private router: Router,
    public locationCache: AddressLocationCacheService
  ) {}

  ngOnInit(): void {
    // Cargar datos iniciales al montar el componente
    this.loadAddresses();
  }

  ngOnDestroy(): void {
    // Emitir señal de destrucción para cancelar observables pendientes
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Obtiene todas las direcciones desde el backend.
   * Usa takeUntil para cancelar automáticamente si el componente se destruye.
   */
  loadAddresses(): void {
    this.loading = true;
    this.addressesService
      .list()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          // Normalizamos campos a camelCase para el template
          this.addresses = (data || []).map((a: any) => this.normalize(a));
          this.filteredAddresses = this.addresses;
          this.loading = false;
        },
        error: (err) => {
          console.error("Error al cargar direcciones:", err);
          this.loading = false;
          // TODO: Mostrar notificación de error con ToastrService
        },
      });
  }

  /**
   * Adapta posibles respuestas en snake_case a camelCase usados por la UI
   */
  private normalize(a: any): Address {
    return {
      id: a.id,
      street: a.street,
      city: a.city,
      state: a.state,
      postalCode: a.postalCode ?? a.postal_code,
      lat: a.lat,
      lng: a.lng,
      orderId: a.orderId ?? a.order_id,
    } as Address;
  }

  /**
   * Filtra las direcciones en tiempo real según el término de búsqueda.
   * Busca en: calle, ciudad, estado, código postal.
   */
  onSearch(): void {
    const term = this.searchTerm.toLowerCase().trim();

    if (!term) {
      // Si no hay término, mostrar todo
      this.filteredAddresses = this.addresses;
      return;
    }

    // Filtrar por múltiples campos en modelo ya normalizado
    this.filteredAddresses = this.addresses.filter((addr) => {
      return (
        addr.street?.toLowerCase().includes(term) ||
        addr.city?.toLowerCase().includes(term) ||
        (addr.state ? addr.state.toLowerCase().includes(term) : false) ||
        (addr.postalCode
          ? String(addr.postalCode).toLowerCase().includes(term)
          : false)
      );
    });
  }

  /**
   * Navega al detalle de una dirección específica.
   */
  viewDetail(id: number): void {
    this.router.navigate(["/addresses", id]);
  }

  /**
   * Navega al formulario de edición de una dirección.
   */
  editAddress(id: number): void {
    this.router.navigate(["/addresses", id, "edit"]);
  }

  /**
   * Elimina una dirección después de confirmación del usuario.
   * Usa SweetAlert2 para mostrar un diálogo de confirmación.
   */
  deleteAddress(id: number): void {
    Swal.fire({
      title: "¿Eliminar dirección?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((res) => {
      if (!res.isConfirmed) return;
      this.addressesService
        .delete(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.addresses = this.addresses.filter((a) => a.id !== id);
            this.filteredAddresses = this.filteredAddresses.filter(
              (a) => a.id !== id
            );
            Swal.fire("Eliminada", "La dirección fue eliminada.", "success");
          },
          error: () =>
            Swal.fire(
              "Error",
              "No fue posible eliminar la dirección.",
              "error"
            ),
        });
    });
  }

  /**
   * Navega al formulario de creación de nueva dirección.
   */
  createNew(): void {
    this.router.navigate(["/addresses/create"]);
  }
}
