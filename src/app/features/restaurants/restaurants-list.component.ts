import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Restaurant } from "src/app/core/models";
import { RestaurantsService } from "src/app/core/services/restaurants.service";
import Swal from "sweetalert2";

@Component({
  selector: "app-restaurants-list",
  templateUrl: "./restaurants-list.component.html",
  styleUrls: ["./restaurants-list.component.scss"],
})
export class RestaurantsListComponent implements OnInit {
  restaurants: Restaurant[] = [];
  loading = false;
  error: string | null = null;
  page = 1;
  pageSize = 10;
  hasNext = false;

  constructor(private svc: RestaurantsService, private router: Router) {}

  ngOnInit(): void {
    this.load();
  }

  load(page = this.page): void {
    this.loading = true;
    this.error = null;
    this.svc.list({ page, limit: this.pageSize }).subscribe({
      next: (r) => {
        this.restaurants = r || [];
        this.hasNext = (r || []).length === this.pageSize;
        this.page = page;
        this.loading = false;
      },
      error: (err) => {
        console.error("Failed loading restaurants", err);
        this.error = "No fue posible cargar los restaurantes.";
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

  delete(id: number) {
    Swal.fire({
      title: "¿Eliminar restaurante?",
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
          Swal.fire("Eliminado", "El restaurante fue eliminado.", "success");
        },
        error: () =>
          Swal.fire("Error", "Error eliminando el restaurante.", "error"),
      });
    });
  }

  view(id: number) {
    this.router.navigate([`/restaurants/${id}`]);
  }

  edit(id: number) {
    this.router.navigate([`/restaurants/${id}/edit`]);
  }

  create() {
    this.router.navigate(["/restaurants/create"]);
  }
}
