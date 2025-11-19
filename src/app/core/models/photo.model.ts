export interface Photo {
  id: number;
  issueId: number;
  imageUrl: string;
  caption?: string;
  takenAt?: string; // ISO date
}
