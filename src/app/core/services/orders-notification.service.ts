import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, EMPTY, Observable, Subject, timer } from "rxjs";
import { catchError, map, switchMap } from "rxjs/operators";

// Modelo tipado de Orden (ajustar campos según backend)
export interface Order {
  id: number;
  customer_id: number;
  menu_id: number;
  motorcycle_id?: number | null;
  quantity: number;
  total_price: number;
  status: string; // e.g., 'pending', 'assigned', 'delivered'
}

// Payload para notificaciones de nuevos pedidos asignados
export interface OrderAssignedNotification {
  id: number;
  motorcycle_id: number;
  customer_id: number;
  menu_id: number;
  quantity: number;
  total_price: number;
}

@Injectable({ providedIn: "root" })
export class OrdersNotificationService {
  // Endpoint base; usa proxy Angular si está configurado
  private readonly baseUrl = "/orders";

  // Estado interno de órdenes vistas como asignadas
  private lastAssignedIds = new Set<number>();

  // Emisor de notificaciones para nuevo pedido asignado
  private assigned$ = new Subject<OrderAssignedNotification>();

  // Control de polling
  private pollingEnabled$ = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {
    // Iniciar polling cuando se habilite
    this.pollingEnabled$
      .pipe(
        // Si está habilitado: timer(0,5000). Si no: no emitir (EMPTY)
        switchMap((enabled) => (enabled ? timer(0, 5000) : EMPTY))
      )
      .pipe(
        switchMap(() => this.fetchOrders()),
        map((orders) => orders.filter((o) => this.isAssigned(o)))
      )
      .subscribe((assignedOrders) => {
        // Detectar nuevas asignaciones
        for (const o of assignedOrders) {
          if (!this.lastAssignedIds.has(o.id)) {
            this.lastAssignedIds.add(o.id);
            this.assigned$.next({
              id: o.id,
              motorcycle_id: o.motorcycle_id!,
              customer_id: o.customer_id,
              menu_id: o.menu_id,
              quantity: o.quantity,
              total_price: o.total_price,
            });
          }
        }
        // Limpiar ids que ya no están asignados
        const currentIds = new Set(assignedOrders.map((o) => o.id));
        for (const id of Array.from(this.lastAssignedIds)) {
          if (!currentIds.has(id)) {
            this.lastAssignedIds.delete(id);
          }
        }
      });
  }

  // Habilita el polling
  start(): void {
    this.pollingEnabled$.next(true);
  }

  // Detiene el polling
  stop(): void {
    this.pollingEnabled$.next(false);
  }

  // Observable público de notificaciones
  onAssigned(): Observable<OrderAssignedNotification> {
    return this.assigned$.asObservable();
  }

  // Obtiene todas las órdenes
  private fetchOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.baseUrl).pipe(
      catchError(() => {
        // En caso de error, retornar lista vacía para evitar romper el flujo
        return new BehaviorSubject<Order[]>([]);
      })
    );
  }

  // Regla: consideramos "asignado" si status === 'assigned' o motorcycle_id no es null
  private isAssigned(order: Order): boolean {
    return order.status?.toLowerCase() === "assigned" || !!order.motorcycle_id;
  }
}
