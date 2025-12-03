export interface Issue {
  id: number;
  title: string;
  description: string;
  status: string; // 'open' | 'in_progress' | 'closed'
  orderId?: number | null;
  driverId?: number | null;
  motorcycleId?: number | null;
  dateReported?: string; // ISO date
}
