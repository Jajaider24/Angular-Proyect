import { Injectable } from "@angular/core";

/**
 * Servicio ligero para almacenar coordenadas (lat/lng) de direcciones
 * solamente en el frontend (localStorage), sin tocar el backend.
 *
 * Justificación:
 * - El backend aún no persiste lat/lng de Address.
 * - Necesitamos mostrar mapa en "Ver" aunque el backend no devuelva coords.
 * - Guardamos pares {id: {lat, lng, timestamp}} en localStorage.
 *
 * Clave usada: ADDRESS_COORDS_CACHE
 */
@Injectable({ providedIn: 'root' })
export class AddressLocationCacheService {
  private storageKey = 'ADDRESS_COORDS_CACHE';

  private read(): Record<string, { lat: number; lng: number; ts: number }> {
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  private write(data: Record<string, { lat: number; lng: number; ts: number }>) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch {
      // Silenciar errores de quota
    }
  }

  set(addressId: number, lat: number, lng: number): void {
    if (addressId == null || isNaN(lat) || isNaN(lng)) return;
    const data = this.read();
    data[String(addressId)] = { lat, lng, ts: Date.now() };
    this.write(data);
  }

  get(addressId: number): { lat: number; lng: number } | null {
    const data = this.read();
    const entry = data[String(addressId)];
    if (!entry) return null;
    return { lat: entry.lat, lng: entry.lng };
  }

  has(addressId: number): boolean {
    return !!this.get(addressId);
  }

  remove(addressId: number): void {
    const data = this.read();
    delete data[String(addressId)];
    this.write(data);
  }
}
