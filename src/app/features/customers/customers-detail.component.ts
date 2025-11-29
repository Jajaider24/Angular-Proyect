import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { CustomersService } from "src/app/core/services/customers.service";

@Component({
  selector: "app-customers-detail",
  templateUrl: "./customers-detail.component.html",
  styleUrls: ["./customers-detail.component.scss"],
})
export class CustomersDetailComponent implements OnInit {
  customer: any;
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private svc: CustomersService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get("id"));
    if (id) this.load(id);
  }

  load(id: number) {
    this.loading = true;
    this.svc.get(id).subscribe({
      next: (c) => (this.customer = c),
      error: () => (this.loading = false),
      complete: () => (this.loading = false),
    });
  }

  back() {
    this.router.navigate(["/customers"]);
  }
}
