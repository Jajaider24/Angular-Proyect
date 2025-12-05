import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { PhotosService } from "src/app/core/services/photos.service";
import { IssuesService } from "src/app/core/services/issues.service";
import { Issue } from "src/app/core/models";
import { environment } from "src/environments/environment";

@Component({
  selector: "app-photos-form",
  templateUrl: "./photos-form.component.html",
  styleUrls: ["./photos-form.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PhotosFormComponent {
  loading = false;
  editing = false;
  photoId?: number;
  backendUrl = environment.url_backend;
  currentImgSrc = "";
  issueOptions: Issue[] = [];
  form = this.fb.group({
    caption: ["", [Validators.maxLength(200)]],
    issue_id: [null],
    taken_at: [new Date().toISOString()],
  });
  file?: File;

  constructor(
    private fb: FormBuilder,
    private photosService: PhotosService,
    private issuesService: IssuesService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    const param = this.route.snapshot.paramMap.get("id");
    if (param) {
      this.editing = true;
      this.photoId = Number(param);
      this.loading = true;
      // Cargar metadata para prellenar el formulario
      this.photosService.list().subscribe({
        next: (items) => {
          const p = (items || []).find((x) => x.id === this.photoId);
          if (p) {
            this.form.patchValue({
              caption: p.caption || "",
              issue_id: ((p as any).issue_id ?? p.issueId) ?? null,
              taken_at: ((p as any).taken_at ?? p.takenAt) || new Date().toISOString(),
            });
            this.currentImgSrc = this.backendUrl + "/photos/" + this.photoId;
          }
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.loading = false;
          this.cdr.markForCheck();
        },
      });
    }

    // Cargar catálogo de incidencias para el selector
    this.issuesService.list().subscribe({
      next: (list) => { this.issueOptions = list || []; this.cdr.markForCheck(); },
      error: () => { this.issueOptions = []; this.cdr.markForCheck(); }
    });
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.file = input.files[0];
    }
  }

  submit(): void {
    this.loading = true;
    const payload = {
      issue_id: this.form.value.issue_id ?? undefined,
      caption: this.form.value.caption ?? undefined,
      taken_at: this.form.value.taken_at ?? undefined,
    };
    if (this.editing && this.photoId) {
      // En edición: solo actualizar metadatos. No reemplazamos la imagen.
      this.photosService.update(this.photoId, payload).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(["/photos", this.photoId]);
        },
        error: () => {
          this.loading = false;
        },
      });
    } else {
      // En creación: requiere archivo
      if (!this.file) {
        this.loading = false;
        return;
      }
      this.photosService.upload(payload, this.file!).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(["/photos"]);
        },
        error: () => {
          this.loading = false;
        },
      });
    }
  }

  cancel(): void {
    this.router.navigate(["/photos"]);
  }
}
