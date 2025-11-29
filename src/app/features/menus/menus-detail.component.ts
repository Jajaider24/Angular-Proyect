import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Menu } from "src/app/core/models/menu.model";
import { MenusService } from "src/app/core/services/menus.service";

@Component({
  selector: "app-menus-detail",
  templateUrl: "./menus-detail.component.html",
  styleUrls: ["./menus-detail.component.scss"],
})
export class MenusDetailComponent implements OnInit {
  menu?: Menu;
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private svc: MenusService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get("id"));
    if (id) this.load(id);
  }

  load(id: number) {
    this.loading = true;
    this.svc.get(id).subscribe({
      next: (m) => (this.menu = m),
      error: () => (this.loading = false),
      complete: () => (this.loading = false),
    });
  }

  back() {
    this.router.navigate(["/menus"]);
  }
}
