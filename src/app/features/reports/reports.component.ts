import {
  AfterViewInit,
  Component,
  ElementRef,
  QueryList,
  ViewChildren,
} from "@angular/core";
import * as Chart from "chart.js";
import { forkJoin, of } from "rxjs";
import { catchError } from "rxjs/operators";
import { ReportsService } from "./reports.service";

@Component({
  selector: "app-reports",
  templateUrl: "./reports.component.html",
  styleUrls: ["./reports.component.scss"],
})
export class ReportsComponent implements AfterViewInit {
  @ViewChildren("chart") charts!: QueryList<ElementRef<HTMLCanvasElement>>;

  constructor(private reportsService: ReportsService) {}

  ngAfterViewInit(): void {
    // Wait a tick for canvases to render, then fetch data and draw
    setTimeout(() => this.loadAndRender(), 50);
  }

  private loadAndRender() {
    const nodes = this.charts.toArray();
    if (!nodes.length) return;

    // Prefer aggregated endpoints if available: /charts/pie, /charts/bar, /charts/timeseries
    forkJoin({
      pies: this.reportsService.getPieCharts().pipe(catchError(() => of(null))),
      bars: this.reportsService.getBarCharts().pipe(catchError(() => of(null))),
      times: this.reportsService
        .getTimeSeries()
        .pipe(catchError(() => of(null))),
    }).subscribe((res) => {
      // If aggregated responses are provided, try to split them into up to 3 charts each.
      const piesPayload = res.pies;
      const barsPayload = res.bars;
      const timesPayload = res.times;

      // Helper to extract up to N chart items from a payload. Accepts different shapes.
      const extractMany = (payload: any, max = 3) => {
        if (!payload) return [];
        // If server returns an array of charts
        if (Array.isArray(payload)) return payload.slice(0, max);
        // If named keys (object) with chart-like values
        const candidates = Object.keys(payload)
          .map((k) => ({ key: k, val: payload[k] }))
          .filter((x) => x.val != null)
          .slice(0, max)
          .map((x) => x.val);
        if (candidates.length) return candidates;
        // If payload contains specific containers
        if (payload.charts && Array.isArray(payload.charts))
          return payload.charts.slice(0, max);
        // fallback to nulls
        return [];
      };

      const pieItems = extractMany(piesPayload, 3);
      const barItems = extractMany(barsPayload, 3);
      const timeItems = extractMany(timesPayload, 3);

      // Render pies (fallback to individual endpoints if aggregated payload missing)
      if (pieItems.length) {
        for (let i = 0; i < 3; i++) {
          const item = pieItems[i] || null;
          const p = this.mapToLabelsAndData(item) || {
            labels: ["N/A"],
            data: [1],
          };
          this.createPie(
            nodes[i].nativeElement,
            `Pie ${i + 1}`,
            p.labels,
            p.data
          );
        }
      } else {
        // fallback to the original per-endpoint calls
        forkJoin({
          p1: this.reportsService.getPie1().pipe(catchError(() => of(null))),
          p2: this.reportsService.getPie2().pipe(catchError(() => of(null))),
          p3: this.reportsService.getPie3().pipe(catchError(() => of(null))),
        }).subscribe((pRes) => {
          const p1 = this.mapToLabelsAndData(pRes.p1) || {
            labels: ["N/A"],
            data: [1],
          };
          const p2 = this.mapToLabelsAndData(pRes.p2) || {
            labels: ["N/A"],
            data: [1],
          };
          const p3 = this.mapToLabelsAndData(pRes.p3) || {
            labels: ["N/A"],
            data: [1],
          };
          this.createPie(nodes[0].nativeElement, "Pie 1", p1.labels, p1.data);
          this.createPie(nodes[1].nativeElement, "Pie 2", p2.labels, p2.data);
          this.createPie(nodes[2].nativeElement, "Pie 3", p3.labels, p3.data);
        });
      }

      // Render bars
      if (barItems.length) {
        for (let i = 0; i < 3; i++) {
          const item = barItems[i] || null;
          const b = this.mapToLabelsAndData(item) || {
            labels: ["N/A"],
            data: [1],
          };
          this.createBar(
            nodes[3 + i].nativeElement,
            `Bar ${i + 1}`,
            b.labels,
            b.data
          );
        }
      } else {
        forkJoin({
          b1: this.reportsService.getBar1().pipe(catchError(() => of(null))),
          b2: this.reportsService.getBar2().pipe(catchError(() => of(null))),
          b3: this.reportsService.getBar3().pipe(catchError(() => of(null))),
        }).subscribe((bRes) => {
          const b1 = this.mapToLabelsAndData(bRes.b1) || {
            labels: ["N/A"],
            data: [1],
          };
          const b2 = this.mapToLabelsAndData(bRes.b2) || {
            labels: ["N/A"],
            data: [1],
          };
          const b3 = this.mapToLabelsAndData(bRes.b3) || {
            labels: ["N/A"],
            data: [1],
          };
          this.createBar(nodes[3].nativeElement, "Bar 1", b1.labels, b1.data);
          this.createBar(nodes[4].nativeElement, "Bar 2", b2.labels, b2.data);
          this.createBar(nodes[5].nativeElement, "Bar 3", b3.labels, b3.data);
        });
      }

      // Render timeseries
      if (timeItems.length) {
        for (let i = 0; i < 3; i++) {
          const item = timeItems[i] || null;
          const t = this.mapToTimeSeries(item) || {
            labels: this.generateLastNDays(30),
            data: this.randomSeries(30, 1, 5),
          };
          this.createLine(
            nodes[6 + i].nativeElement,
            `Time ${i + 1}`,
            t.labels,
            t.data
          );
        }
      } else {
        forkJoin({
          t1: this.reportsService.getTime1().pipe(catchError(() => of(null))),
          t2: this.reportsService.getTime2().pipe(catchError(() => of(null))),
          t3: this.reportsService.getTime3().pipe(catchError(() => of(null))),
        }).subscribe((tRes) => {
          const t1 = this.mapToTimeSeries(tRes.t1) || {
            labels: this.generateLastNDays(30),
            data: this.randomSeries(30, 1, 5),
          };
          const t2 = this.mapToTimeSeries(tRes.t2) || {
            labels: this.generateLastNDays(30),
            data: this.randomSeries(30, 1, 5),
          };
          const t3 = this.mapToTimeSeries(tRes.t3) || {
            labels: this.generateLastNDays(30),
            data: this.randomSeries(30, 1, 5),
          };
          this.createLine(nodes[6].nativeElement, "Time 1", t1.labels, t1.data);
          this.createLine(nodes[7].nativeElement, "Time 2", t2.labels, t2.data);
          this.createLine(nodes[8].nativeElement, "Time 3", t3.labels, t3.data);
        });
      }
    });
  }

