import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Photo } from "src/app/core/models";
import { PhotosService } from "src/app/core/services/photos.service";
import { environment } from "src/environments/environment";

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
            <img [src]="imgSrc" class="img-fluid" alt="Foto" />
          </div>
          <div class="row g-3">
            <div class="col-md-6">
              <div class="list-group">
                <div class="list-group-item"><strong>ID:</strong> {{ id }}</div>
                <div class="list-group-item" *ngIf="photo?.caption">
                  <strong>Caption:</strong> {{ photo?.caption }}
                </div>
                <div class="list-group-item" *ngIf="takenAtValue">
                  <strong>Tomada:</strong>
                  {{ takenAtValue | date : "short" }}
                </div>
                <div class="list-group-item" *ngIf="issueIdValue">
                  <strong>Issue ID:</strong> {{ issueIdValue }}
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
  backendUrl = environment.url_backend;
  imgSrc = "";
  get issueIdValue(): number | null {
    const anyPhoto: any = this.photo as any;
    return (anyPhoto && anyPhoto.issue_id != null ? anyPhoto.issue_id : this.photo?.issueId) ?? null;
  }
  get takenAtValue(): string | null {
    const anyPhoto: any = this.photo as any;
    return (anyPhoto && anyPhoto.taken_at ? anyPhoto.taken_at : this.photo?.takenAt) ?? null;
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private photos: PhotosService,
    private cdr: ChangeDetectorRef
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
        this.imgSrc = this.backendUrl + "/photos/" + this.id;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  back(): void {
    this.router.navigate(["/photos"]);
  }
}
