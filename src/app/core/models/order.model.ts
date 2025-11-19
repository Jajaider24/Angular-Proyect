export interface OrderItem {
  menuId: number;
  quantity: number;
}

export type OrderStatus =
  | "pending"
  | "assigned"
  | "in_transit"
  | "delivered"
  | "cancelled";

export interface Order {
  id: number;
  customerId: number;
  items: OrderItem[];
  totalPrice: number;
  status: OrderStatus;
  motorcycleId?: number;
  addressId: number;
  createdAt?: string; // ISO date
}
