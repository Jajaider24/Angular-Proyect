export interface Photo {
  id?: number;
  filename?: string;
  url?: string;
  caption?: string;
  issue_id?: number | null;
  order_id?: number | null;
  created_at?: string;
}
