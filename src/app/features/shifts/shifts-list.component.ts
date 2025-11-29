import { Component, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Subject, forkJoin, takeUntil } from "rxjs";
import Swal from "sweetalert2";

import { Shift } from "src/app/core/models";
import { ShiftsService } from "src/app/core/services/shifts.service";
import { DriversService } from "src/app/core/services/drivers.service";
import { MotorcyclesService } from "src/app/core/services/motorcycles.service";

@Component({
  selector: "app-shifts-list",
  templateUrl: "./shifts-list.component.html",
  styleUrls: ["./shifts-list.component.scss"],
})
export class ShiftsListComponent implements OnInit, OnDestroy {
  shifts: Shift[] = [];
  filteredShifts: Shift[] = [];
  loading = false;
  searchTerm = "";
  driverMap: Record<number, string> = {};
  motorcycleMap: Record<number, string> = {};
  private destroy$ = new Subject<void>();

  constructor(
    private shiftsService: ShiftsService,
    private driversService: DriversService,
    private motorcyclesService: MotorcyclesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadShifts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadShifts(): void {
    this.loading = true;
    forkJoin({
      shifts: this.shiftsService.list(),
      drivers: this.driversService.list(),
      motorcycles: this.motorcyclesService.list(),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ shifts, drivers, motorcycles }) => {
          this.shifts = shifts;
          this.filteredShifts = shifts;
          this.driverMap = drivers.reduce((acc, d) => ({ ...acc, [d.id]: d.name }), {});
          this.motorcycleMap = motorcycles.reduce(
            (acc, m) => ({ ...acc, [m.id]: m.licensePlate }),
            {}
          );
          this.loading = false;
        },
        error: (err) => {
          console.error("Error cargando turnos:", err);
          this.loading = false;
        },
      });
  }

  onSearch(): void {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredShifts = this.shifts;
      return;
    }
    this.filteredShifts = this.shifts.filter((s) => {
      return (
        String(s.id).includes(term) ||
        String(s.driverId).includes(term) ||
        String(s.motorcycleId).includes(term) ||
        (s.status || "").toLowerCase().includes(term)
      );
    });
  }

  createNew(): void {
    this.router.navigate(["/shifts/create"]);
  }

  viewDetail(id: number): void {
    this.router.navigate(["/shifts", id]);
  }

  editShift(id: number): void {
    this.router.navigate(["/shifts", id, "edit"]);
  }

  deleteShift(id: number): void {
    Swal.fire({
      title: "¿Eliminar turno?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((res) => {
      if (!res.isConfirmed) return;
      this.shiftsService
        .delete(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.shifts = this.shifts.filter((s) => s.id !== id);
            this.filteredShifts = this.filteredShifts.filter((s) => s.id !== id);
            Swal.fire("Eliminado", "El turno fue eliminado.", "success");
          },
          error: () => Swal.fire("Error", "No fue posible eliminar.", "error"),
        });
    });
  }

  getStatusBadgeClass(status?: string): string {
    const classes: any = {
      scheduled: "badge-info",
      in_progress: "badge-warning",
      finished: "badge-success",
      cancelled: "badge-danger",
    };
    return status ? classes[status] || "badge-secondary" : "badge-secondary";
  }

  formatDate(iso?: string): string {
    if (!iso) return "-";
    try {
      const d = new Date(iso);
      return d.toLocaleString();
    } catch {
      return iso || "-";
    }
  }
}
