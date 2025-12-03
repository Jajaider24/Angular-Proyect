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
    // Expecting keys: issue_id, image_url, caption, taken_at (ISO)
    return this.http.post<Photo>(`${environment.url_backend}/photos`, data);
  }
  update(id: number, data: Partial<Photo>): Observable<Photo> {
    // Update fields aligned with backend: image_url, caption, taken_at, issue_id
    return this.http.put<Photo>(
      `${environment.url_backend}/photos/${id}`,
      data
    );
  }
  delete(id: number): Observable<any> {
    return this.http.delete(`${environment.url_backend}/photos/${id}`);
  }

  upload(
    data: { issue_id?: number; caption?: string; taken_at?: string },
    file: File
  ): Observable<Photo> {
    const form = new FormData();
    if (data?.issue_id !== undefined && data?.issue_id !== null) {
      form.append("issue_id", String(data.issue_id));
    }
    if (data?.caption) {
      form.append("caption", data.caption);
    }
    if (data?.taken_at) {
      form.append("taken_at", data.taken_at); // ISO string
    }
    form.append("file", file);
    return this.http.post<Photo>(
      `${environment.url_backend}/photos/upload`,
      form
    );
  }
}
