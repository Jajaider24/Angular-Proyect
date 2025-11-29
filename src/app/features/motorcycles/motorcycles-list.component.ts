import { Component, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Subject, takeUntil } from "rxjs";
import Swal from "sweetalert2";
import { Motorcycle } from "src/app/core/models";
import { MotorcyclesService } from "src/app/core/services/motorcycles.service";

@Component({
  selector: "app-motorcycles-list",
  templateUrl: "./motorcycles-list.component.html",
  styleUrls: ["./motorcycles-list.component.scss"],
})
export class MotorcyclesListComponent implements OnInit, OnDestroy {
  motorcycles: Motorcycle[] = [];
  filteredMotorcycles: Motorcycle[] = [];
  loading = false;
  searchTerm = "";
  private destroy$ = new Subject<void>();

  constructor(
    private motorcyclesService: MotorcyclesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadMotorcycles();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadMotorcycles(): void {
    this.loading = true;
    this.motorcyclesService
      .list()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.motorcycles = data;
          this.filteredMotorcycles = data;
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
      this.filteredMotorcycles = this.motorcycles;
      return;
    }

    this.filteredMotorcycles = this.motorcycles.filter((m) => {
      return (
        m.licensePlate?.toLowerCase().includes(term) ||
        m.brand?.toLowerCase().includes(term) ||
        m.year?.toString().includes(term)
      );
    });
  }

  viewDetail(id: number): void {
    this.router.navigate(["/motorcycles", id]);
  }

  editMotorcycle(id: number): void {
    this.router.navigate(["/motorcycles", id, "edit"]);
  }

  deleteMotorcycle(id: number): void {
    Swal.fire({
      title: "¿Eliminar motocicleta?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((res) => {
      if (!res.isConfirmed) return;
      this.motorcyclesService
        .delete(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.motorcycles = this.motorcycles.filter((m) => m.id !== id);
            this.filteredMotorcycles = this.filteredMotorcycles.filter(
              (m) => m.id !== id
            );
            Swal.fire("Eliminada", "La motocicleta fue eliminada.", "success");
          },
          error: () => Swal.fire("Error", "No fue posible eliminar.", "error"),
        });
    });
  }

  createNew(): void {
    this.router.navigate(["/motorcycles/create"]);
  }

  getStatusBadgeClass(status: string): string {
    const classes: any = {
      available: "badge-success",
      in_use: "badge-warning",
      maintenance: "badge-danger",
    };
    return classes[status] || "badge-secondary";
  }

  getStatusLabel(status: string): string {
    const labels: any = {
      available: "Disponible",
      in_use: "En Uso",
      maintenance: "Mantenimiento",
    };
    return labels[status] || status;
  }
}
