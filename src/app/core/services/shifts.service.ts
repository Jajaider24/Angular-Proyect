import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Shift } from "../models";
import { BaseApiService } from "./base-api.service";

@Injectable({ providedIn: "root" })
export class ShiftsService {
  private path = "shifts";
  constructor(private api: BaseApiService) {}

  private adapt(s: any): Shift {
    return {
      id: s.id,
      driverId: s.driver_id ?? s.driverId,
      motorcycleId: s.motorcycle_id ?? s.motorcycleId,
      startTime: s.start_time ?? s.startTime,
      endTime: s.end_time ?? s.endTime,
      status: s.status,
    } as Shift;
  }

  list(params?: any): Observable<Shift[]> {
    return this.api
      .list<any>(this.path, params)
      .pipe(
        map((resp) => {
          const arr = Array.isArray(resp)
            ? resp
            : (resp?.items || resp?.data || resp?.results || []);
          return (arr || []).map((s: any) => this.adapt(s));
        })
      );
  }

  get(id: number): Observable<Shift> {
    return this.api.get<any>(this.path, id).pipe(map((s) => this.adapt(s)));
  }

  create(payload: Partial<Shift>): Observable<Shift> {
    // Convertir a snake_case esperado por backend
    const body: any = {
      driver_id: payload.driverId,
      motorcycle_id: payload.motorcycleId,
      start_time: payload.startTime,
      end_time: payload.endTime,
      status: payload.status,
    };
    return this.api.create<any>(this.path, body).pipe(map((s) => this.adapt(s)));
  }

  update(id: number, payload: Partial<Shift>): Observable<Shift> {
    const body: any = {
      driver_id: payload.driverId,
      motorcycle_id: payload.motorcycleId,
      start_time: payload.startTime,
      end_time: payload.endTime,
      status: payload.status,
    };
    return this.api.update<any>(this.path, id, body).pipe(map((s) => this.adapt(s)));
  }

  delete(id: number): Observable<any> {
    return this.api.delete<any>(this.path, id);
  }
}
