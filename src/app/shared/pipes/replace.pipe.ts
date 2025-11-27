import { Pipe, PipeTransform } from "@angular/core";

/**
 * Pipe para reemplazar cadenas en texto
 * Útil para formatear mensajes con saltos de línea
 *
 * Uso: {{ text | replace: '\n' : '<br>' }}
 */
@Pipe({
  name: "replace",
})
export class ReplacePipe implements PipeTransform {
  /**
   * Transforma el texto reemplazando todas las ocurrencias de 'search' por 'replacement'
   * @param value - Texto original
   * @param search - Cadena a buscar
   * @param replacement - Cadena de reemplazo
   * @returns Texto transformado
   */
  transform(value: string, search: string, replacement: string): string {
    if (!value) return value;

    // Reemplazar todas las ocurrencias usando expresión regular global
    const regex = new RegExp(this.escapeRegex(search), "g");
    return value.replace(regex, replacement);
  }

  /**
   * Escapa caracteres especiales de regex
   * @param str - Cadena a escapar
   * @returns Cadena escapada
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
}
