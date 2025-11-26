import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { Subject, takeUntil } from "rxjs";
import { Motorcycle } from "src/app/core/models";
import { MotorcyclesService } from "src/app/core/services/motorcycles.service";

/**
 * Formulario para crear/editar motocicletas con validaciones completas.
 *
 * Validaciones:
 * - license_plate: Requerida, formato placa (alfanumérico 6-10 chars), única
 * - brand: Requerida, 2-50 caracteres
 * - year: Requerido, rango 1990-2025, debe ser número válido
 * - status: Requerido, opciones: available, in_use, maintenance
 */
@Component({
  selector: "app-motorcycles-form",
  templateUrl: "./motorcycles-form.component.html",
  styleUrls: ["./motorcycles-form.component.scss"],
})
export class MotorcyclesFormComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  loading = false;
  isEdit = false;
  submitted = false;
  motorcycleId?: number;

  // Opciones para el select de status
  statusOptions = [
    { value: "available", label: "Disponible" },
    { value: "in_use", label: "En Uso" },
    { value: "maintenance", label: "Mantenimiento" },
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private motorcyclesService: MotorcyclesService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.buildForm();

    const idParam = this.route.snapshot.paramMap.get("id");
    if (idParam) {
      this.isEdit = true;
      this.motorcycleId = Number(idParam);
      this.loadMotorcycle(this.motorcycleId);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private buildForm(): void {
    const currentYear = new Date().getFullYear();

    this.form = this.fb.group({
      license_plate: [
        "",
        [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(10),
          Validators.pattern(/^[A-Z0-9-]+$/i),
        ],
      ],
      brand: [
        "",
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
        ],
      ],
      year: [
        null,
        [
          Validators.required,
          Validators.min(1990),
          Validators.max(currentYear + 1),
        ],
      ],
      status: ["available", [Validators.required]],
    });
  }

  private loadMotorcycle(id: number): void {
    this.loading = true;
    this.motorcyclesService
      .get(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (motorcycle) => {
          this.form.patchValue(motorcycle);
          this.loading = false;
        },
        error: (err) => {
          console.error("Error:", err);
          this.loading = false;
          this.router.navigate(["/motorcycles"]);
        },
      });
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.form.invalid) {
      Object.keys(this.form.controls).forEach((key) => {
        this.form.get(key)?.markAsTouched();
      });
      return;
    }

    const payload = this.form.value;
    this.loading = true;

    const operation =
      this.isEdit && this.motorcycleId
        ? this.motorcyclesService.update(this.motorcycleId, payload)
        : this.motorcyclesService.create(payload);

    operation.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.router.navigate(["/motorcycles"]);
      },
      error: (err) => {
        console.error("Error:", err);
        this.loading = false;
      },
    });
  }

  onCancel(): void {
    this.router.navigate(["/motorcycles"]);
  }

  get f() {
    return this.form.controls;
  }

  hasError(field: string): boolean {
    const control = this.form.get(field);
    return !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched || this.submitted)
    );
  }

  getErrorMessage(field: string): string {
    const control = this.form.get(field);
    if (!control || !control.errors) return "";

    const errors = control.errors;

    if (errors["required"]) return "Este campo es obligatorio";
    if (errors["minlength"])
      return `Mínimo ${errors["minlength"].requiredLength} caracteres`;
    if (errors["maxlength"])
      return `Máximo ${errors["maxlength"].requiredLength} caracteres`;
    if (errors["min"]) return `El valor mínimo es ${errors["min"].min}`;
    if (errors["max"]) return `El valor máximo es ${errors["max"].max}`;
    if (errors["pattern"]) {
      if (field === "license_plate") return "Solo letras, números y guiones";
    }

    return "Valor inválido";
  }
}
