import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, merge } from "rxjs";
import { environment } from "src/environments/environment";
import { SocketService } from "src/app/core/services/socket.service";

export interface Position {
  lat: number;
  lng: number;
}

@Injectable({ providedIn: "root" })
export class TrackingService {
  constructor(private http: HttpClient, private socket: SocketService) {}

  connect() {
    this.socket.connect();
  }

  disconnect() {
    this.socket.disconnect();
  }

  start(plate: string): Observable<any> {
    const key = (plate || "").trim().toUpperCase();
    if (!key) return new Observable((sub) => sub.complete());
    // Ajuste a backend actual: endpoint sin sufijo /start
    return this.http.post(`${environment.apiUrl}/motorcycles/track/${key}`, {});
  }

  stop(plate: string): Observable<any> {
    const key = (plate || "").trim().toUpperCase();
    if (!key) return new Observable((sub) => sub.complete());
    // Ajuste a backend actual: endpoint /motorcycles/stop/<PLACA>
    return this.http.post(`${environment.apiUrl}/motorcycles/stop/${key}`, {});
  }

  positions$(plate: string) {
    const key = (plate || "").trim().toUpperCase();
    if (!key) return new Observable<Position>((sub) => sub.complete());
    // Compatibilidad: algunos backends emiten por 'PLACA' y otros por 'position:PLACA'
    const raw$ = this.socket.fromEvent<Position>(key);
    const namespaced$ = this.socket.fromEvent<Position>(`position:${key}`);
    return merge(raw$, namespaced$);
  }
}
