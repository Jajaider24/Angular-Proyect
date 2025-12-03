import { ChangeDetectionStrategy, Component } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { PhotosService } from "../../services/photos.service";

@Component({
  selector: "app-photos-form",
  templateUrl: "./photos-form.component.html",
  styleUrls: ["./photos-form.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PhotosFormComponent {
  loading = false;
  form = this.fb.group({
    caption: ["", [Validators.maxLength(200)]],
    issue_id: [null],
    taken_at: [new Date().toISOString()],
  });
  file?: File;

  constructor(
    private fb: FormBuilder,
    private photosService: PhotosService,
    private router: Router
  ) {}

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.file = input.files[0];
    }
  }

  submit(): void {
    if (!this.file) {
      return;
    }
    this.loading = true;
    const payload = {
      issue_id: this.form.value.issue_id ?? undefined,
      caption: this.form.value.caption ?? undefined,
      taken_at: this.form.value.taken_at ?? undefined,
    };
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

  cancel(): void {
    this.router.navigate(["/photos"]);
  }
}
