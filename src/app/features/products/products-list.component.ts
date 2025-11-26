import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Product } from "src/app/core/models/product.model";
import { ProductsService } from "src/app/core/services/products.service";
import Swal from "sweetalert2";

@Component({
  selector: "app-products-list",
  template: `
    <div class="container mt-3">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 class="mb-0">Productos</h4>
          <p class="text-muted mb-0">Listado de productos</p>
        </div>
        <div>
          <button class="btn btn-primary btn-sm" (click)="create()">
            Crear producto
          </button>
        </div>
      </div>

      <div *ngIf="loading" class="text-center py-3">Cargando productos...</div>
      <div *ngIf="error" class="alert alert-danger">{{ error }}</div>

      <div *ngIf="!loading && !error" class="card">
        <div class="card-body p-2">
          <table class="table table-sm table-hover mb-0">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Precio</th>
                <th>Categoría</th>
                <th class="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of products">
                <td>{{ p.id }}</td>
                <td>{{ p.name }}</td>
                <td>{{ p.price | currency }}</td>
                <td>{{ p.category || "-" }}</td>
                <td class="text-end">
                  <button
                    class="btn btn-sm btn-outline-secondary me-1"
                    (click)="view(p.id)"
                  >
                    Ver
                  </button>
                  <button
                    class="btn btn-sm btn-outline-primary me-1"
                    (click)="edit(p.id)"
                  >
                    Editar
                  </button>
                  <button
                    class="btn btn-sm btn-outline-danger"
                    (click)="delete(p.id)"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="d-flex justify-content-between align-items-center mt-3">
        <div>
          <button
            class="btn btn-sm btn-outline-secondary"
            (click)="prev()"
            [disabled]="page <= 1 || loading"
          >
            Anterior
          </button>
          <button
            class="btn btn-sm btn-outline-secondary ms-2"
            (click)="next()"
            [disabled]="!hasNext || loading"
          >
            Siguiente
          </button>
        </div>
        <div class="text-muted">Página {{ page }}</div>
      </div>
    </div>
  `,
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
