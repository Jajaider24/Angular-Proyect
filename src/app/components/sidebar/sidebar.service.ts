import { Injectable } from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";
import { BehaviorSubject } from "rxjs";
import { filter } from "rxjs/operators";

@Injectable({ providedIn: "root" })
export class SidebarService {
  private collapsedKey = "app.sidebar.collapsed";
  private _collapsed$ = new BehaviorSubject<boolean>(this.readInitial());

  // active path observable: central source of truth for the active route
  private _activePath$ = new BehaviorSubject<string>(this.readInitialActive());

  constructor(private router: Router) {
    // listen to router navigation end and update active path centrally
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((e: any) => {
        const path = (e.urlAfterRedirects || e.url || "").toString();
        this._activePath$.next(path);
        
        // En móvil, cerrar el sidebar automáticamente al navegar
        this.closeOnMobileNavigation();
      });
  }

  /**
   * Cierra el sidebar automáticamente en móvil al navegar.
   */
  private closeOnMobileNavigation(): void {
    if (typeof window !== 'undefined' && window.innerWidth < 992) {
      // Solo cerrar si está abierto (!collapsed = abierto)
      if (!this._collapsed$.value) {
        this._collapsed$.next(true);
      }
    }
  }

  get collapsed$() {
    return this._collapsed$.asObservable();
  }

  get activePath$() {
    return this._activePath$.asObservable();
  }

  // current value getters
  get collapsed() {
    return this._collapsed$.value;
  }
  get activePath() {
    return this._activePath$.value;
  }

  toggle() {
    const next = !this._collapsed$.value;
    this.set(next);
  }

  set(value: boolean) {
    this._collapsed$.next(value);
    try {
      localStorage.setItem(this.collapsedKey, JSON.stringify(value));
    } catch {}
  }

  // allow manually setting active path (optional)
  setActive(path: string) {
    this._activePath$.next(path || "");
  }

  private readInitial(): boolean {
    try {
      // En móvil, siempre iniciar colapsado (cerrado)
      if (typeof window !== 'undefined' && window.innerWidth < 992) {
        return true; // true = colapsado = cerrado
      }
      const v = localStorage.getItem(this.collapsedKey);
      if (v === null) return false;
      return JSON.parse(v);
    } catch {
      return false;
    }
  }

  private readInitialActive(): string {
    try {
      // no persistent storage for active path; start with current router url if available
      return this.router?.url || "";
    } catch {
      return "";
    }
  }
}
