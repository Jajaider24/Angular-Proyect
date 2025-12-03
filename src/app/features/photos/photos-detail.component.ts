import { ChangeDetectionStrategy, Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Photo } from "../../models/photo.model";
import { PhotosService } from "../../services/photos.service";

@Component({
  selector: "app-photos-detail",
  template: `
    <div class="form-container">
      <app-list-header
        [title]="'Detalle de Foto'"
        [subtitle]="photo?.caption || 'Foto #' + id"
        [lucide]="'Camera'"
        [breadcrumb]="[
          { label: 'Dashboard', link: ['/dashboard'] },
          { label: 'Fotos', link: ['/photos'] },
          { label: 'Detalle' }
        ]"
        [actionText]="'Volver'"
        [actionLink]="['/photos']"
        [actionLucide]="'ArrowLeft'"
        [actionBtnClass]="'btn btn-outline-secondary btn-sm'"
      ></app-list-header>

      <div *ngIf="loading" class="text-center py-3">Cargando...</div>

      <div *ngIf="!loading" class="card">
        <div class="card-body">
          <div class="text-center mb-3">
            <img [src]="'/photos/' + id" class="img-fluid" alt="Foto" />
          </div>
          <div class="row g-3">
            <div class="col-md-6">
              <div class="list-group">
                <div class="list-group-item"><strong>ID:</strong> {{ id }}</div>
                <div class="list-group-item" *ngIf="photo?.caption">
                  <strong>Caption:</strong> {{ photo?.caption }}
                </div>
                <div class="list-group-item" *ngIf="photo?.taken_at">
                  <strong>Tomada:</strong>
                  {{ photo?.taken_at | date : "short" }}
                </div>
                <div class="list-group-item" *ngIf="photo?.issue_id">
                  <strong>Issue ID:</strong> {{ photo?.issue_id }}
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="alert alert-info">
                Esta imagen se sirve directamente desde el backend vía
                <code>/photos/{{ id }}</code
                >. Si el registro contiene <code>image_url</code>, se usa como
                ruta relativa.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .img-fluid {
        max-height: 70vh;
        object-fit: contain;
      }
    `,
    `
      .list-group-item {
        font-size: 0.9rem;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PhotosDetailComponent implements OnInit {
  id!: number;
  photo?: Photo;
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private photos: PhotosService
  ) {}

  ngOnInit(): void {
    const param = this.route.snapshot.paramMap.get("id");
    this.id = Number(param);
    if (!this.id) {
      this.router.navigate(["/photos"]);
      return;
    }
    this.loading = true;
    // Fetch metadata via list and find, since GET /photos/:id streams image. Alternatively, preload list.
    this.photos.list().subscribe({
      next: (items) => {
        this.photo = (items || []).find((p) => p.id === this.id);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  back(): void {
    this.router.navigate(["/photos"]);
  }
}
