import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Order } from "../models";
import { BaseApiService } from "./base-api.service";

@Injectable({ providedIn: "root" })
export class OrdersService {
  private path = "orders";
  constructor(private api: BaseApiService) {}

  list(params?: any): Observable<Order[]> {
    return this.api.list<Order[]>(this.path, params);
  }

  get(id: number): Observable<Order> {
    return this.api.get<Order>(this.path, id);
  }

  create(payload: Partial<Order>): Observable<Order> {
    return this.api.create<Order>(this.path, payload);
  }

  update(id: number, payload: Partial<Order>): Observable<Order> {
    return this.api.update<Order>(this.path, id, payload);
  }

  delete(id: number): Observable<any> {
    return this.api.delete<any>(this.path, id);
  }
}
