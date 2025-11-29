import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Subject, forkJoin, takeUntil } from "rxjs";
import Swal from "sweetalert2";

import { Shift, Driver, Motorcycle } from "src/app/core/models";
import { ShiftsService } from "src/app/core/services/shifts.service";
import { DriversService } from "src/app/core/services/drivers.service";
import { MotorcyclesService } from "src/app/core/services/motorcycles.service";

@Component({
  selector: "app-shifts-detail",
  templateUrl: "./shifts-detail.component.html",
  styleUrls: ["./shifts-detail.component.scss"],
})
export class ShiftsDetailComponent implements OnInit, OnDestroy {
  shift?: Shift;
  driverMap: Record<number, Driver> = {};
  motorcycleMap: Record<number, Motorcycle> = {};
  loading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private shiftsService: ShiftsService,
    private driversService: DriversService,
    private motorcyclesService: MotorcyclesService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get("id");
    if (!idParam) return;
    const id = Number(idParam);
    this.loadData(id);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData(id: number): void {
    this.loading = true;
    forkJoin({
      shift: this.shiftsService.get(id),
      drivers: this.driversService.list(),
      motorcycles: this.motorcyclesService.list(),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ shift, drivers, motorcycles }) => {
          this.shift = shift;
          this.driverMap = drivers.reduce((acc, d) => ({ ...acc, [d.id]: d }), {});
          this.motorcycleMap = motorcycles.reduce(
            (acc, m) => ({ ...acc, [m.id]: m }),
            {}
          );
          this.loading = false;
        },
        error: (err) => {
          console.error("Error cargando turno:", err);
          this.loading = false;
        },
      });
  }

  formatDate(iso?: string): string {
    if (!iso) return "-";
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  }

  getDuration(): string {
    if (!this.shift?.startTime) return "-";
    const start = new Date(this.shift.startTime).getTime();
    const end = this.shift.endTime ? new Date(this.shift.endTime).getTime() : Date.now();
    const diffMs = end - start;
    if (diffMs < 0) return "-";
    const hours = Math.floor(diffMs / 3600000);
    const minutes = Math.floor((diffMs % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  }

  canFinalize(): boolean {
    return this.shift?.status === "in_progress";
  }

  canCancel(): boolean {
    return this.shift?.status === "scheduled" || this.shift?.status === "in_progress";
  }

  finalizeShift(): void {
    if (!this.shift) return;
    Swal.fire({
      title: "Finalizar turno?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Finalizar",
      cancelButtonText: "Cancelar",
    }).then((res) => {
      if (!res.isConfirmed) return;
      const payload = {
        endTime: new Date().toISOString(),
        status: "finished",
      };
      this.shiftsService
        .update(this.shift!.id, payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (updated) => {
            this.shift = updated;
            Swal.fire("Turno finalizado", "Se marcó como finalizado.", "success");
          },
          error: () => Swal.fire("Error", "No se pudo finalizar.", "error"),
        });
    });
  }

  cancelShift(): void {
    if (!this.shift) return;
    Swal.fire({
      title: "Cancelar turno?",
      text: "Esto lo marcará como cancelado.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Cancelar turno",
      cancelButtonText: "Volver",
    }).then((res) => {
      if (!res.isConfirmed) return;
      const payload = {
        status: "cancelled",
      };
      this.shiftsService
        .update(this.shift!.id, payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (updated) => {
            this.shift = updated;
            Swal.fire("Turno cancelado", "Se marcó como cancelado.", "success");
          },
          error: () => Swal.fire("Error", "No se pudo cancelar.", "error"),
        });
    });
  }

  backToList(): void {
    this.router.navigate(["/shifts"]);
  }
}
