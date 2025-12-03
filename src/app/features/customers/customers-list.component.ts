import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Customer } from "src/app/core/models/customer.model";
import { CustomersService } from "src/app/core/services/customers.service";
import Swal from "sweetalert2";

@Component({
  selector: "app-customers-list",
  template: `
    <div class="form-container">
      <app-list-header
        [title]="'Clientes'"
        [subtitle]="'Listado de clientes'"
        [lucide]="'Users'"
        [breadcrumb]="[
          { label: 'Dashboard', link: ['/dashboard'] },
          { label: 'Clientes' }
        ]"
        [actionText]="'Crear cliente'"
        [actionLink]="['/customers/create']"
        [actionLucide]="'Plus'"
        [actionBtnClass]="'btn btn-primary btn-sm'"
      ></app-list-header>

      <div *ngIf="loading" class="text-center py-3">Cargando clientes...</div>
      <div *ngIf="error" class="alert alert-danger">{{ error }}</div>

      <div *ngIf="!loading && !error" class="card">
        <div class="card-body p-2">
          <table class="table table-sm table-hover mb-0 table-list">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th class="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let c of customers">
                <td>{{ c.id }}</td>
                <td>{{ c.name }}</td>
                <td>{{ c.email || "-" }}</td>
                <td>{{ c.phone || "-" }}</td>
                <td class="text-end">
                  <button
                    class="btn btn-sm btn-outline-secondary me-1"
                    (click)="view(c.id)"
                  >
                    Ver
                  </button>
                  <button
                    class="btn btn-sm btn-outline-primary me-1"
                    (click)="edit(c.id)"
                  >
                    Editar
                  </button>
                  <button
                    class="btn btn-sm btn-outline-danger"
                    (click)="delete(c.id)"
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
export class CustomersListComponent implements OnInit {
  customers: Customer[] = [];
  loading = false;
  error: string | null = null;

  constructor(private svc: CustomersService, private router: Router) {}

  ngOnInit(): void {
    this.load();
  }

  page = 1;
  pageSize = 10;
  hasNext = false;

  load(page = this.page) {
    this.loading = true;
    this.error = null;
    this.svc.list({ page, limit: this.pageSize }).subscribe({
      next: (data) => {
        this.customers = data || [];
        this.hasNext = (data || []).length === this.pageSize;
        this.loading = false;
        this.page = page;
      },
      error: (err) => {
        console.error("Failed loading customers", err);
        this.error = "No fue posible cargar los clientes.";
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
    this.router.navigate([`/customers/${id}`]);
  }
  edit(id: number) {
    this.router.navigate([`/customers/${id}/edit`]);
  }
  create() {
    this.router.navigate(["/customers/create"]);
  }
  delete(id: number) {
    Swal.fire({
      title: "¿Eliminar cliente?",
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
          Swal.fire("Eliminado", "El cliente fue eliminado.", "success");
        },
        error: () =>
          Swal.fire("Error", "Error eliminando el cliente.", "error"),
      });
    });
  }
}
