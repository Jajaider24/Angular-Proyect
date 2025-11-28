import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Order } from "../models";
import { BaseApiService } from "./base-api.service";

@Injectable({ providedIn: "root" })
export class OrdersService {
  private path = "orders";
  constructor(private api: BaseApiService) {}

  // Adaptador: normaliza snake_case de backend a camelCase del frontend
  private adapt(o: any): Order {
    return {
      id: o.id,
      customerId: o.customer_id,
      items: Array.isArray(o.items) ? o.items : [],
      totalPrice: o.total_price,
      status: o.status,
      motorcycleId: o.motorcycle_id ?? undefined,
      addressId: o.address?.id ?? o.address_id,
      createdAt: o.created_at,
    } as Order;
  }

  list(params?: any): Observable<Order[]> {
    return this.api
      .list<any[]>(this.path, params)
      .pipe(map((arr) => (arr || []).map((o) => this.adapt(o))));
  }

  get(id: number): Observable<Order> {
    return this.api.get<any>(this.path, id).pipe(map((o) => this.adapt(o)));
  }

  private toBackend(payload: Partial<Order>): any {
    // Transforma camelCase → snake_case para el backend Flask
    return {
      id: payload.id,
      customer_id: payload.customerId,
      menu_id: (payload as any).menuId, // el modelo TS usa items; aquí usamos un único menu_id
      motorcycle_id: payload.motorcycleId ?? null,
      quantity: (payload as any).quantity ?? 1,
      total_price: payload.totalPrice,
      status: payload.status,
      address_id: payload.addressId,
    };
  }

  create(payload: Partial<Order>): Observable<Order> {
    const body = this.toBackend(payload);
    return this.api.create<any>(this.path, body).pipe(map((o) => this.adapt(o)));
  }

  update(id: number, payload: Partial<Order>): Observable<Order> {
    const body = this.toBackend(payload);
    return this.api.update<any>(this.path, id, body).pipe(map((o) => this.adapt(o)));
  }

  delete(id: number): Observable<any> {
    return this.api.delete<any>(this.path, id);
  }
}
