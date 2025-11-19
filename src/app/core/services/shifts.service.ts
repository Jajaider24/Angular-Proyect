import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Shift } from "../models";
import { BaseApiService } from "./base-api.service";

@Injectable({ providedIn: "root" })
export class ShiftsService {
  private path = "shifts";
  constructor(private api: BaseApiService) {}

  list(params?: any): Observable<Shift[]> {
    return this.api.list<Shift[]>(this.path, params);
  }

  get(id: number): Observable<Shift> {
    return this.api.get<Shift>(this.path, id);
  }

  create(payload: Partial<Shift>): Observable<Shift> {
    return this.api.create<Shift>(this.path, payload);
  }

  update(id: number, payload: Partial<Shift>): Observable<Shift> {
    return this.api.update<Shift>(this.path, id, payload);
  }

  delete(id: number): Observable<any> {
    return this.api.delete<any>(this.path, id);
  }
}
