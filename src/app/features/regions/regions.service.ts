import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, map } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({ providedIn: "root" })
export class RegionsService {
  constructor(private http: HttpClient) {}

  // Obtiene lista de regiones de la ruta externa /Colombia (placeholder)
  // Devuelve {id:number, name:string} por cada región desde API-Colombia
  getColombiaRegions(): Observable<{ id: number; name: string }[]> {
    const url = `https://api-colombia.com/api/v1/Region`;
    return this.http.get<any[]>(url).pipe(
      map((arr) => (arr || []).map((r: any) => ({ id: Number(r.id), name: String(r.name) })))
    );
  }

  // Obtiene lista de restaurantes en formato liviano (id, name)
  getRestaurantsLite(): Observable<{ id: number; name: string }[]> {
    const url = `${environment.apiUrl}/restaurants`;
    return this.http.get<any[]>(url).pipe(
      map((arr) => (arr || []).map((r: any) => ({ id: r.id, name: r.name })))
    );
  }
}
