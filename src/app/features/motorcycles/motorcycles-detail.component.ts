import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Subject, takeUntil } from "rxjs";
import { Motorcycle } from "src/app/core/models";
import { MotorcyclesService } from "src/app/core/services/motorcycles.service";

@Component({
  selector: "app-motorcycles-detail",
  templateUrl: "./motorcycles-detail.component.html",
  styleUrls: ["./motorcycles-detail.component.scss"],
})
export class MotorcyclesDetailComponent implements OnInit, OnDestroy {
  motorcycle?: Motorcycle;
  loading = false;
  motorcycleId!: number;
  private destroy$ = new Subject<void>();

  constructor(
    private motorcyclesService: MotorcyclesService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get("id");
    if (!idParam) {
      this.router.navigate(["/motorcycles"]);
      return;
    }

    this.motorcycleId = Number(idParam);
    this.loadMotorcycle();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadMotorcycle(): void {
    this.loading = true;
    this.motorcyclesService
      .get(this.motorcycleId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.motorcycle = data;
          this.loading = false;
        },
        error: (err) => {
          console.error("Error:", err);
          this.loading = false;
          this.router.navigate(["/motorcycles"]);
        },
      });
  }

  editMotorcycle(): void {
    this.router.navigate(["/motorcycles", this.motorcycleId, "edit"]);
  }

  deleteMotorcycle(): void {
    if (!confirm("¿Eliminar esta motocicleta?")) return;

    this.motorcyclesService
      .delete(this.motorcycleId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.router.navigate(["/motorcycles"]),
        error: (err) => console.error("Error:", err),
      });
  }

  goBack(): void {
    this.router.navigate(["/motorcycles"]);
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
