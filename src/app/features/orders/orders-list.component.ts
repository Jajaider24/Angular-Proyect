import { HttpClient } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Order } from "src/app/core/models/order.model";
import { MotorcyclesService } from "src/app/core/services/motorcycles.service";
import { OrdersService } from "src/app/core/services/orders.service";
import { environment } from "src/environments/environment";
import Swal from "sweetalert2";

@Component({
  selector: "app-orders-list",
  template: `
    <div class="form-container">
      <app-list-header
        [title]="'Pedidos'"
        [subtitle]="'Listado de pedidos y estado de entrega'"
        [lucide]="'ShoppingCart'"
        [breadcrumb]="[
          { label: 'Dashboard', link: ['/dashboard'] },
          { label: 'Pedidos' }
        ]"
        [actionText]="'Crear pedido'"
        [actionLink]="['/orders/create']"
        [actionLucide]="'Plus'"
        [actionBtnClass]="'btn btn-primary btn-sm'"
      ></app-list-header>

      <div *ngIf="loading" class="text-center py-3">Cargando pedidos...</div>
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
                  <th>Cliente ID</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th class="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let o of orders">
                  <td>{{ o.id }}</td>
                  <td>{{ o.customerId }}</td>
                  <td>{{ o.totalPrice | currency }}</td>
                  <td>{{ o.status }}</td>
                  <td>
                    {{ o.createdAt ? (o.createdAt | date : "short") : "-" }}
                  </td>
                  <td class="text-end">
                    <button
                      class="btn btn-sm btn-outline-secondary me-1"
                      (click)="view(o.id)"
                    >
                      Ver
                    </button>
                    <button
                      class="btn btn-sm btn-outline-primary me-1"
                      (click)="edit(o.id)"
                    >
                      Editar
                    </button>
                    <button
                      class="btn btn-sm btn-outline-success me-1"
                      (click)="track(o)"
                      [title]="
                        o.motorcycleId
                          ? 'Rastrear entrega'
                          : 'Pedido sin moto asignada'
                      "
                    >
                      Rastrear
                    </button>
                    <button
                      class="btn btn-sm btn-outline-danger"
                      (click)="delete(o.id)"
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
export class OrdersListComponent implements OnInit {
  orders: Order[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private svc: OrdersService,
    private motos: MotorcyclesService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.load();
  }

  // pagination fields
  page = 1;
  pageSize = 10;
  hasNext = false;

  load(page = this.page) {
    this.loading = true;
    this.error = null;
    this.svc.list({ page, limit: this.pageSize }).subscribe({
      next: (data) => {
        this.orders = data || [];
        this.hasNext = (data || []).length === this.pageSize;
        this.loading = false;
        this.page = page;
      },
      error: (err) => {
        console.error("Failed loading orders", err);
        this.error = "No fue posible cargar los pedidos.";
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
    this.router.navigate([`/orders/${id}`]);
  }
  edit(id: number) {
    this.router.navigate([`/orders/${id}/edit`]);
  }
  create() {
    this.router.navigate(["/orders/create"]);
  }
  delete(id: number) {
    Swal.fire({
      title: "¿Eliminar pedido?",
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
          Swal.fire("Eliminado", "El pedido fue eliminado.", "success");
        },
        error: () => Swal.fire("Error", "Error eliminando el pedido.", "error"),
      });
    });
  }

  // Inicia el seguimiento de la moto asociada y navega al mapa
  track(o: Order) {
    if (!o.motorcycleId) {
      Swal.fire(
        "Sin motocicleta",
        "Este pedido no tiene una moto asignada aún.",
        "info"
      );
      return;
    }

    this.motos.get(o.motorcycleId).subscribe({
      next: (moto: any) => {
        const plate = moto?.license_plate || moto?.plate || null;
        if (!plate) {
          Swal.fire(
            "Sin placa",
            "No fue posible resolver la placa de la motocicleta.",
            "warning"
          );
          return;
        }
        this.http
          .post(`${environment.url_backend}/motorcycles/track/${plate}`, {})
          .subscribe({
            next: () =>
              this.router.navigate(["/orders/map"], {
                queryParams: { plate },
              }),
            error: () =>
              Swal.fire(
                "Error",
                "No fue posible iniciar el rastreo para la placa indicada.",
                "error"
              ),
          });
      },
      error: () =>
        Swal.fire(
          "Error",
          "No fue posible obtener los datos de la motocicleta.",
          "error"
        ),
    });
  }
}
