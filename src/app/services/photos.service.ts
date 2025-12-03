import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { Photo } from "../models/photo.model";

@Injectable({ providedIn: "root" })
export class PhotosService {
  constructor(private http: HttpClient) {}

  list(): Observable<Photo[]> {
    return this.http.get<Photo[]>(`${environment.url_backend}/photos`);
  }
  view(id: number): Observable<Blob> {
    return this.http.get(`${environment.url_backend}/photos/${id}`, {
      responseType: "blob",
    });
  }
  create(data: Partial<Photo>): Observable<Photo> {
    return this.http.post<Photo>(`${environment.url_backend}/photos`, data);
  }
  update(id: number, data: Partial<Photo>): Observable<Photo> {
    return this.http.put<Photo>(
      `${environment.url_backend}/photos/${id}`,
      data
    );
  }
  delete(id: number): Observable<any> {
    return this.http.delete(`${environment.url_backend}/photos/${id}`);
  }

  upload(data: any, file: File): Observable<Photo> {
    const form = new FormData();
    Object.keys(data || {}).forEach((k) => {
      if (data[k] !== undefined && data[k] !== null) {
        form.append(k, String(data[k]));
      }
    });
    form.append("file", file);
    return this.http.post<Photo>(
      `${environment.url_backend}/photos/upload`,
      form
    );
  }
}
