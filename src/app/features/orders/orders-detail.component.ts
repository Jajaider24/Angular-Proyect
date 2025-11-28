import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { take } from "rxjs/operators";
import { OrdersService } from "src/app/core/services/orders.service";

@Component({
  selector: "app-orders-detail",
  templateUrl: "./orders-detail.component.html",
  styleUrls: ["./orders-detail.component.scss"],
})
export class OrdersDetailComponent implements OnInit {
  order: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orders: OrdersService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get("id"));
    if (!id) return;
    this.orders
      .get(id)
      .pipe(take(1))
      .subscribe({ next: (o) => (this.order = o) });
  }

  back() {
    this.router.navigate(["/orders"]);
  }
}
