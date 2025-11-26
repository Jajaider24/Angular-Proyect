import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  Renderer2,
} from "@angular/core";

@Directive({
  selector: "[appRipple]",
})
export class RippleDirective {
  @Input("appRipple") rippleColor: string | null = null;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  private createRipple(event: MouseEvent) {
    const host: HTMLElement = this.el.nativeElement;
    const rect = host.getBoundingClientRect();
    // compute click coordinates relative to host
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const ripple = this.renderer.createElement("span");
    this.renderer.addClass(ripple, "ripple");
    // set position
    this.renderer.setStyle(ripple, "left", `${x}px`);
    this.renderer.setStyle(ripple, "top", `${y}px`);

    // color: prefer explicit input, else inherit data-color or body accent
    const explicit = this.rippleColor;
    let color = explicit;
    if (!color) {
      const dataColor = host.getAttribute("data-color");
      if (dataColor)
        color =
          getComputedStyle(document.body).getPropertyValue(
            `--accent-${dataColor}`
          ) || null;
      if (!color) color = document.body.getAttribute("data-accent") || null;
    }
    if (color) {
      // if color looks like a CSS var value (starts with # or rgb), use it; otherwise try var lookup
      if (/^#|^rgb|^var\(/.test(color.trim())) {
        this.renderer.setStyle(ripple, "background", color.trim());
      } else {
        // fallback: use CSS variable value
        const val =
          getComputedStyle(document.body).getPropertyValue(
            `--accent-${color}`
          ) || "";
        if (val) this.renderer.setStyle(ripple, "background", val.trim());
      }
    }

    this.renderer.appendChild(host, ripple);

    // trigger animation
    window.requestAnimationFrame(() => {
      this.renderer.addClass(ripple, "ripple-active");
    });

    // remove after animation
    setTimeout(() => {
      try {
        this.renderer.removeChild(host, ripple);
      } catch (e) {}
    }, 600);
  }

  @HostListener("mousedown", ["$event"])
  onMouseDown(event: MouseEvent) {
    // only left click
    if (event.button !== 0) return;
    this.createRipple(event);
  }
}
