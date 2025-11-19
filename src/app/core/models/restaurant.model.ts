import { Address } from './address.model';

export interface Restaurant {
  id: number;
  name: string;
  address?: Partial<Address> | string;
  phone?: string;
  email?: string;
  createdAt?: string; // ISO date
}
