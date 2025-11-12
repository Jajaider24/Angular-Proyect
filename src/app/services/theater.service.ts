import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Theater } from "../models/theater.model";

@Injectable({
  providedIn: "root",
})
export class TheaterService {
  constructor(private http: HttpClient) {}

  list(): Observable<Theater[]> {
    return this.http.get<Theater[]>(`${environment.url_backend}/theaters`);
  }
  view(id: number): Observable<Theater> {
    return this.http.get<Theater>(`${environment.url_backend}/theaters/${id}`);
  }
  create(newTheater: Theater): Observable<Theater> {  // Método para crear un nuevo teatro
    delete newTheater.id;  // Eliminar el id para que el backend lo asigne automáticamente
    return this.http.post<Theater>(  // Realizar una solicitud POST al backend
      `${environment.url_backend}/theaters`,  // Endpoint para crear teatros
      newTheater
    );
  }
  update(theTheater: Theater): Observable<Theater> {  // Método para actualizar un teatro existente
    return this.http.put<Theater>(  // Realizar una solicitud PUT al backend
      `${environment.url_backend}/theaters/${theTheater.id}`,  // Endpoint para actualizar el teatro con el id especificado
      theTheater  // Datos actualizados del teatro
    );
  }

  delete(id: number) {
    return this.http.delete<Theater>(
      `${environment.url_backend}/theaters/${id}`
    );
  }
}
