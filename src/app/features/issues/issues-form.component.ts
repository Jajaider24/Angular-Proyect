import { ChangeDetectionStrategy, Component, OnInit } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { forkJoin } from "rxjs";
import { DriversService } from "../../core/services/drivers.service";
import { MotorcyclesService } from "../../core/services/motorcycles.service";
import { OrdersService } from "../../core/services/orders.service";
import { IssuesService } from "../../services/issues.service";

@Component({
  selector: "app-issues-form",
  templateUrl: "./issues-form.component.html",
  styleUrls: ["./issues-form.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IssuesFormComponent implements OnInit {
  isEdit = false;
  loading = false;

  // Opciones para selects
  orderOptions: any[] = [];
  driverOptions: any[] = [];
  motorcycleOptions: any[] = [];

  form = this.fb.group({
    title: ["", [Validators.required, Validators.maxLength(120)]],
    description: ["", [Validators.required, Validators.maxLength(1000)]],
    status: ["open", [Validators.required]],
    order_id: [null],
    driver_id: [null],
    motorcycle_id: [null],
  });

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private issuesService: IssuesService,
    private ordersService: OrdersService,
    private driversService: DriversService,
    private motorcyclesService: MotorcyclesService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get("id");
    if (id) {
      this.isEdit = true;
      this.loading = true;
      this.issuesService.view(+id).subscribe({
        next: (issue) => {
          this.form.patchValue(issue as any);
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        },
      });
    }

    // Cargar opciones para selects (paginación simple: primeros 100)
    forkJoin({
      orders: this.ordersService.list({ page: 1, limit: 100 }),
      drivers: this.driversService.list(),
      motorcycles: this.motorcyclesService.list(),
    }).subscribe({
      next: (result: any) => {
        const orders = (result?.orders as any[]) || [];
        const drivers = (result?.drivers as any[]) || [];
        const motorcycles = (result?.motorcycles as any[]) || [];
        this.orderOptions = orders;
        this.driverOptions = drivers;
        this.motorcycleOptions = motorcycles;
      },
      error: () => {},
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    const id = this.route.snapshot.paramMap.get("id");
    const obs = id
      ? this.issuesService.update(+id, this.form.value)
      : this.issuesService.create(this.form.value);
    obs.subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(["/issues"]);
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  cancel(): void {
    this.router.navigate(["/issues"]);
  }
}
