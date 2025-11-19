import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Menu } from "../models";
import { BaseApiService } from "./base-api.service";

@Injectable({ providedIn: "root" })
export class MenusService {
  private path = "menus";
  constructor(private api: BaseApiService) {}

  list(params?: any): Observable<Menu[]> {
    return this.api.list<Menu[]>(this.path, params);
  }

  get(id: number): Observable<Menu> {
    return this.api.get<Menu>(this.path, id);
  }

  create(payload: Partial<Menu>): Observable<Menu> {
    return this.api.create<Menu>(this.path, payload);
  }

  update(id: number, payload: Partial<Menu>): Observable<Menu> {
    return this.api.update<Menu>(this.path, id, payload);
  }

  delete(id: number): Observable<any> {
    return this.api.delete<any>(this.path, id);
  }
}
