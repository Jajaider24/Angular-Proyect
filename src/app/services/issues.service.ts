import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { Issue } from "../models/issue.model";

@Injectable({ providedIn: "root" })
export class IssuesService {
  constructor(private http: HttpClient) {}

  list(): Observable<Issue[]> {
    return this.http.get<Issue[]>(`${environment.url_backend}/issues`);
  }
  view(id: number): Observable<Issue> {
    return this.http.get<Issue>(`${environment.url_backend}/issues/${id}`);
  }
  create(data: Partial<Issue>): Observable<Issue> {
    return this.http.post<Issue>(`${environment.url_backend}/issues`, data);
  }
  update(id: number, data: Partial<Issue>): Observable<Issue> {
    return this.http.put<Issue>(
      `${environment.url_backend}/issues/${id}`,
      data
    );
  }
  delete(id: number): Observable<any> {
    return this.http.delete(`${environment.url_backend}/issues/${id}`);
  }
}
