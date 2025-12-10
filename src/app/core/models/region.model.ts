// Modelo de Región asociada a un Restaurante
export interface Region {
  restaurantId: number;
  restaurantName: string;
  regionId: number; // identificador numérico de la región
  regionName: string; // nombre de la región (ej: Antioquia, Cundinamarca)
}
