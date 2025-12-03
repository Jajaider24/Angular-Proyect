export interface Issue {
  id?: number;
  title?: string;
  description?: string;
  status?: "open" | "in_progress" | "closed" | string;
  order_id?: number | null;
  driver_id?: number | null;
  motorcycle_id?: number | null;
  created_at?: string;
}
