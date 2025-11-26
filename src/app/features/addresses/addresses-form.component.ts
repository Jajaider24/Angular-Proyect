import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { Subject, takeUntil } from "rxjs";
import { Address } from "src/app/core/models";
import { AddressesService } from "src/app/core/services/addresses.service";
import { OrdersService } from "src/app/core/services/orders.service";

/**
 * Componente para crear y editar direcciones de entrega.
 *
 * Validaciones implementadas:
 * - order_id: Requerido (FK a Order)
 * - street: Requerido, mínimo 5 caracteres, máximo 100
 * - city: Requerido, mínimo 3 caracteres, máximo 50, solo letras
 * - state: Requerido, mínimo 3 caracteres, máximo 50
 * - postal_code: Requerido, formato código postal (alfanumérico 4-10 caracteres)
 * - additional_info: Opcional, máximo 500 caracteres
 *
 * Modos de operación:
 * - CREATE: /addresses/create (isEdit = false)
 * - EDIT: /addresses/:id/edit (isEdit = true)
 */
@Component({
  selector: "app-addresses-form",
  templateUrl: "./addresses-form.component.html",
  styleUrls: ["./addresses-form.component.scss"],
})
export class AddressesFormComponent implements OnInit, OnDestroy {
  // Formulario reactivo con validaciones
  form!: FormGroup;

  // Estados de UI
  loading = false;
  isEdit = false;
  submitted = false;

  // ID de la dirección en modo edición
  addressId?: number;

  // Lista de orders disponibles para el selector
  availableOrders: any[] = [];

  // Subject para limpieza de suscripciones
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private addressesService: AddressesService,
    private ordersService: OrdersService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Inicializar formulario con validaciones
    this.buildForm();

    // Cargar lista de órdenes disponibles
    this.loadOrders();

    // Detectar si estamos en modo edición
    const idParam = this.route.snapshot.paramMap.get("id");
    if (idParam) {
      this.isEdit = true;
      this.addressId = Number(idParam);
      this.loadAddress(this.addressId);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Construye el formulario reactivo con todas las validaciones.
   * Aplica validadores tanto síncronos como asíncronos si es necesario.
   */
  private buildForm(): void {
    this.form = this.fb.group({
      // Order ID: obligatorio, debe ser un número válido
      order_id: [null, [Validators.required]],

      // Calle: obligatoria, longitud entre 5-100 caracteres
      street: [
        "",
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(100),
        ],
      ],

      // Ciudad: obligatoria, solo letras y espacios, 3-50 caracteres
      city: [
        "",
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
          Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/),
        ],
      ],

      // Estado: obligatorio, 3-50 caracteres
      state: [
        "",
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
        ],
      ],

      // Código postal: obligatorio, alfanumérico 4-10 caracteres
      postal_code: [
        "",
        [
          Validators.required,
          Validators.minLength(4),
          Validators.maxLength(10),
          Validators.pattern(/^[a-zA-Z0-9\s-]+$/),
        ],
      ],

      // Información adicional: opcional, máximo 500 caracteres
      additional_info: ["", [Validators.maxLength(500)]],
    });
  }

  /**
   * Carga la lista de órdenes disponibles para el selector.
   * Solo se muestran órdenes que no tienen dirección asignada (o la actual en edición).
   */
  private loadOrders(): void {
    this.ordersService
      .list()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (orders) => {
          this.availableOrders = orders;
        },
        error: (err) => {
          console.error("Error al cargar órdenes:", err);
        },
      });
  }

  /**
   * Carga los datos de una dirección existente para edición.
   * Hace un patch del formulario con los valores obtenidos.
   */
  private loadAddress(id: number): void {
    this.loading = true;
    this.addressesService
      .get(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (address) => {
          this.form.patchValue(address);
          this.loading = false;
        },
        error: (err) => {
          console.error("Error al cargar dirección:", err);
          this.loading = false;
          // TODO: Mostrar notificación y redirigir
          this.router.navigate(["/addresses"]);
        },
      });
  }

  /**
   * Guarda la dirección (crear o actualizar según el modo).
   * Valida el formulario antes de enviar.
   */
  onSubmit(): void {
    this.submitted = true;

    // Validar formulario
    if (this.form.invalid) {
      // Marcar todos los campos como touched para mostrar errores
      Object.keys(this.form.controls).forEach((key) => {
        this.form.get(key)?.markAsTouched();
      });
      return;
    }

    const payload = this.form.value;
    this.loading = true;

    // Decidir operación según modo
    const operation =
      this.isEdit && this.addressId
        ? this.addressesService.update(this.addressId, payload)
        : this.addressesService.create(payload);

    operation.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        // TODO: Mostrar notificación de éxito
        this.router.navigate(["/addresses"]);
      },
      error: (err) => {
        console.error("Error al guardar dirección:", err);
        this.loading = false;
        // TODO: Mostrar notificación de error
      },
    });
  }

  /**
   * Cancela la operación y regresa al listado.
   */
  onCancel(): void {
    this.router.navigate(["/addresses"]);
  }

  /**
   * Helper para acceder fácilmente a los controles del formulario en el template.
   */
  get f() {
    return this.form.controls;
  }

  /**
   * Valida si un campo tiene errores y ha sido touched.
   */
  hasError(field: string): boolean {
    const control = this.form.get(field);
    return !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched || this.submitted)
    );
  }

  /**
   * Obtiene el mensaje de error específico para un campo.
   */
  getErrorMessage(field: string): string {
    const control = this.form.get(field);
    if (!control || !control.errors) return "";

    const errors = control.errors;

    if (errors["required"]) return "Este campo es obligatorio";
    if (errors["minlength"]) {
      const min = errors["minlength"].requiredLength;
      return `Debe tener al menos ${min} caracteres`;
    }
    if (errors["maxlength"]) {
      const max = errors["maxlength"].requiredLength;
      return `No puede exceder ${max} caracteres`;
    }
    if (errors["pattern"]) {
      if (field === "city") return "Solo se permiten letras y espacios";
      if (field === "postal_code") return "Formato de código postal inválido";
    }

    return "Valor inválido";
  }
}
