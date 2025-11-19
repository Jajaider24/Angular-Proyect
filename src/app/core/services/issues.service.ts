import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Issue } from "../models";
import { BaseApiService } from "./base-api.service";

@Injectable({ providedIn: "root" })
export class IssuesService {
  private path = "issues";
  constructor(private api: BaseApiService) {}

  list(params?: any): Observable<Issue[]> {
    return this.api.list<Issue[]>(this.path, params);
  }

  get(id: number): Observable<Issue> {
    return this.api.get<Issue>(this.path, id);
  }

  create(payload: Partial<Issue>): Observable<Issue> {
    return this.api.create<Issue>(this.path, payload);
  }

  update(id: number, payload: Partial<Issue>): Observable<Issue> {
    return this.api.update<Issue>(this.path, id, payload);
  }

  delete(id: number): Observable<any> {
    return this.api.delete<any>(this.path, id);
  }
}
