import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subject, takeUntil } from "rxjs";
import { OrdersNotificationService } from "./core/services/orders-notification.service";
import { NotificationService } from "./shared/services/notification.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit, OnDestroy {
  title = "argon-dashboard-angular";
  private destroy$ = new Subject<void>();

  constructor(
    private ordersNotifications: OrdersNotificationService,
    private notifier: NotificationService
  ) {}

  ngOnInit(): void {
    // Iniciar polling de órdenes para detectar nuevas asignaciones
    this.ordersNotifications.start();

    // Suscribirse a eventos y disparar notificación visual + sonora
    this.ordersNotifications
      .onAssigned()
      .pipe(takeUntil(this.destroy$))
      .subscribe((evt) => {
        this.notifier.notify(
          {
            title: "Nuevo pedido asignado",
            message: `Orden #${evt.id} asignada a motocicleta #${
              evt.motorcycle_id
            }. Total: $${evt.total_price.toFixed(2)}.`,
            level: "success",
            icon: "ni ni-delivery-fast",
          },
          true // reproducir sonido
        );
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.ordersNotifications.stop();
  }
}
