import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Product } from "../models";
import { BaseApiService } from "./base-api.service";

@Injectable({ providedIn: "root" })
export class ProductsService {
  private path = "products";
  constructor(private api: BaseApiService) {}

  list(params?: any): Observable<Product[]> {
    return this.api.list<Product[]>(this.path, params);
  }

  get(id: number): Observable<Product> {
    return this.api.get<Product>(this.path, id);
  }

  create(payload: Partial<Product>): Observable<Product> {
    return this.api.create<Product>(this.path, payload);
  }

  update(id: number, payload: Partial<Product>): Observable<Product> {
    return this.api.update<Product>(this.path, id, payload);
  }

  delete(id: number): Observable<any> {
    return this.api.delete<any>(this.path, id);
  }
}
