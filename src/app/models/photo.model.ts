export interface Photo {
  id?: number;
  image_url?: string; // ruta relativa en backend
  caption?: string;
  issue_id?: number | null;
  order_id?: number | null;
  taken_at?: string; // ISO date string
}
