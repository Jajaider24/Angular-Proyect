import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { Restaurant } from "src/app/core/models";
import { RestaurantsService } from "src/app/core/services/restaurants.service";

@Component({
  selector: "app-restaurants-form",
  templateUrl: "./restaurants-form.component.html",
  styleUrls: ["./restaurants-form.component.scss"],
})
export class RestaurantsFormComponent implements OnInit {
  form: FormGroup;
  loading = false;
  isEdit = false;
  id?: number;

  constructor(
    private fb: FormBuilder,
    private svc: RestaurantsService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      name: ["", Validators.required],
      email: [
        "",
        [
          Validators.required,
          Validators.email,
          Validators.maxLength(100),
        ],
      ],
      phone: [""],
      address: this.fb.group({ street: [""], city: [""] }),
    });
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get("id");
    if (idParam) {
      this.isEdit = true;
      this.id = Number(idParam);
      this.load(this.id);
    }
  }

  load(id: number) {
    this.loading = true;
    this.svc.get(id).subscribe({
      next: (r) => {
        // Si el backend devuelve address como string, necesitamos convertirlo
        // al formato del formulario (objeto con street y city)
        const addressStr = (r as any).address || "";
        const addressParts = addressStr.split(",").map((s: string) => s.trim());

        this.form.patchValue({
          name: (r as any).name,
          email: (r as any).email || "",
          phone: (r as any).phone,
          address: {
            street: addressParts[0] || "",
            city: addressParts[1] || "",
          },
        });
      },
      error: () => (this.loading = false),
      complete: () => (this.loading = false),
    });
  }

  save() {
    // Marcar todos los campos como touched para mostrar errores de validación
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      console.warn("⚠️ Formulario inválido. Errores:", this.form.errors);
      return;
    }

    // Obtener los valores del formulario y aplanar la estructura de address
    const formValue = this.form.value;
    const payload = {
      name: formValue.name,
      email: (formValue.email || "").trim(),
      phone: formValue.phone || "",
      address:
        formValue.address?.street && formValue.address?.city
          ? `${formValue.address.street}, ${formValue.address.city}`.trim()
          : formValue.address?.street || formValue.address?.city || "",
    };

    console.log("📤 Enviando datos:", payload);

    this.loading = true;
    const obs =
      this.isEdit && this.id
        ? this.svc.update(this.id, payload)
        : this.svc.create(payload);

    obs.subscribe({
      next: (response) => {
        console.log("✅ Restaurante guardado exitosamente:", response);
        this.router.navigate(["/restaurants"]);
      },
      error: (err) => {
        console.error("❌ Error al guardar restaurante:", err);
        alert(
          "Error al guardar: " +
            (err?.error?.message || err?.message || "Error desconocido")
        );
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  cancel() {
    this.router.navigate(["/restaurants"]);
  }
}
