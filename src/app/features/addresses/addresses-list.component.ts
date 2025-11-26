import { Component, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Subject, takeUntil } from "rxjs";
import { Address } from "src/app/core/models";
import { AddressesService } from "src/app/core/services/addresses.service";

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
    private router: Router
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
          this.addresses = data;
          this.filteredAddresses = data;
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

    // Filtrar por múltiples campos
    this.filteredAddresses = this.addresses.filter((addr) => {
      return (
        addr.street?.toLowerCase().includes(term) ||
        addr.city?.toLowerCase().includes(term) ||
        addr.state?.toLowerCase().includes(term) ||
        addr.postalCode?.toLowerCase().includes(term)
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
    // TODO: Importar Swal (SweetAlert2) cuando esté disponible
    const confirmDelete = confirm(
      "¿Estás seguro de eliminar esta dirección? Esta acción no se puede deshacer."
    );

    if (!confirmDelete) return;

    this.addressesService
      .delete(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // Remover de la lista local sin recargar
          this.addresses = this.addresses.filter((a) => a.id !== id);
          this.filteredAddresses = this.filteredAddresses.filter(
            (a) => a.id !== id
          );
          // TODO: Mostrar notificación de éxito
        },
        error: (err) => {
          console.error("Error al eliminar dirección:", err);
          // TODO: Mostrar notificación de error
        },
      });
  }

  /**
   * Navega al formulario de creación de nueva dirección.
   */
  createNew(): void {
    this.router.navigate(["/addresses/create"]);
  }
}
