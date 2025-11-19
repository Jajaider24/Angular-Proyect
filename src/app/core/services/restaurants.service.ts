import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Restaurant } from "../models";
import { BaseApiService } from "./base-api.service";

@Injectable({ providedIn: "root" })
export class RestaurantsService {
  private path = "restaurants";
  constructor(private api: BaseApiService) {}

  list(params?: any): Observable<Restaurant[]> {
    return this.api.list<Restaurant[]>(this.path, params);
  }

  get(id: number): Observable<Restaurant> {
    return this.api.get<Restaurant>(this.path, id);
  }

  create(payload: Partial<Restaurant>): Observable<Restaurant> {
    return this.api.create<Restaurant>(this.path, payload);
  }

  update(id: number, payload: Partial<Restaurant>): Observable<Restaurant> {
    return this.api.update<Restaurant>(this.path, id, payload);
  }

  delete(id: number): Observable<any> {
    return this.api.delete<any>(this.path, id);
  }
}
