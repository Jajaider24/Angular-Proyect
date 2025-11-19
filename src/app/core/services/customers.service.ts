import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Customer } from "../models";
import { BaseApiService } from "./base-api.service";

@Injectable({ providedIn: "root" })
export class CustomersService {
  private path = "customers";
  constructor(private api: BaseApiService) {}

  list(params?: any): Observable<Customer[]> {
    return this.api.list<Customer[]>(this.path, params);
  }

  get(id: number): Observable<Customer> {
    return this.api.get<Customer>(this.path, id);
  }

  create(payload: Partial<Customer>): Observable<Customer> {
    return this.api.create<Customer>(this.path, payload);
  }

  update(id: number, payload: Partial<Customer>): Observable<Customer> {
    return this.api.update<Customer>(this.path, id, payload);
  }

  delete(id: number): Observable<any> {
    return this.api.delete<any>(this.path, id);
  }
}
