import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Subject, takeUntil } from "rxjs";
import { Address } from "src/app/core/models";
import { AddressesService } from "src/app/core/services/addresses.service";

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
  // Dirección actual
  address?: Address;
  
  // Estados de UI
  loading = false;
  
  // ID de la dirección
  addressId!: number;
  
  // Subject para limpieza de suscripciones
  private destroy$ = new Subject<void>();

  constructor(
    private addressesService: AddressesService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Obtener ID de la ruta
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
  }

  /**
   * Carga los detalles de la dirección desde el backend.
   */
  loadAddress(): void {
    this.loading = true;
    this.addressesService
      .get(this.addressId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.address = data;
          this.loading = false;
        },
        error: (err) => {
          console.error("Error al cargar dirección:", err);
          this.loading = false;
          // TODO: Mostrar notificación
          this.router.navigate(["/addresses"]);
        },
      });
  }

  /**
   * Navega al formulario de edición.
   */
  editAddress(): void {
    this.router.navigate(["/addresses", this.addressId, "edit"]);
  }

  /**
   * Elimina la dirección con confirmación.
   */
  deleteAddress(): void {
    const confirmDelete = confirm(
      "¿Estás seguro de eliminar esta dirección? Esta acción no se puede deshacer."
    );

    if (!confirmDelete) return;

    this.addressesService
      .delete(this.addressId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // TODO: Mostrar notificación de éxito
          this.router.navigate(["/addresses"]);
        },
        error: (err) => {
          console.error("Error al eliminar dirección:", err);
          // TODO: Mostrar notificación de error
        },
      });
  }

  /**
   * Regresa al listado.
   */
  goBack(): void {
    this.router.navigate(["/addresses"]);
  }

  /**
   * Formatea una fecha ISO a formato legible.
   */
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
