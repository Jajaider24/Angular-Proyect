import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from "@angular/core";
import { Subject, takeUntil } from "rxjs";
import {
  AppNotification,
  NotificationService,
} from "../../services/notification.service";

@Component({
  selector: "app-notifier",
  templateUrl: "./notifier.component.html",
  styleUrls: ["./notifier.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotifierComponent implements OnInit, OnDestroy {
  items: AppNotification[] = [];
  private destroy$ = new Subject<void>();

  constructor(private notifications: NotificationService) {}

  ngOnInit(): void {
    this.notifications
      .stream()
      .pipe(takeUntil(this.destroy$))
      .subscribe((n) => {
        this.items.push(n);
        // Auto-remover después de 8s
        setTimeout(() => this.remove(n), 8000);
      });
  }

  remove(n: AppNotification) {
    this.items = this.items.filter((x) => x !== n);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
