import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Motorcycle } from "../models";
import { BaseApiService } from "./base-api.service";

@Injectable({ providedIn: "root" })
export class MotorcyclesService {
  private path = "motorcycles";
  constructor(private api: BaseApiService) {}

  list(params?: any): Observable<Motorcycle[]> {
    return this.api.list<Motorcycle[]>(this.path, params);
  }

  get(id: number): Observable<Motorcycle> {
    return this.api.get<Motorcycle>(this.path, id);
  }

  create(payload: Partial<Motorcycle>): Observable<Motorcycle> {
    return this.api.create<Motorcycle>(this.path, payload);
  }

  update(id: number, payload: Partial<Motorcycle>): Observable<Motorcycle> {
    return this.api.update<Motorcycle>(this.path, id, payload);
  }

  delete(id: number): Observable<any> {
    return this.api.delete<any>(this.path, id);
  }
}
