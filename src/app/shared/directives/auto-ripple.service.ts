import { Injectable, NgZone } from "@angular/core";

@Injectable({ providedIn: "root" })
export class AutoRippleService {
  private selectors = [".btn", ".nav-link", "table .btn"];
  private observer: MutationObserver | null = null;

  constructor(private zone: NgZone) {
    // run outside Angular to avoid change detection overhead
    this.zone.runOutsideAngular(() => {
      // initial attach after microtask
      setTimeout(() => this.attachToAll());
      // observe DOM changes to attach to new elements (lazy loaded lists)
      this.observeMutations();
    });
  }

  private matchesSelector(el: Element): boolean {
    return this.selectors.some((s) => {
      try {
        return el.matches(s);
      } catch (e) {
        return false;
      }
    });
  }

  private attachToAll() {
    try {
      const nodes = document.querySelectorAll(this.selectors.join(","));
      nodes.forEach((n) => this.attach(n as HTMLElement));
    } catch (e) {}
  }

  private attach(el: HTMLElement) {
    if (!el) return;
    // avoid double attaching
    if ((el as any).__hasAutoRipple) return;
    (el as any).__hasAutoRipple = true;

    const handler = (ev: MouseEvent) => {
      if (ev.button !== 0) return;
      this.createRippleAt(ev, el);
    };

    el.addEventListener("mousedown", handler);
    // store reference for later removal if needed
    (el as any).__autoRippleHandler = handler;
  }

  private createRippleAt(ev: MouseEvent, host: HTMLElement) {
    const rect = host.getBoundingClientRect();
    const x = ev.clientX - rect.left;
    const y = ev.clientY - rect.top;

    const ripple = document.createElement("span");
    ripple.className = "ripple";
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    // color resolution based on data-color or body accent
    const dataColor = host.getAttribute("data-color");
    const accent =
      dataColor || document.body.getAttribute("data-accent") || "muted";
    const cssVar =
      getComputedStyle(document.body).getPropertyValue(`--accent-${accent}`) ||
      "";
    if (cssVar) ripple.style.background = cssVar.trim();

    // ensure host positioning
    const prev = getComputedStyle(host).position;
    if (prev === "static") host.style.position = "relative";

    host.appendChild(ripple);
    // force frame then activate
    requestAnimationFrame(() => ripple.classList.add("ripple-active"));
    setTimeout(() => {
      try {
        host.removeChild(ripple);
      } catch (e) {}
    }, 650);
  }

  private observeMutations() {
    try {
      this.observer = new MutationObserver((mutations) => {
        mutations.forEach((m) => {
          m.addedNodes.forEach((n) => {
            if (!(n instanceof Element)) return;
            // if node itself matches
            if (this.matchesSelector(n)) this.attach(n as HTMLElement);
            // and descendants
            this.selectors.forEach((s) => {
              const found = (n as Element).querySelectorAll(s);
              found.forEach((f) => this.attach(f as HTMLElement));
            });
          });
        });
      });
      this.observer.observe(document.body, { childList: true, subtree: true });
    } catch (e) {}
  }
}
