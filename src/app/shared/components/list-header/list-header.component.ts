import { ChangeDetectionStrategy, Component, Input } from "@angular/core";

/**
 * ListHeaderComponent
 * Encabezado reutilizable para páginas de listado.
 * Muestra icono, título, subtítulo, breadcrumb y un botón de acción principal (crear).
 * Pensado para Angular 14 con NgModules y lazy loading.
 */
@Component({
  selector: "app-list-header",
  templateUrl: "./list-header.component.html",
  styleUrls: ["./list-header.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListHeaderComponent {
  /** Título principal de la página de lista */
  @Input() title = "";
  /** Subtítulo descriptivo opcional */
  @Input() subtitle?: string;
  /** Nombre de icono Lucide (preferente). Ej: 'ListChecks', 'AlertCircle' */
  @Input() lucide?: string;
  /** Clase de icono clásico (Argon/ni-*) como fallback */
  @Input() icon?: string;
  /** Breadcrumb opcional: pares de etiqueta y routerLink */
  @Input() breadcrumb?: Array<{ label: string; link?: any[] }> = [];
  /** Texto del botón de acción principal (por defecto: Crear) */
  @Input() actionText = "Crear";
  /** Ruta del botón de acción principal */
  @Input() actionLink?: any[];
  /** Icono del botón de acción principal (Lucide) */
  @Input() actionLucide = "Plus";
  /** Clase de botón Bootstrap (primario por defecto) */
  @Input() actionBtnClass = "btn btn-primary";
}
