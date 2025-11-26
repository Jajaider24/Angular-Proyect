import {
  AfterViewInit,
  Component,
  ElementRef,
  QueryList,
  ViewChildren,
} from "@angular/core";
import * as Chart from "chart.js";

@Component({
  selector: "app-reports",
  templateUrl: "./reports.component.html",
  styleUrls: ["./reports.component.scss"],
})
export class ReportsComponent implements AfterViewInit {
  @ViewChildren("chart") charts!: QueryList<ElementRef<HTMLCanvasElement>>;

  ngAfterViewInit(): void {
    // Give the view a moment to render canvases
    setTimeout(() => this.renderCharts(), 50);
  }

  private renderCharts() {
    const nodes = this.charts.toArray();
    if (!nodes.length) return;

    // 0-2: pie charts
    this.createPie(
      nodes[0].nativeElement,
      "Order Status",
      ["Delivered", "In Transit", "Cancelled"],
      [68, 20, 12]
    );
    this.createPie(
      nodes[1].nativeElement,
      "Payment Methods",
      ["Cash", "Card", "Mobile"],
      [55, 35, 10]
    );
    this.createPie(
      nodes[2].nativeElement,
      "Delivery Zones",
      ["North", "Center", "South"],
      [40, 35, 25]
    );

    // 3-5: bar charts
    this.createBar(
      nodes[3].nativeElement,
      "Orders by Restaurant",
      ["La Casa", "Don Pepe", "Sushi Bar", "Pizzeria", "Thai Place", "Burger"],
      [120, 98, 76, 64, 55, 42]
    );
    this.createBar(
      nodes[4].nativeElement,
      "Top Products Sold",
      ["Pizza", "Burger", "Sushi", "Empanada", "Taco", "Salad"],
      [320, 290, 180, 160, 140, 110]
    );
    this.createBar(
      nodes[5].nativeElement,
      "Deliveries per Driver (Last Week)",
      ["Driver A", "Driver B", "Driver C", "Driver D", "Driver E"],
      [34, 28, 25, 20, 18]
    );

    // 6-8: time series (line charts)
    const days = this.generateLastNDays(30);
    const orders = this.randomSeries(30, 50, 120);
    const revenue = this.randomSeries(30, 800, 4200);
    const avgTime = this.randomSeries(30, 20, 45);
    this.createLine(nodes[6].nativeElement, "Daily Orders", days, orders);
    this.createLine(nodes[7].nativeElement, "Daily Revenue ($)", days, revenue);
    this.createLine(
      nodes[8].nativeElement,
      "Avg Delivery Time (min)",
      days,
      avgTime
    );
  }

  private createPie(
    canvas: HTMLCanvasElement,
    title: string,
    labels: string[],
    data: number[]
  ) {
    new Chart(canvas, {
      type: "pie",
      data: {
        labels,
        datasets: [
          { data, backgroundColor: ["#5e72e4", "#11cdef", "#f5365c"] },
        ],
      },
      options: { responsive: true, title: { display: true, text: title } },
    });
  }

  private createBar(
    canvas: HTMLCanvasElement,
    title: string,
    labels: string[],
    data: number[]
  ) {
    new Chart(canvas, {
      type: "bar",
      data: {
        labels,
        datasets: [{ label: title, data, backgroundColor: "#fb6340" }],
      },
      options: { responsive: true, legend: { display: false } },
    });
  }

  private createLine(
    canvas: HTMLCanvasElement,
    title: string,
    labels: string[],
    data: number[]
  ) {
    new Chart(canvas, {
      type: "line",
      data: {
        labels,
        datasets: [{ label: title, data, fill: false, borderColor: "#5e72e4" }],
      },
      options: { responsive: true },
    });
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
