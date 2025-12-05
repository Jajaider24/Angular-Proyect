import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { IssuesService } from "src/app/core/services/issues.service";
import { Issue } from "src/app/core/models";

@Component({
  selector: "app-issues-form",
  templateUrl: "./issues-form.component.html",
  styleUrls: ["./issues-form.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IssuesFormComponent {
  loading = false;
  editing = false;
  id?: number;

  form = this.fb.group({
    motorcycleId: this.fb.control<number | null>(null, { validators: [Validators.required] }),
    description: this.fb.control<string>("", { validators: [Validators.required, Validators.maxLength(1000)] }),
    issueType: this.fb.control<string>("accident", { validators: [Validators.required] }),
    dateReported: this.fb.control<string>(new Date().toISOString(), { validators: [Validators.required] }),
    status: this.fb.control<string>("open", { validators: [Validators.required] }),
  });

  constructor(private fb: FormBuilder, private issues: IssuesService, private router: Router, private route: ActivatedRoute, private cdr: ChangeDetectorRef) {
    const param = this.route.snapshot.paramMap.get("id");
    if (param) {
      this.editing = true;
      this.id = Number(param);
      this.loading = true;
      this.issues.get(this.id).subscribe({
        next: (i: Issue) => {
          this.form.patchValue({
            motorcycleId: i.motorcycleId,
            description: i.description,
            issueType: i.issueType || 'accident',
            dateReported: i.dateReported,
            status: i.status,
          });
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: () => { this.loading = false; this.cdr.markForCheck(); },
      });
    }
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    const payload: Partial<Issue> = {
      motorcycleId: this.form.get('motorcycleId')?.value ?? null,
      description: this.form.get('description')?.value ?? '',
      issueType: this.form.get('issueType')?.value ?? 'other',
      dateReported: this.form.get('dateReported')?.value ?? new Date().toISOString(),
      status: this.form.get('status')?.value ?? 'open',
    };
    if (this.editing && this.id) {
      this.issues.update(this.id, payload).subscribe({
        next: () => { this.loading = false; this.router.navigate(["/issues", this.id]); },
        error: () => { this.loading = false; this.cdr.markForCheck(); },
      });
    } else {
      this.issues.create(payload).subscribe({
        next: (created) => { this.loading = false; if (created && created.id) this.router.navigate(["/issues", created.id]); else this.router.navigate(["/issues"]); },
        error: () => { this.loading = false; this.cdr.markForCheck(); },
      });
    }
  }

  cancel(): void { this.router.navigate(["/issues"]); }
  onDateChange(event: Event): void { const input = event.target as HTMLInputElement; if (input && input.value) { this.form.patchValue({ dateReported: input.value }); } }
}
