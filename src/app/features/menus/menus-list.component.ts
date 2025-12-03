import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Menu } from "src/app/core/models/menu.model";
import { MenusService } from "src/app/core/services/menus.service";
import Swal from "sweetalert2";

@Component({
  selector: "app-menus-list",
  template: `
    <div class="form-container">
      <app-list-header
        [title]="'Menús'"
        [subtitle]="'Relaciona restaurantes y productos'"
        [lucide]="'BookOpen'"
        [breadcrumb]="[
          { label: 'Dashboard', link: ['/dashboard'] },
          { label: 'Menús' }
        ]"
        [actionText]="'Crear menú'"
        [actionLink]="['/menus/create']"
        [actionLucide]="'Plus'"
        [actionBtnClass]="'btn btn-primary btn-sm'"
      ></app-list-header>

      <div *ngIf="loading" class="text-center py-3">Cargando menús...</div>
      <div *ngIf="error" class="alert alert-danger">{{ error }}</div>

      <div *ngIf="!loading && !error" class="card">
        <div class="card-body p-2">
          <div class="table-responsive table-wrap">
            <table
              class="table table-sm table-hover mb-0 table-list table-sticky"
            >
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Restaurante</th>
                  <th>Producto</th>
                  <th>Precio</th>
                  <th class="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let m of menus">
                  <td>{{ m.id }}</td>
                  <td>{{ m?.restaurant?.name || m?.restaurant_id }}</td>
                  <td>{{ m?.product?.name || m?.product_id }}</td>
                  <td>{{ m?.price | currency }}</td>
                  <td class="text-end">
                    <button
                      class="btn btn-sm btn-outline-secondary me-1"
                      (click)="view(m.id)"
                    >
                      Ver
                    </button>
                    <button
                      class="btn btn-sm btn-outline-primary me-1"
                      (click)="edit(m.id)"
                    >
                      Editar
                    </button>
                    <button
                      class="btn btn-sm btn-outline-danger"
                      (click)="delete(m.id)"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="d-flex justify-content-between align-items-center mt-3">
        <div>
          <button
            class="btn btn-sm btn-outline-secondary"
            [disabled]="page <= 1"
            (click)="prev()"
          >
            Anterior
          </button>
          <button
            class="btn btn-sm btn-outline-secondary ms-2"
            [disabled]="!hasNext"
            (click)="next()"
          >
            Siguiente
          </button>
        </div>
        <div class="text-muted">Página {{ page }}</div>
      </div>
    </div>
  `,
})
export class MenusListComponent implements OnInit {
  menus: Menu[] = [];
  loading = false;
  error: string | null = null;
  page = 1;
  pageSize = 10;
  hasNext = false;

  constructor(private svc: MenusService, private router: Router) {}

  ngOnInit(): void {
    this.load();
  }

  load(page = this.page) {
    this.loading = true;
    this.error = null;
    this.svc.list({ page, limit: this.pageSize }).subscribe({
      next: (data) => {
        this.menus = data || [];
        this.hasNext = (data || []).length === this.pageSize;
        this.loading = false;
        this.page = page;
      },
      error: (err) => {
        console.error("Failed loading menus", err);
        this.error = "No fue posible cargar los menús.";
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
    this.router.navigate([`/menus/${id}`]);
  }
  edit(id: number) {
    this.router.navigate([`/menus/${id}/edit`]);
  }
  create() {
    this.router.navigate(["/menus/create"]);
  }
  delete(id: number) {
    Swal.fire({
      title: "¿Eliminar menú?",
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
          Swal.fire("Eliminado", "El menú fue eliminado.", "success");
        },
        error: () => Swal.fire("Error", "Error eliminando el menú.", "error"),
      });
    });
  }
}
