export interface Issue {
  id: number;
  motorcycleId: number;
  description?: string;
  issueType?: string;
  dateReported?: string; // ISO date
  status?: string;
}
