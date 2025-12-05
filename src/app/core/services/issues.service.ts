import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Issue } from "../models";
import { BaseApiService } from "./base-api.service";

@Injectable({ providedIn: "root" })
export class IssuesService {
  private path = "issues";
  constructor(private api: BaseApiService) {}

  private adapt(i: any): Issue {
    return {
      id: i.id,
      motorcycleId: i.motorcycle_id ?? i.motorcycleId,
      description: i.description,
      issueType: i.issue_type ?? i.issueType ?? "other",
      dateReported: i.date_reported ?? i.dateReported,
      status: i.status,
      createdAt: i.created_at ?? i.createdAt,
    } as Issue;
  }

  list(params?: any): Observable<Issue[]> {
    return this.api
      .list<any[]>(this.path, params)
      .pipe(map((arr) => (arr || []).map((i) => this.adapt(i))));
  }

  get(id: number): Observable<Issue> {
    return this.api.get<any>(this.path, id).pipe(map((i) => this.adapt(i)));
  }

  private toBackend(payload: Partial<Issue>): any {
    return {
      motorcycle_id: payload.motorcycleId,
      description: payload.description,
      issue_type: payload.issueType || "other",
      date_reported: payload.dateReported,
      status: payload.status,
    };
  }

  create(payload: Partial<Issue>): Observable<Issue> {
    const body = this.toBackend(payload);
    return this.api
      .create<any>(this.path, body)
      .pipe(map((i) => this.adapt(i)));
  }

  update(id: number, payload: Partial<Issue>): Observable<Issue> {
    const body = this.toBackend(payload);
    return this.api
      .update<any>(this.path, id, body)
      .pipe(map((i) => this.adapt(i)));
  }

  delete(id: number): Observable<any> {
    return this.api.delete<any>(this.path, id);
  }
}
