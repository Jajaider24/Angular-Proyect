import { ChangeDetectionStrategy, Component, Input } from "@angular/core";

@Component({
  selector: "app-form-header",
  templateUrl: "./form-header.component.html",
  styleUrls: ["./form-header.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormHeaderComponent {
  /** Título principal del formulario (crear/editar) */
  @Input() title = "";
  /** Icono opcional (clase de icono, p.e. 'ni ni-shop') */
  @Input() icon = "ni ni-collection";
  /** Ruta para volver (p.e. ['/restaurants']) */
  @Input() backLink: string | any[] = [];
  /** Texto del enlace de retorno */
  @Input() backText = "Volver";
}
