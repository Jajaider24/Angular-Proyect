import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { take } from "rxjs/operators";
import Swal from "sweetalert2";
import { OrdersService } from "src/app/core/services/orders.service";
import { CustomersService } from "src/app/core/services/customers.service";
import { MenusService } from "src/app/core/services/menus.service";
import { MotorcyclesService } from "src/app/core/services/motorcycles.service";

@Component({
  selector: "app-orders-form",
  templateUrl: "./orders-form.component.html",
  styleUrls: ["./orders-form.component.scss"],
})
export class OrdersFormComponent implements OnInit {
  form!: FormGroup;
  isEdit = false;
  id: number | null = null;

  customers: any[] = [];
  menus: any[] = [];
  motorcycles: any[] = [];

  // Usar los estados aceptados por el backend
  statuses = ["pending", "in_progress", "delivered", "cancelled"];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private orders: OrdersService,
    private customersSvc: CustomersService,
    private menusSvc: MenusService,
    private motosSvc: MotorcyclesService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      customerId: [null, [Validators.required]],
      menuId: [null, [Validators.required]],
      motorcycleId: [null],
      quantity: [1, [Validators.required, Validators.min(1)]],
      totalPrice: [0, [Validators.required, Validators.min(0)]],
      status: ["pending", [Validators.required]],
    });

    this.loadOptions();

    const idParam = this.route.snapshot.paramMap.get("id");
    if (idParam) {
      this.isEdit = true;
      this.id = Number(idParam);
      this.orders
        .get(this.id)
        .pipe(take(1))
        .subscribe({
          next: (o) => {
            // El backend no tiene items; mapeamos campos conocidos
            this.form.patchValue({
              customerId: o.customerId,
              menuId: (o as any).menuId, // si en futuro guardas menú en cliente
              motorcycleId: o.motorcycleId ?? null,
              quantity: (o as any).quantity ?? 1,
              totalPrice: o.totalPrice,
              status: o.status,
            });
          },
        });
    }
  }

  loadOptions() {
    this.customersSvc.list().pipe(take(1)).subscribe({ next: (arr: any) => (this.customers = arr || []) });
    this.menusSvc.list().pipe(take(1)).subscribe({ next: (arr: any) => (this.menus = arr || []) });
    this.motosSvc.list().pipe(take(1)).subscribe({ next: (arr: any) => (this.motorcycles = arr || []) });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.value;

    // El backend espera: customer_id, menu_id, motorcycle_id, quantity, total_price, status
    const payload: any = {
      customerId: value.customerId,
      menuId: value.menuId,
      motorcycleId: value.motorcycleId || null,
      quantity: value.quantity,
      totalPrice: value.totalPrice,
      status: value.status,
    };

    const req = this.isEdit && this.id
      ? this.orders.update(this.id, payload)
      : this.orders.create(payload);

    req.pipe(take(1)).subscribe({
      next: () => {
        Swal.fire("Ok", `Pedido ${this.isEdit ? "actualizado" : "creado"} correctamente.`, "success");
        this.router.navigate(["/orders"]);
      },
      error: () => Swal.fire("Error", "No fue posible guardar el pedido.", "error"),
    });
  }

  cancel() {
    this.router.navigate(["/orders"]);
  }
}
