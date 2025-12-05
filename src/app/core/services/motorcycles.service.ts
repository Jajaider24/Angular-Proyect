import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map, tap } from "rxjs/operators";
import { Motorcycle } from "../models";
import { BaseApiService } from "./base-api.service";

@Injectable({ providedIn: "root" })
export class MotorcyclesService {
  private path = "motorcycles";
  constructor(private api: BaseApiService) {}

  private adapt(m: any): Motorcycle {
    return {
      id: m.id,
      licensePlate: m.license_plate ?? m.licensePlate,
      brand: m.brand,
      year: m.year,
      status: m.status,
      currentLat: m.current_lat ?? m.currentLat,
      currentLng: m.current_lng ?? m.currentLng,
    } as Motorcycle;
  }

  list(params?: any): Observable<Motorcycle[]> {
    return this.api
      .list<any>(this.path, params)
      .pipe(
        tap((resp) => {
          console.debug("MotorcyclesService.list raw resp:", resp);
        }),
        map((resp) => {
          const arr = Array.isArray(resp)
            ? resp
            : (resp?.items || resp?.data || resp?.results || resp?.motorcycles || []);
          return (arr || []).map((m: any) => this.adapt(m));
        })
      );
  }

  get(id: number): Observable<Motorcycle> {
    return this.api.get<any>(this.path, id).pipe(map((m) => this.adapt(m)));
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
