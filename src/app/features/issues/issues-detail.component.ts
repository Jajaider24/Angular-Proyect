import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { IssuesService } from "src/app/core/services/issues.service";
import { Issue } from "src/app/core/models";
import { PhotosService } from "src/app/core/services/photos.service";
import { ShiftsService } from "src/app/core/services/shifts.service";
import { environment } from "src/environments/environment";

@Component({
  selector: "app-issues-detail",
  template: `
    <div class="form-container">
      <app-list-header
        [title]="'Detalle de Incidencia'"
        [subtitle]="issue?.description || ('Incidencia #' + id)"
        [lucide]="'AlertTriangle'"
        [breadcrumb]="[
          { label: 'Dashboard', link: ['/dashboard'] },
          { label: 'Incidencias', link: ['/issues'] },
          { label: 'Detalle' }
        ]"
        [actionText]="'Volver'"
        [actionLink]="['/issues']"
        [actionLucide]="'ArrowLeft'"
        [actionBtnClass]="'btn btn-outline-secondary btn-sm'"
      ></app-list-header>

      <div *ngIf="loading" class="text-center py-3">Cargando...</div>

      <div *ngIf="!loading && issue" class="card">
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-6">
              <div class="list-group">
                <div class="list-group-item"><strong>ID:</strong> {{ id }}</div>
                <div class="list-group-item"><strong>Descripción:</strong> {{ issue?.description }}</div>
                <div class="list-group-item"><strong>Tipo:</strong> {{ issue?.issueType }}</div>
                <div class="list-group-item"><strong>Motocicleta:</strong> {{ issue?.motorcycleId }}</div>
                <div class="list-group-item" *ngIf="issue?.dateReported"><strong>Reportado:</strong> {{ issue?.dateReported | date: 'short' }}</div>
                <div class="list-group-item"><strong>Estado:</strong> {{ issue?.status }}</div>
                <div class="list-group-item" *ngIf="shiftInfo"><strong>Turno vigente:</strong> {{ shiftInfo }}</div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="alert alert-info">Gestiona la incidencia desde aquí. Puedes editar o cerrar.</div>
              <div class="d-flex gap-2">
                <a class="btn btn-sm btn-outline-primary" [routerLink]="['/issues', id, 'edit']">Editar</a>
                <a class="btn btn-sm btn-outline-secondary" [routerLink]="['/photos']">Ver fotos relacionadas</a>
              </div>
            </div>
          </div>
          <hr />
          <div>
            <h6>Fotos relacionadas</h6>
            <div *ngIf="photosLoading" class="text-muted">Cargando fotos...</div>
            <div *ngIf="!photosLoading && photos.length === 0" class="text-muted">No hay fotos para esta incidencia.</div>
            <div class="row g-3" *ngIf="!photosLoading && photos.length > 0">
              <div class="col-sm-6 col-md-4 col-lg-3" *ngFor="let p of photos">
                <div class="card h-100">
                  <img class="card-img-top" [src]="photoSrc(p)" alt="Foto" />
                  <div class="card-body">
                    <div class="small text-muted">ID: {{ p.id }}</div>
                    <div class="small">{{ p.caption }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IssuesDetailComponent implements OnInit {
  id!: number;
  issue?: Issue;
  loading = false;
  photosLoading = false;
  photos: any[] = [];
  backendUrl = environment.url_backend;
  shiftInfo = "";

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private issues: IssuesService,
    private photosService: PhotosService,
    private shifts: ShiftsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const param = this.route.snapshot.paramMap.get('id');
    this.id = Number(param);
    if (!this.id) { this.router.navigate(['/issues']); return; }
    this.loading = true;
    this.issues.get(this.id).subscribe({
      next: (item) => {
        this.issue = item;
        this.loading = false;
        this.cdr.markForCheck();
        this.loadPhotos();
        this.computeShiftInfo();
      },
      error: () => { this.loading = false; this.cdr.markForCheck(); }
    });
  }

  loadPhotos(): void {
    this.photosLoading = true;
    this.photosService.list({ issue_id: this.id }).subscribe({
      next: (arr) => { this.photos = arr || []; this.photosLoading = false; this.cdr.markForCheck(); },
      error: () => { this.photosLoading = false; this.cdr.markForCheck(); },
    });
  }
  photoSrc(p: any): string { return p?.id ? this.backendUrl + "/photos/" + p.id : p?.image_url ? this.backendUrl + "/" + p.image_url : ""; }

  computeShiftInfo(): void {
    if (!this.issue?.dateReported) return;
    const reported = new Date(this.issue.dateReported).getTime();
    this.shifts.list().subscribe({
      next: (list) => {
        const match = (list || []).find((s) => {
          const start = new Date(s.startTime).getTime();
          const end = s.endTime ? new Date(s.endTime).getTime() : Number.MAX_SAFE_INTEGER;
          return reported >= start && reported <= end && (this.issue?.motorcycleId ? s.motorcycleId === this.issue.motorcycleId : true);
        });
        this.shiftInfo = match ? `Conductor ${match.driverId} en moto ${match.motorcycleId} (${match.startTime} → ${match.endTime || 'activo'})` : "Sin turno vigente encontrado en la hora del reporte";
        this.cdr.markForCheck();
      },
      error: () => { this.shiftInfo = "No fue posible obtener el turno"; this.cdr.markForCheck(); }
    });
  }
}
