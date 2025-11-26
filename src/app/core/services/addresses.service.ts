import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Address } from "../models";
import { BaseApiService } from "./base-api.service";

/**
 * Servicio para gestionar las operaciones CRUD de Addresses (Direcciones de entrega).
 * Las direcciones están asociadas a Orders (pedidos) para especificar dónde se entrega.
 *
 * Campos principales:
 * - order_id: ID del pedido asociado (FK a Order)
 * - street: Calle de la dirección
 * - city: Ciudad
 * - state: Estado/Provincia
 * - postal_code: Código postal
 * - additional_info: Información adicional (apartamento, referencias, etc.)
 */
@Injectable({ providedIn: "root" })
export class AddressesService {
  private path = "addresses";

  constructor(private api: BaseApiService) {}

  /**
   * Obtiene la lista completa de direcciones registradas.
   * @param params Parámetros opcionales para filtrado o paginación
   * @returns Observable con array de direcciones
   */
  list(params?: any): Observable<Address[]> {
    return this.api.list<Address[]>(this.path, params);
  }

  /**
   * Obtiene una dirección específica por su ID.
   * @param id ID de la dirección a obtener
   * @returns Observable con la dirección encontrada
   */
  get(id: number): Observable<Address> {
    return this.api.get<Address>(this.path, id);
  }

  /**
   * Crea una nueva dirección en el sistema.
   * Valida que los campos obligatorios estén presentes (order_id, street, city, state, postal_code).
   * @param payload Datos de la dirección a crear
   * @returns Observable con la dirección creada
   */
  create(payload: Partial<Address>): Observable<Address> {
    return this.api.create<Address>(this.path, payload);
  }

  /**
   * Actualiza una dirección existente.
   * @param id ID de la dirección a actualizar
   * @param payload Datos parciales de la dirección a modificar
   * @returns Observable con la dirección actualizada
   */
  update(id: number, payload: Partial<Address>): Observable<Address> {
    return this.api.update<Address>(this.path, id, payload);
  }

  /**
   * Elimina una dirección del sistema.
   * @param id ID de la dirección a eliminar
   * @returns Observable con respuesta de la operación
   */
  delete(id: number): Observable<any> {
    return this.api.delete<any>(this.path, id);
  }
}
