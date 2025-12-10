import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { RegionsService } from "./regions.service";
import { Region } from "../../core/models/region.model";

@Component({
  selector: "app-regions",
  templateUrl: "./regions.component.html",
  styleUrls: ["./regions.component.scss"],
})
export class RegionsComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  regions: { id: number; name: string }[] = [];
  restaurants: { id: number; name: string }[] = [];

  private destroy$ = new Subject<void>();

  constructor(private fb: FormBuilder, private regionsService: RegionsService) {}

  ngOnInit(): void {
    // Crear formulario reactivo con validaciones de campos obligatorios
    this.form = this.fb.group({
      restaurantId: [null, [Validators.required]],
      regionId: [null, [Validators.required]],
    });

    // Cargar listas desde servicios
    this.regionsService
      .getColombiaRegions()
      .pipe(takeUntil(this.destroy$))
      .subscribe((list) => (this.regions = list));

    this.regionsService
      .getRestaurantsLite()
      .pipe(takeUntil(this.destroy$))
      .subscribe((list) => (this.restaurants = list));
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const selectedRegion = this.regions.find((rg) => rg.id === this.form.value.regionId);
    const payload: Region = {
      restaurantId: this.form.value.restaurantId,
      restaurantName:
        this.restaurants.find((r) => r.id === this.form.value.restaurantId)?.name || "",
      regionId: selectedRegion?.id ?? 0,
      regionName: selectedRegion?.name || "",
    };

    // Por ahora solo mostramos en consola; persistencia dependerá del backend disponible
    console.log("Nueva región creada:", payload);
    this.createdRegions.push(payload);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // listado local de regiones creadas para mostrar en la parte inferior
  createdRegions: Region[] = [];
}
