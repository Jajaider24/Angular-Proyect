export interface Address {
  id: number;
  street: string;
  city: string;
  state?: string;
  postalCode?: string;
  lat?: number;
  lng?: number;
  orderId?: number;
}
