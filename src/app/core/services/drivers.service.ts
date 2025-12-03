import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Driver } from "../models";
import { BaseApiService } from "./base-api.service";

@Injectable({ providedIn: "root" })
export class DriversService {
  private path = "drivers";
  constructor(private api: BaseApiService) {}

  // Adaptador snake_case -> camelCase
  private adapt(d: any): Driver {
    return {
      id: d.id,
      name: d.name,
      licenseNumber: d.license_number ?? d.licenseNumber,
      phone: d.phone,
      email: d.email,
      status: d.status,
    } as Driver;
  }

  list(params?: any): Observable<Driver[]> {
    return this.api
      .list<any[]>(this.path, params)
      .pipe(map((arr) => (arr || []).map((d) => this.adapt(d))));
  }

  get(id: number): Observable<Driver> {
    return this.api.get<any>(this.path, id).pipe(map((d) => this.adapt(d)));
  }

  create(payload: Partial<Driver>): Observable<Driver> {
    return this.api.create<Driver>(this.path, payload);
  }

  update(id: number, payload: Partial<Driver>): Observable<Driver> {
    return this.api.update<Driver>(this.path, id, payload);
  }

  delete(id: number): Observable<any> {
    return this.api.delete<any>(this.path, id);
  }
}
