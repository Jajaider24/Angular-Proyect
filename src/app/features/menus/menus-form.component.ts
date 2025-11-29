import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { MenusService } from "src/app/core/services/menus.service";
import { RestaurantsService } from "src/app/core/services/restaurants.service";
import { ProductsService } from "src/app/core/services/products.service";
import { forkJoin } from "rxjs";
import Swal from "sweetalert2";

@Component({
  selector: "app-menus-form",
  templateUrl: "./menus-form.component.html",
  styleUrls: ["./menus-form.component.scss"],
})
export class MenusFormComponent implements OnInit {
  form: FormGroup;
  loading = false;
  submitted = false;
  isEdit = false;
  id: number | null = null;

  restaurants: any[] = [];
  products: any[] = [];

  constructor(
    private fb: FormBuilder,
    private svc: MenusService,
    private restaurantsSvc: RestaurantsService,
    private productsSvc: ProductsService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      restaurant_id: [null, Validators.required],
      product_id: [null, Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      availability: [true],
    });
  }

  get f() { return this.form.controls; }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get("id");
    if (idParam) {
      this.isEdit = true;
      this.id = Number(idParam);
    }

    // cargar combos en paralelo
    this.loading = true;
    forkJoin({
      restaurants: this.restaurantsSvc.list({ limit: 100 }),
      products: this.productsSvc.list({ limit: 100 }),
    }).subscribe({
      next: (res: any) => {
        this.restaurants = res.restaurants || [];
        this.products = res.products || [];
        if (this.isEdit && this.id) this.load(this.id!);
        else this.loading = false;
      },
      error: (err) => {
        console.error("Error cargando combos", err);
        this.loading = false;
      }
    });
  }

  load(id: number) {
    this.svc.get(id).subscribe({
      next: (m: any) => {
        this.form.patchValue({
          restaurant_id: m.restaurant_id,
          product_id: m.product_id,
          price: m.price,
          availability: !!m.availability,
        });
        this.loading = false;
      },
      error: (err) => {
        console.error("Error cargando menú", err);
        Swal.fire("Error", "No se pudo cargar el menú.", "error");
        this.loading = false;
      }
    });
  }

  submit() {
    this.submitted = true;
    if (this.form.invalid) return;
    this.loading = true;
    const payload = this.form.value;
    const obs = this.isEdit && this.id
      ? this.svc.update(this.id!, payload)
      : this.svc.create(payload);
    obs.subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(["/menus"]);
      },
      error: (err) => {
        this.loading = false;
        Swal.fire("Error", this.isEdit ? "Error actualizando menú" : "Error creando menú", "error");
        console.error(err);
      }
    });
  }

  cancel() {
    this.router.navigate(["/menus"]);
  }
}
