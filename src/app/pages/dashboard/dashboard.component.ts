import { Component, OnInit } from "@angular/core";
import Chart from "chart.js";

// core components
import {
  chartExample1,
  chartExample2,
  chartOptions,
  parseOptions,
} from "../../variables/charts";

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
})
export class DashboardComponent implements OnInit {
  public datasets: any;
  public data: any;
  public salesChart;
  public clicked: boolean = true;
  public clicked1: boolean = false;

  ngOnInit() {
    this.datasets = [
      [0, 20, 10, 30, 15, 40, 20, 60, 60],
      [0, 20, 5, 25, 10, 30, 15, 40, 40],
    ];
    this.data = this.datasets[0];

    const chartOrders = document.getElementById(
      "chart-orders"
    ) as HTMLCanvasElement | null;

    parseOptions(Chart, chartOptions());

    if (chartOrders) {
      try {
        // create orders chart only if canvas element exists
        const ordersChart = new Chart(chartOrders, {
          type: "bar",
          options: chartExample2.options,
          data: chartExample2.data,
        });
      } catch (e) {
        console.warn("Could not create orders chart", e);
      }
    } else {
      console.warn(
        "Dashboard: '#chart-orders' element not found - skipping orders chart initialization."
      );
    }

    const chartSales = document.getElementById(
      "chart-sales"
    ) as HTMLCanvasElement | null;
    if (chartSales) {
      try {
        this.salesChart = new Chart(chartSales, {
          type: "line",
          options: chartExample1.options,
          data: chartExample1.data,
        });
      } catch (e) {
        console.warn("Could not create sales chart", e);
      }
    } else {
      console.warn(
        "Dashboard: '#chart-sales' element not found - skipping sales chart initialization."
      );
    }
  }

  public updateOptions() {
    this.salesChart.data.datasets[0].data = this.data;
    this.salesChart.update();
  }
}
