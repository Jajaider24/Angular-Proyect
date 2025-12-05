export interface Issue {
  id: number;
  motorcycleId: number; // FK requerido
  description: string; // requerido
  issueType: string; // 'accident' | 'breakdown' | 'maintenance' | 'other'
  dateReported: string; // ISO date requerido
  status: string; // 'open' | 'in_progress' | 'resolved'
  createdAt?: string; // ISO date
}
