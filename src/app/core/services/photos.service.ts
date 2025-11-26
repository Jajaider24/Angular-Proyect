import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Photo } from "../models";
import { BaseApiService } from "./base-api.service";

/**
 * Servicio para gestionar las operaciones CRUD de Photos (Fotos de incidencias).
 * Las fotos sirven como evidencia visual de los problemas reportados en Issues.
 *
 * Campos principales:
 * - issue_id: ID de la incidencia asociada (FK a Issue)
 * - image_url: URL donde está almacenada la imagen
 * - caption: Descripción o título de la foto (opcional)
 * - taken_at: Fecha/hora en que se tomó la foto (opcional)
 *
 * Nota: Este servicio puede incluir métodos adicionales para subir archivos
 * directamente al servidor o a un storage service (S3, Azure Blob, etc.)
 */
@Injectable({ providedIn: "root" })
export class PhotosService {
  private path = "photos";

  constructor(private api: BaseApiService) {}

  /**
   * Obtiene la lista completa de fotos registradas.
   * Puede filtrar por issue_id para obtener solo fotos de una incidencia específica.
   * @param params Parámetros opcionales para filtrado (ej: { issue_id: 5 })
   * @returns Observable con array de fotos
   */
  list(params?: any): Observable<Photo[]> {
    return this.api.list<Photo[]>(this.path, params);
  }

  /**
   * Obtiene una foto específica por su ID.
   * @param id ID de la foto a obtener
   * @returns Observable con la foto encontrada
   */
  get(id: number): Observable<Photo> {
    return this.api.get<Photo>(this.path, id);
  }

  /**
   * Registra una nueva foto en el sistema.
   * La imagen ya debe estar subida previamente y tener una URL válida.
   * @param payload Datos de la foto (issue_id, image_url, caption, taken_at)
   * @returns Observable con la foto creada
   */
  create(payload: Partial<Photo>): Observable<Photo> {
    return this.api.create<Photo>(this.path, payload);
  }

  /**
   * Actualiza los metadatos de una foto existente.
   * Generalmente se usa para actualizar caption o taken_at, no la URL de la imagen.
   * @param id ID de la foto a actualizar
   * @param payload Datos parciales de la foto a modificar
   * @returns Observable con la foto actualizada
   */
  update(id: number, payload: Partial<Photo>): Observable<Photo> {
    return this.api.update<Photo>(this.path, id, payload);
  }

  /**
   * Elimina una foto del sistema.
   * IMPORTANTE: Solo elimina el registro, no borra el archivo físico del storage.
   * @param id ID de la foto a eliminar
   * @returns Observable con respuesta de la operación
   */
  delete(id: number): Observable<any> {
    return this.api.delete<any>(this.path, id);
  }

  /**
   * TODO: Método para subir archivos directamente.
   * upload(file: File, issueId: number): Observable<Photo> {
   *   const formData = new FormData();
   *   formData.append('file', file);
   *   formData.append('issue_id', issueId.toString());
   *   return this.api.upload<Photo>(`${this.path}/upload`, formData);
   * }
   */
}