  private mapToLabelsAndData(
    payload: any
  ): { labels: string[]; data: number[] } | null {
    if (!payload) return null;
    // Common expected formats:
    // { labels: [...], data: [...] }
    // { categories: [...], values: [...] }
    // { items: [{label, value}, ...] }
    if (Array.isArray(payload.labels) && Array.isArray(payload.data)) {
      return { labels: payload.labels, data: payload.data };
    }
    if (Array.isArray(payload.categories) && Array.isArray(payload.values)) {
      return { labels: payload.categories, data: payload.values };
    }
    if (Array.isArray(payload.items)) {
      const labels = payload.items.map(
        (i: any) => i.label ?? i.name ?? String(i)
      );
      const data = payload.items.map((i: any) =>
        Number(i.value ?? i.count ?? 0)
      );
      return { labels, data };
    }
    // If payload is a plain object with numeric values
    if (typeof payload === "object") {
      const keys = Object.keys(payload).filter(
        (k) => typeof payload[k] === "number"
      );
      if (keys.length) {
        return { labels: keys, data: keys.map((k) => Number(payload[k])) };
      }
    }
    return null;
  }

  private mapToTimeSeries(
    payload: any
  ): { labels: string[]; data: number[] } | null {
    if (!payload) return null;
    // Expected formats:
    // { labels: [...], values: [...] }
    // { series: [{date, value}, ...] }
    if (Array.isArray(payload.labels) && Array.isArray(payload.values)) {
      return {
        labels: payload.labels,
        data: payload.values.map((v: any) => Number(v)),
      };
    }
    if (Array.isArray(payload.series)) {
      const labels = payload.series.map((s: any) => s.date ?? s.label ?? "");
      const data = payload.series.map((s: any) => Number(s.value ?? s.y ?? 0));
      return { labels, data };
    }
    if (Array.isArray(payload.data) && Array.isArray(payload.data[0])) {
      // maybe [ [label, value], ... ]
      const labels = payload.data.map((d: any) => String(d[0]));
      const data = payload.data.map((d: any) => Number(d[1]));
      return { labels, data };
    }
    return null;
  }

