import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({ providedIn: "root" })
export class BaseApiService {
  protected baseUrl = environment.url_backend;
  constructor(protected http: HttpClient) {}

  list<T>(path: string, params?: any): Observable<T> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(
        (k) => (httpParams = httpParams.set(k, params[k]))
      );
    }
    return this.http.get<T>(`${this.baseUrl}/${path}`, { params: httpParams });
  }

  get<T>(path: string, id: number | string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${path}/${id}`);
  }

  create<T>(path: string, payload: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${path}`, payload);
  }

  update<T>(path: string, id: number | string, payload: any): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${path}/${id}`, payload);
  }

  delete<T>(path: string, id: number | string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}/${path}/${id}`);
  }
}
