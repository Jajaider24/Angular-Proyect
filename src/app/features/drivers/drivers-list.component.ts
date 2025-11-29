import { Component, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Subject, takeUntil } from "rxjs";
import { Driver } from "src/app/core/models";
import { DriversService } from "src/app/core/services/drivers.service";
import Swal from "sweetalert2";

@Component({
  selector: "app-drivers-list",
  templateUrl: "./drivers-list.component.html",
  styleUrls: ["./drivers-list.component.scss"],
})
export class DriversListComponent implements OnInit, OnDestroy {
  drivers: Driver[] = [];
  filteredDrivers: Driver[] = [];
  loading = false;
  searchTerm = "";
  private destroy$ = new Subject<void>();

  constructor(private driversService: DriversService, private router: Router) {}

  ngOnInit(): void {
    this.loadDrivers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDrivers(): void {
    this.loading = true;
    this.driversService
      .list()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.drivers = data;
          this.filteredDrivers = data;
          this.loading = false;
        },
        error: (err) => {
          console.error("Error:", err);
          this.loading = false;
        },
      });
  }

  onSearch(): void {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredDrivers = this.drivers;
      return;
    }

    this.filteredDrivers = this.drivers.filter((d) => {
      return (
        d.name?.toLowerCase().includes(term) ||
        d.licenseNumber?.toLowerCase().includes(term) ||
        d.phone?.includes(term) ||
        d.email?.toLowerCase().includes(term)
      );
    });
  }

  viewDetail(id: number): void {
    this.router.navigate(["/drivers", id]);
  }

  editDriver(id: number): void {
    this.router.navigate(["/drivers", id, "edit"]);
  }

  deleteDriver(id: number): void {
    Swal.fire({
      title: "¿Eliminar conductor?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((res) => {
      if (!res.isConfirmed) return;
      this.driversService
        .delete(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.drivers = this.drivers.filter((d) => d.id !== id);
            this.filteredDrivers = this.filteredDrivers.filter(
              (d) => d.id !== id
            );
            Swal.fire("Eliminado", "El conductor fue eliminado.", "success");
          },
          error: () =>
            Swal.fire("Error", "No fue posible eliminar.", "error"),
        });
    });
  }

  createNew(): void {
    this.router.navigate(["/drivers/create"]);
  }

  getStatusBadgeClass(status: string): string {
    const classes: any = {
      available: "badge-success",
      on_shift: "badge-warning",
      unavailable: "badge-secondary",
    };
    return classes[status] || "badge-secondary";
  }

  getStatusLabel(status: string): string {
    const labels: any = {
      available: "Disponible",
      on_shift: "En Turno",
      unavailable: "No Disponible",
    };
    return labels[status] || status;
  }
}