  private createPie(
    canvas: HTMLCanvasElement,
    title: string,
    labels: string[],
    data: number[]
  ) {
    const colors = this.generatePalette(labels.length);
    new Chart(canvas, {
      type: "pie",
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: colors,
            borderColor: "#ffffff",
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        title: { display: true, text: title },
        legend: { display: true, position: "bottom" },
        tooltips: {
          callbacks: {
            label: function (tooltipItem: any, d: any) {
              const v = d.datasets[0].data[tooltipItem.index];
              const l = d.labels[tooltipItem.index];
              return `${l}: ${v}`;
            },
          },
        },
      },
    });
  }

  private createBar(
    canvas: HTMLCanvasElement,
    title: string,
    labels: string[],
    data: number[]
  ) {
    const colors = this.generatePalette(labels.length);
    const bg = labels.map((_, i) => colors[i % colors.length]);
    new Chart(canvas, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: title,
            data,
            backgroundColor: bg,
            borderColor: bg.map((c) => this.shadeColor(c, -10)),
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        legend: { display: false },
        scales: {
          xAxes: [
            {
              gridLines: { display: false },
              ticks: { autoSkip: false, maxRotation: 45, minRotation: 0 },
            },
          ],
          yAxes: [
            {
              ticks: { beginAtZero: true },
              gridLines: { color: "rgba(0,0,0,0.03)" },
            },
          ],
        },
        tooltips: { mode: "index", intersect: false },
      },
    });
  }

  private createLine(
    canvas: HTMLCanvasElement,
    title: string,
    labels: string[],
    data: number[]
  ) {
    const colors = this.generatePalette(3);
    new Chart(canvas, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: title,
            data,
            fill: false,
            borderColor: colors[0],
            backgroundColor: this.rgba(colors[0], 0.08),
            pointRadius: 3,
            lineTension: 0.18,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          xAxes: [{ gridLines: { display: false } }],
          yAxes: [
            {
              gridLines: { color: "rgba(0,0,0,0.03)" },
              ticks: { beginAtZero: true },
            },
          ],
        },
        tooltips: { mode: "index", intersect: false },
      },
    });
  }

  // Generate a palette of distinct colors, repeating when necessary
  private generatePalette(n: number) {
    const base = [
      "#5e72e4",
      "#11cdef",
      "#f5365c",
      "#2dce89",
      "#fb6340",
      "#ffd166",
      "#9b59b6",
      "#4b5563",
    ];
    const out: string[] = [];
    for (let i = 0; i < n; i++) out.push(base[i % base.length]);
    return out;
  }

  // Helper to produce rgba from hex
  private rgba(hex: string, a = 1) {
    const c = hex.replace("#", "");
    const bigint = parseInt(c, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }

  // Slightly darken or lighten a hex color by percent (-100..100)
  private shadeColor(hex: string, percent: number) {
    const c = hex.replace("#", "");
    const num = parseInt(c, 16);
    let r = (num >> 16) + Math.round(255 * (percent / 100));
    let g = ((num >> 8) & 0x00ff) + Math.round(255 * (percent / 100));
    let b = (num & 0x0000ff) + Math.round(255 * (percent / 100));
    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));
    return "#" + ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0");
  }

  private generateLastNDays(n: number) {
    const arr: string[] = [];
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      arr.push(`${d.getMonth() + 1}/${d.getDate()}`);
    }
    return arr;
  }

  private randomSeries(n: number, min: number, max: number) {
    const a: number[] = [];
    for (let i = 0; i < n; i++)
      a.push(Math.round(min + Math.random() * (max - min)));
    return a;
  }
}
