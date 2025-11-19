export interface Shift {
  id: number;
  driverId: number;
  motorcycleId: number;
  startTime: string; // ISO date
  endTime?: string; // ISO date
  status?: string;
}
