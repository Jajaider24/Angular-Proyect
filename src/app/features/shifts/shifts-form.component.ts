import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { FormBuilder, FormGroup, Validators, AbstractControl } from "@angular/forms";
import { Subject, forkJoin, takeUntil } from "rxjs";
import Swal from "sweetalert2";

import { Shift, Driver, Motorcycle } from "src/app/core/models";
import { ShiftsService } from "src/app/core/services/shifts.service";
import { DriversService } from "src/app/core/services/drivers.service";
import { MotorcyclesService } from "src/app/core/services/motorcycles.service";

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
    this.editMode = !!idParam && this.route.snapshot.routeConfig?.path?.includes("edit");
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
      { validators: [this.timeOrderValidator.bind(this), this.overlapValidator.bind(this)] }
    );
  }

  loadData(): void {
    this.loading = true;
    forkJoin({
      drivers: this.driversService.list(),
      motorcycles: this.motorcyclesService.list(),
      shifts: this.shiftsService.list(),
      current: this.shiftId ? this.shiftsService.get(this.shiftId) : undefined,
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ drivers, motorcycles, shifts, current }) => {
          this.drivers = drivers;
          this.motorcycles = motorcycles;
          this.existingShifts = shifts;
          if (current) {
            this.form.patchValue({
              driverId: current.driverId,
              motorcycleId: current.motorcycleId,
              startTime: this.isoToLocalInput(current.startTime),
              endTime: current.endTime ? this.isoToLocalInput(current.endTime) : null,
              status: current.status || "scheduled",
            });
          }

          // Filtrar disponibles por estado (simplemente 'available')
          this.availableDrivers = this.drivers.filter((d) => d.status === 'available');
          this.availableMotorcycles = this.motorcycles.filter((m) => m.status === 'available');

          // Incluir en las opciones el seleccionado aunque no esté disponible (para edición)
          this.driverOptions = this.computeOptionsWithSelected(
            this.availableDrivers,
            this.form.get('driverId')?.value,
            this.drivers
          );
          this.motorcycleOptions = this.computeOptionsWithSelected(
            this.availableMotorcycles,
            this.form.get('motorcycleId')?.value,
            this.motorcycles
          );

          // Revalidar tras tener existingShifts cargados
          this.form.updateValueAndValidity();

          // Marcar fin de carga
          this.loading = false;
        },
        error: (err) => {
          console.error("Error cargando datos turno:", err);
          this.loading = false;
        },
      });
  }

  private computeOptionsWithSelected<T extends { id: number }>(list: T[], selectedId: number | null, fullList: T[]): T[] {
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
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
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
      if (s.driverId !== driverId && s.motorcycleId !== motorcycleId) return false;
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
