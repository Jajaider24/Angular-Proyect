import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Restaurant } from "src/app/core/models";
import { RestaurantsService } from "src/app/core/services/restaurants.service";

@Component({
  selector: "app-restaurants-detail",
  templateUrl: "./restaurants-detail.component.html",
  styleUrls: ["./restaurants-detail.component.scss"],
})
export class RestaurantsDetailComponent implements OnInit {
  restaurant?: Restaurant;
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private svc: RestaurantsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get("id"));
    if (id) this.load(id);
  }

  load(id: number) {
    this.loading = true;
    this.svc.get(id).subscribe({
      next: (r) => (this.restaurant = r),
      error: () => (this.loading = false),
      complete: () => (this.loading = false),
    });
  }

  back() {
    this.router.navigate(["/restaurants"]);
  }
}
