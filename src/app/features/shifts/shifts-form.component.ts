import { Component, OnDestroy, OnInit } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { Subject, forkJoin, takeUntil } from "rxjs";
import Swal from "sweetalert2";

import { Driver, Motorcycle, Shift } from "src/app/core/models";
import { DriversService } from "src/app/core/services/drivers.service";
import { MotorcyclesService } from "src/app/core/services/motorcycles.service";
import { ShiftsService } from "src/app/core/services/shifts.service";

@Component({
  selector: "app-shifts-form",
  templateUrl: "./shifts-form.component.html",
  styleUrls: ["./shifts-form.component.scss"],
})
export class ShiftsFormComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  editMode = false;
  shiftId?: number; // solo definido si la ruta trae :id
  drivers: Driver[] = [];
  motorcycles: Motorcycle[] = [];
  existingShifts: Shift[] = [];
  loading = false;
  private destroy$ = new Subject<void>();

  // Listas filtradas de disponibilidad
  availableDrivers: Driver[] = [];
  availableMotorcycles: Motorcycle[] = [];
  // Listas efectivas para el select (incluyen el seleccionado aunque no esté disponible)
  driverOptions: Driver[] = [];
  motorcycleOptions: Motorcycle[] = [];

  statuses = ["scheduled", "in_progress", "finished", "cancelled"];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private shiftsService: ShiftsService,
    private driversService: DriversService,
    private motorcyclesService: MotorcyclesService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get("id");
    if (idParam) {
      this.shiftId = Number(idParam);
    }
    this.editMode =
      !!idParam && this.route.snapshot.routeConfig?.path?.includes("edit");
    this.buildForm();
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  buildForm(): void {
    this.form = this.fb.group(
      {
        driverId: [null, [Validators.required]],
        motorcycleId: [null, [Validators.required]],
        startTime: [null, [Validators.required]],
        endTime: [null],
        status: ["scheduled", [Validators.required]],
      },
      {
        validators: [
          this.timeOrderValidator.bind(this),
          this.overlapValidator.bind(this),
        ],
      }
    );
  }

  loadData(): void {
    this.loading = true;
    forkJoin({
      // Solicitar con límite razonable para catálogos
      drivers: this.driversService.list({ page: 1, limit: 100 }),
      motorcycles: this.motorcyclesService.list({ page: 1, limit: 100 }),
      shifts: this.shiftsService.list({ page: 1, limit: 100 }),
      current: this.shiftId ? this.shiftsService.get(this.shiftId) : undefined,
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ drivers, motorcycles, shifts, current }) => {
          this.drivers = (drivers || []).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
          this.motorcycles = (motorcycles || []).sort((a, b) => (a.licensePlate || '').localeCompare(b.licensePlate || ''));
          this.existingShifts = shifts || [];
          if (current) {
            this.form.patchValue({
              driverId: current.driverId,
              motorcycleId: current.motorcycleId,
              startTime: this.isoToLocalInput(current.startTime),
              endTime: current.endTime
                ? this.isoToLocalInput(current.endTime)
                : null,
              status: current.status || "scheduled",
            });
          }

          // Mostrar todas las opciones creadas por el usuario
          this.availableDrivers = this.drivers;
          this.availableMotorcycles = this.motorcycles;

          // Incluir el seleccionado si existe
          this.driverOptions = this.computeOptionsWithSelected(
            this.drivers,
            this.form.get("driverId")?.value,
            this.drivers
          );
          this.motorcycleOptions = this.computeOptionsWithSelected(
            this.motorcycles,
            this.form.get("motorcycleId")?.value,
            this.motorcycles
          );

          // Si por cualquier razón vienen vacíos con paginación, reintentar sin parámetros (como en editar/lista)
          const retryDrivers = this.driverOptions.length === 0;
          const retryMotos = this.motorcycleOptions.length === 0;
          if (retryDrivers) {
            this.driversService
              .list()
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                next: (ds) => {
                  this.drivers = (ds || []).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
                  this.availableDrivers = this.drivers;
                  this.driverOptions = this.computeOptionsWithSelected(
                    this.drivers,
                    this.form.get("driverId")?.value,
                    this.drivers
                  );
                },
                error: () => {
                  // mantener vacío
                },
              });
          }
          if (retryMotos) {
            this.motorcyclesService
              .list()
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                next: (ms) => {
                  this.motorcycles = (ms || []).sort((a, b) => (a.licensePlate || '').localeCompare(b.licensePlate || ''));
                  this.availableMotorcycles = this.motorcycles;
                  this.motorcycleOptions = this.computeOptionsWithSelected(
                    this.motorcycles,
                    this.form.get("motorcycleId")?.value,
                    this.motorcycles
                  );
                },
                error: () => {
                  // mantener vacío
                },
              });
          }

          // Revalidar tras tener existingShifts cargados
          this.form.updateValueAndValidity();

          // Marcar fin de carga
          this.loading = false;
        },
        error: (err) => {
          console.error("Error cargando datos turno:", err);
          // Asegurar listas vacías para que el template muestre 'Requerido'
          this.drivers = [];
          this.motorcycles = [];
          this.existingShifts = [];
          this.loading = false;
        },
      });
  }

  private computeOptionsWithSelected<T extends { id: number }>(
    list: T[],
    selectedId: number | null,
    fullList: T[]
  ): T[] {
    if (selectedId === null || selectedId === undefined) return list;
    const already = list.some((e) => e.id === selectedId);
    if (already) return list;
    const selected = fullList.find((e) => e.id === selectedId);
    return selected ? [...list, selected] : list;
  }

  isoToLocalInput(iso: string): string {
    // Convierte ISO a formato yyyy-MM-ddTHH:mm para input datetime-local
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
      d.getDate()
    )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  localInputToIso(value: string): string {
    return new Date(value).toISOString();
  }

  timeOrderValidator(group: AbstractControl) {
    const start = group.get("startTime")?.value;
    const end = group.get("endTime")?.value;
    if (start && end && new Date(start) >= new Date(end)) {
      return { timeOrder: true };
    }
    return null;
  }

  overlapValidator(group: AbstractControl) {
    const driverId = group.get("driverId")?.value;
    const motorcycleId = group.get("motorcycleId")?.value;
    const start = group.get("startTime")?.value;
    const end = group.get("endTime")?.value;
    if (!driverId || !motorcycleId || !start) return null;
    const newStart = new Date(start).getTime();
    const newEnd = end ? new Date(end).getTime() : newStart; // si no hay end todavía
    const overlaps = this.existingShifts.some((s) => {
      if (s.id === this.shiftId) return false; // ignorar el mismo turno en edición
      if (s.driverId !== driverId && s.motorcycleId !== motorcycleId)
        return false;
      const sStart = new Date(s.startTime).getTime();
      const sEnd = s.endTime ? new Date(s.endTime).getTime() : sStart;
      // solape si rangos se cruzan
      return newStart <= sEnd && sStart <= newEnd;
    });
    return overlaps ? { overlap: true } : null;
  }

  hasError(control: string, error: string): boolean {
    const c = this.form.get(control);
    return !!c && c.touched && c.hasError(error);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.value;
    const payload: Partial<Shift> = {
      driverId: raw.driverId,
      motorcycleId: raw.motorcycleId,
      startTime: this.localInputToIso(raw.startTime),
      endTime: raw.endTime ? this.localInputToIso(raw.endTime) : undefined,
      status: raw.status,
    };

    if (this.shiftId && this.editMode) {
      this.shiftsService
        .update(this.shiftId, payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            Swal.fire("Actualizado", "El turno fue actualizado.", "success");
            this.router.navigate(["/shifts"]);
          },
          error: () => Swal.fire("Error", "No se pudo actualizar.", "error"),
        });
    } else {
      this.shiftsService
        .create(payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            Swal.fire("Creado", "El turno fue creado.", "success");
            this.router.navigate(["/shifts"]);
          },
          error: () => Swal.fire("Error", "No se pudo crear.", "error"),
        });
    }
  }

  cancel(): void {
    this.router.navigate(["/shifts"]);
  }
}
