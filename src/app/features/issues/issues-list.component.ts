import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Issue } from "src/app/core/models";
import { IssuesService } from "src/app/core/services/issues.service";
import Swal from "sweetalert2";

@Component({
  selector: "app-issues-list",
  templateUrl: "./issues-list.component.html",
  styleUrls: ["./issues-list.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IssuesListComponent implements OnInit {
  loading = false;
  items: Issue[] = [];

  constructor(private issues: IssuesService, private cdr: ChangeDetectorRef, private router: Router) {}

  ngOnInit(): void { this.refresh(); }

  refresh(): void {
    this.loading = true;
    this.issues.list().subscribe({
      next: (list) => {
        this.items = list || [];
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  view(id: number): void { this.router.navigate(["/issues", id]); }
  edit(id: number): void { this.router.navigate(["/issues", id, "edit"]); }
  remove(id: number): void {
    Swal.fire({ title: "¿Eliminar incidencia?", text: "Esta acción no se puede deshacer.", icon: "warning", showCancelButton: true, confirmButtonText: "Eliminar", cancelButtonText: "Cancelar" })
      .then(res => {
        if (!res.isConfirmed) return;
        this.issues.delete(id).subscribe({ next: () => { Swal.fire("Eliminada", "La incidencia fue eliminada.", "success"); this.refresh(); }, error: () => Swal.fire("Error", "No se pudo eliminar.", "error") });
      });
  }
}
