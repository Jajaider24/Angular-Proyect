import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { Product } from "src/app/core/models/product.model";
import { ProductsService } from "src/app/core/services/products.service";
import Swal from "sweetalert2";

@Component({
  selector: "app-products-form",
  template: `
    <div class="container mt-3">
      <h4 *ngIf="!isEdit">Crear producto</h4>
      <h4 *ngIf="isEdit">Editar producto</h4>

      <form
        [formGroup]="form"
        (ngSubmit)="submit()"
        novalidate
        class="card p-3"
      >
        <div class="mb-3">
          <label class="form-label">Nombre</label>
          <input
            formControlName="name"
            class="form-control"
            [class.is-invalid]="submitted && f.name.invalid"
          />
          <div *ngIf="submitted && f.name.invalid" class="invalid-feedback">
            Nombre es obligatorio.
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label">Precio</label>
          <input
            type="number"
            formControlName="price"
            class="form-control"
            [class.is-invalid]="submitted && f.price.invalid"
          />
          <div *ngIf="submitted && f.price.invalid" class="invalid-feedback">
            Precio válido es requerido (>= 0).
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label">Categoría <span class="text-danger">*</span></label>
          <select
            formControlName="category"
            class="form-select"
            [class.is-invalid]="submitted && f.category.invalid"
          >
            <option value="">Selecciona una categoría</option>
            <option *ngFor="let c of categoryCatalog" [value]="c.value">
              {{ c.label }}
            </option>
          </select>
          <div *ngIf="submitted && f.category.invalid" class="invalid-feedback">
            La categoría es obligatoria.
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label">Descripción</label>
          <textarea
            formControlName="description"
            class="form-control"
            rows="3"
            [class.is-invalid]="submitted && f.description.invalid"
            placeholder="Describe el producto (ingredientes, tamaño, etc.)"
          ></textarea>
          <div *ngIf="submitted && f.description.invalid" class="invalid-feedback">
            Máximo 500 caracteres.
          </div>
        </div>

        <div class="d-flex justify-content-end">
          <button
            type="button"
            class="btn btn-secondary me-2"
            (click)="cancel()"
          >
            Cancelar
          </button>
          <button type="submit" class="btn btn-primary" [disabled]="loading">
            {{ isEdit ? "Guardar" : "Crear" }}
          </button>
        </div>
      </form>
    </div>
  `,
})
export class ProductsFormComponent implements OnInit {
  form: FormGroup;
  loading = false;
  submitted = false;
  isEdit = false;
  id: number | null = null;
  // Catálogo propuesto de categorías acorde al dominio del proyecto
  categoryCatalog = [
    { value: "burgers", label: "Hamburguesas" },
    { value: "pizzas", label: "Pizzas" },
    { value: "chicken", label: "Pollo" },
    { value: "grill", label: "Parrilla" },
    { value: "salads", label: "Ensaladas" },
    { value: "snacks", label: "Snacks" },
    { value: "desserts", label: "Postres" },
    { value: "drinks", label: "Bebidas" },
    { value: "veggie", label: "Vegetariano/Vegano" },
    { value: "soups", label: "Sopas" },
    { value: "breakfast", label: "Desayunos" },
    { value: "combos", label: "Combos" },
  ];

  constructor(
    private fb: FormBuilder,
    private svc: ProductsService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      name: ["", Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      category: ["", Validators.required],
      description: ["", Validators.maxLength(500)],
    });
  }

  get f() {
    return this.form.controls;
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get("id");
    if (idParam) {
      this.isEdit = true;
      this.id = Number(idParam);
      this.load(this.id);
    }
  }

  load(id: number) {
    this.loading = true;
    this.svc.get(id).subscribe({
      next: (p: Product) => {
        this.form.patchValue({
          name: p.name,
          price: p.price,
          category: p.category,
          description: p.description,
        });
        this.loading = false;
      },
      error: (err) => {
        console.error("Failed load product", err);
        Swal.fire("Error", "No se pudo cargar el producto.", "error");
        this.loading = false;
      },
    });
  }

  submit() {
    this.submitted = true;
    if (this.form.invalid) return;
    this.loading = true;
    const payload = this.form.value;
    if (this.isEdit && this.id) {
      this.svc.update(this.id, payload).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(["/products"]);
        },
        error: (err) => {
          this.loading = false;
          Swal.fire("Error", "Error actualizando producto", "error");
          console.error(err);
        },
      });
    } else {
      this.svc.create(payload).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(["/products"]);
        },
        error: (err) => {
          this.loading = false;
          Swal.fire("Error", "Error creando producto", "error");
          console.error(err);
        },
      });
    }
  }

  cancel() {
    this.router.navigate(["/products"]);
  }
}
