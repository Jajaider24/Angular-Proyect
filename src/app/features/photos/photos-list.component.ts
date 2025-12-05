import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Photo } from "src/app/core/models";
import { PhotosService } from "src/app/core/services/photos.service";
import Swal from "sweetalert2";
import { environment } from "src/environments/environment";

@Component({
  selector: "app-photos-list",
  templateUrl: "./photos-list.component.html",
  styleUrls: ["./photos-list.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PhotosListComponent implements OnInit {
  photos: Photo[] = [];
  loading = false;
  backendUrl = environment.url_backend;

  constructor(
    private photosService: PhotosService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.loading = true;
    this.photosService.list().subscribe({
      next: (res) => {
        console.debug("Photos list response:", res);
        this.photos = Array.isArray(res) ? res : [];
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error("Error loading photos:", err);
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  edit(id: number): void {
    this.router.navigate(["/photos", id, "edit"]);
  }

  delete(id: number): void {
    Swal.fire({
      title: "¿Eliminar foto?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    }).then((res) => {
      if (!res.isConfirmed) return;
      this.photosService.delete(id).subscribe({
        next: () => {
          Swal.fire("Eliminada", "La foto fue eliminada.", "success");
          this.refresh();
        },
        error: () => Swal.fire("Error", "No se pudo eliminar.", "error"),
      });
    });
  }
}
