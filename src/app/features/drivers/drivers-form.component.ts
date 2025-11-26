import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { Subject, takeUntil } from "rxjs";
import { Driver } from "src/app/core/models";
import { DriversService } from "src/app/core/services/drivers.service";

/**
 * Formulario para crear/editar conductores con validaciones.
 *
 * Validaciones:
 * - name: Requerido, 3-100 caracteres
 * - license_number: Requerido, único, 10-50 caracteres alfanuméricos
 * - phone: Requerido, formato teléfono (10-15 dígitos)
 * - email: Opcional, formato email válido
 * - status: Requerido, opciones: available, on_shift, unavailable
 */
@Component({
  selector: "app-drivers-form",
  templateUrl: "./drivers-form.component.html",
  styleUrls: ["./drivers-form.component.scss"],
})
export class DriversFormComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  loading = false;
  isEdit = false;
  submitted = false;
  driverId?: number;

  statusOptions = [
    { value: "available", label: "Disponible" },
    { value: "on_shift", label: "En Turno" },
    { value: "unavailable", label: "No Disponible" },
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private driversService: DriversService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.buildForm();

    const idParam = this.route.snapshot.paramMap.get("id");
    if (idParam) {
      this.isEdit = true;
      this.driverId = Number(idParam);
      this.loadDriver(this.driverId);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private buildForm(): void {
    this.form = this.fb.group({
      name: [
        "",
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
        ],
      ],
      license_number: [
        "",
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(50),
          Validators.pattern(/^[A-Z0-9-]+$/i),
        ],
      ],
      phone: [
        "",
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(15),
          Validators.pattern(/^[0-9+\s()-]+$/),
        ],
      ],
      email: ["", [Validators.email]],
      status: ["available", [Validators.required]],
    });
  }

  private loadDriver(id: number): void {
    this.loading = true;
    this.driversService
      .get(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (driver) => {
          this.form.patchValue(driver);
          this.loading = false;
        },
        error: (err) => {
          console.error("Error:", err);
          this.loading = false;
          this.router.navigate(["/drivers"]);
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
      this.isEdit && this.driverId
        ? this.driversService.update(this.driverId, payload)
        : this.driversService.create(payload);

    operation.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.router.navigate(["/drivers"]);
      },
      error: (err) => {
        console.error("Error:", err);
        this.loading = false;
      },
    });
  }

  onCancel(): void {
    this.router.navigate(["/drivers"]);
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
    if (errors["email"]) return "Formato de email inválido";
    if (errors["pattern"]) {
      if (field === "license_number") return "Solo letras, números y guiones";
      if (field === "phone") return "Solo números, +, espacios, ( ) -";
    }

    return "Valor inválido";
  }
}
