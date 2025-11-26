import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Subject, takeUntil } from "rxjs";
import { Driver } from "src/app/core/models";
import { DriversService } from "src/app/core/services/drivers.service";

@Component({
  selector: "app-drivers-detail",
  templateUrl: "./drivers-detail.component.html",
  styleUrls: ["./drivers-detail.component.scss"],
})
export class DriversDetailComponent implements OnInit, OnDestroy {
  driver?: Driver;
  loading = false;
  driverId!: number;
  private destroy$ = new Subject<void>();

  constructor(
    private driversService: DriversService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get("id");
    if (!idParam) {
      this.router.navigate(["/drivers"]);
      return;
    }

    this.driverId = Number(idParam);
    this.loadDriver();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDriver(): void {
    this.loading = true;
    this.driversService.get(this.driverId).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.driver = data;
        this.loading = false;
      },
      error: (err) => {
        console.error("Error:", err);
        this.loading = false;
        this.router.navigate(["/drivers"]);
      },
    });
  }

  editDriver(): void {
    this.router.navigate(["/drivers", this.driverId, "edit"]);
  }

  deleteDriver(): void {
    if (!confirm("¿Eliminar este conductor?")) return;

    this.driversService.delete(this.driverId).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => this.router.navigate(["/drivers"]),
      error: (err) => console.error("Error:", err),
    });
  }

  goBack(): void {
    this.router.navigate(["/drivers"]);
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
