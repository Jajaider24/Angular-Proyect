import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { CustomersService } from "src/app/core/services/customers.service";
import Swal from "sweetalert2";

@Component({
  selector: "app-customers-form",
  templateUrl: "./customers-form.component.html",
  styleUrls: ["./customers-form.component.scss"],
})
export class CustomersFormComponent implements OnInit {
  form: FormGroup;
  loading = false;
  submitted = false;
  isEdit = false;
  id: number | null = null;

  constructor(
    private fb: FormBuilder,
    private svc: CustomersService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      name: ["", Validators.required],
      email: ["", [Validators.required, Validators.email, Validators.maxLength(100)]],
      phone: ["", [Validators.maxLength(20)]],
    });
  }

  get f() { return this.form.controls; }

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
      next: (c: any) => {
        this.form.patchValue({
          name: c.name,
          email: c.email,
          phone: c.phone,
        });
        this.loading = false;
      },
      error: (err) => {
        console.error("Error cargando cliente", err);
        Swal.fire("Error", "No se pudo cargar el cliente.", "error");
        this.loading = false;
      }
    });
  }

  submit() {
    this.submitted = true;
    if (this.form.invalid) return;
    this.loading = true;
    const payload = this.form.value;
    const obs = this.isEdit && this.id
      ? this.svc.update(this.id!, payload)
      : this.svc.create(payload);
    obs.subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(["/customers"]);
      },
      error: (err) => {
        this.loading = false;
        Swal.fire("Error", this.isEdit ? "Error actualizando cliente" : "Error creando cliente", "error");
        console.error(err);
      }
    });
  }

  cancel() {
    this.router.navigate(["/customers"]);
  }
}
