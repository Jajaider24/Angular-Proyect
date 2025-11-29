import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Product } from "src/app/core/models/product.model";
import { ProductsService } from "src/app/core/services/products.service";

@Component({
  selector: "app-products-detail",
  templateUrl: "./products-detail.component.html",
  styleUrls: ["./products-detail.component.scss"],
})
export class ProductsDetailComponent implements OnInit {
  product?: Product;
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private svc: ProductsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get("id"));
    if (id) this.load(id);
  }

  load(id: number) {
    this.loading = true;
    this.svc.get(id).subscribe({
      next: (p) => (this.product = p),
      error: () => (this.loading = false),
      complete: () => (this.loading = false),
    });
  }

  back() {
    this.router.navigate(["/products"]);
  }
}
