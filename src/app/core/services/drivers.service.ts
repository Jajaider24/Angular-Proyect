import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Driver } from "../models";
import { BaseApiService } from "./base-api.service";

@Injectable({ providedIn: "root" })
export class DriversService {
  private path = "drivers";
  constructor(private api: BaseApiService) {}

  list(params?: any): Observable<Driver[]> {
    return this.api.list<Driver[]>(this.path, params);
  }

  get(id: number): Observable<Driver> {
    return this.api.get<Driver>(this.path, id);
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
