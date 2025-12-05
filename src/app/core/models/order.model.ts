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

/**
 * Información básica del cliente asociado a una orden
 * Se incluye cuando el backend devuelve la relación expandida
 */
export interface OrderCustomer {
  id: number;
  name: string;
  email?: string;
  phone?: string;
}

/**
 * Información básica del menú asociado a una orden
 * Se incluye cuando el backend devuelve la relación expandida
 */
export interface OrderMenu {
  id: number;
  name: string;
  price?: number;
}

/**
 * Modelo de Order para el frontend
 * =========================================================================
 * Incluye las propiedades básicas y opcionalmente las relaciones expandidas
 * (customer, menu) cuando el backend las devuelve en la respuesta.
 * =========================================================================
 */
export interface Order {
  id: number;
  customerId: number;
  // Relación expandida del cliente (opcional, se incluye cuando el backend la devuelve)
  customer?: OrderCustomer;
  // Relación expandida del menú (opcional)
  menu?: OrderMenu;
  items: OrderItem[];
  totalPrice: number;
  status: OrderStatus;
  motorcycleId?: number;
  addressId: number;
  createdAt?: string; // ISO date
}
