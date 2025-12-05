import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Product } from "src/app/core/models/product.model";
import { ProductsService } from "src/app/core/services/products.service";
import Swal from "sweetalert2";

@Component({
  selector: "app-products-list",
  template: `
    <div class="form-container">
      <app-list-header
        [title]="'Productos'"
        [subtitle]="'Listado de productos'"
        [lucide]="'Package'"
        [breadcrumb]="[
          { label: 'Dashboard', link: ['/dashboard'] },
          { label: 'Productos' }
        ]"
        [actionText]="'Crear producto'"
        [actionLink]="['/products/create']"
        [actionLucide]="'Plus'"
        [actionBtnClass]="'btn btn-primary btn-sm'"
      ></app-list-header>

      <div *ngIf="loading" class="text-center py-3">Cargando productos...</div>
      <div *ngIf="error" class="alert alert-danger">{{ error }}</div>

      <div *ngIf="!loading && !error" class="card">
        <div class="card-body p-2">
          <div class="table-responsive table-wrap">
            <table class="table table-sm table-hover mb-0 table-list table-sticky">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th class="hide-mobile">Precio</th>
                  <th class="hide-mobile">Categoría</th>
                  <th class="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let p of products">
                  <td>{{ p.id }}</td>
                  <td class="text-truncate-cell">{{ p.name }}</td>
                  <td class="hide-mobile">{{ p.price | currency }}</td>
                  <td class="hide-mobile">{{ p.category || "-" }}</td>
                  <td class="text-end">
                    <div class="btn-group-responsive">
                      <button
                        class="btn btn-sm btn-outline-secondary"
                        (click)="view(p.id)"
                        title="Ver"
                      >
                        <span class="hide-mobile">Ver</span>
                        <span class="show-mobile-only">👁</span>
                      </button>
                      <button
                        class="btn btn-sm btn-outline-primary"
                        (click)="edit(p.id)"
                        title="Editar"
                      >
                        <span class="hide-mobile">Editar</span>
                        <span class="show-mobile-only">✏️</span>
                      </button>
                      <button
                        class="btn btn-sm btn-outline-danger"
                        (click)="delete(p.id)"
                        title="Eliminar"
                      >
                        <span class="hide-mobile">Eliminar</span>
                        <span class="show-mobile-only">🗑</span>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2">
        <div class="btn-group-responsive">
          <button
            class="btn btn-sm btn-outline-secondary"
            (click)="prev()"
            [disabled]="page <= 1 || loading"
          >
            Anterior
          </button>
          <button
            class="btn btn-sm btn-outline-secondary"
            (click)="next()"
            [disabled]="!hasNext || loading"
          >
            Siguiente
          </button>
        </div>
        <div class="text-muted small">Página {{ page }}</div>
      </div>
    </div>
  `,
  styles: [`
    .table-wrap { max-height: 60vh; overflow-y: auto; }
    .btn-group-responsive { display: flex; flex-wrap: wrap; gap: 0.25rem; }
    @media (max-width: 480px) {
      .show-mobile-only { display: inline !important; }
      .hide-mobile { display: none !important; }
    }
    @media (min-width: 481px) {
      .show-mobile-only { display: none !important; }
    }
  `]
})
export class ProductsListComponent implements OnInit {
  products: Product[] = [];
  loading = false;
  error: string | null = null;
  // pagination
  page = 1;
  pageSize = 10;
  hasNext = false;

  constructor(private svc: ProductsService, private router: Router) {}

  ngOnInit(): void {
    this.load();
  }

  load(page = this.page) {
    this.loading = true;
    this.error = null;
    this.svc.list({ page, limit: this.pageSize }).subscribe({
      next: (data) => {
        this.products = data || [];
        this.hasNext = (data || []).length === this.pageSize;
        this.loading = false;
        this.page = page;
      },
      error: (err) => {
        console.error("Failed loading products", err);
        this.error = "No fue posible cargar los productos.";
        this.loading = false;
      },
    });
  }

  prev() {
    if (this.page > 1) {
      this.load(this.page - 1);
    }
  }
  next() {
    if (this.hasNext) {
      this.load(this.page + 1);
    }
  }

  view(id: number) {
    this.router.navigate([`/products/${id}`]);
  }
  edit(id: number) {
    this.router.navigate([`/products/${id}/edit`]);
  }
  create() {
    this.router.navigate(["/products/create"]);
  }

  delete(id: number) {
    Swal.fire({
      title: "¿Eliminar producto?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((res) => {
      if (!res.isConfirmed) return;
      this.svc.delete(id).subscribe({
        next: () => {
          this.load();
          Swal.fire("Eliminado", "El producto fue eliminado.", "success");
        },
        error: () =>
          Swal.fire("Error", "Error eliminando el producto.", "error"),
      });
    });
  }
}
