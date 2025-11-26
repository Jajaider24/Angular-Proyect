import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

const BASE = "https://5a884cb5-e59f-468f-a44f-0043cc65b717.mock.pstmn.io";

@Injectable()
export class ReportsService {
  constructor(private http: HttpClient) {}

  // Pie charts
  getPie1(): Observable<any> {
    return this.http.get(`${BASE}/pie1`);
  }
  getPie2(): Observable<any> {
    return this.http.get(`${BASE}/pie2`);
  }
  getPie3(): Observable<any> {
    return this.http.get(`${BASE}/pie3`);
  }

  // Bar charts
  getBar1(): Observable<any> {
    return this.http.get(`${BASE}/bar1`);
  }
  getBar2(): Observable<any> {
    return this.http.get(`${BASE}/bar2`);
  }
  getBar3(): Observable<any> {
    return this.http.get(`${BASE}/bar3`);
  }

  // Time series
  getTime1(): Observable<any> {
    return this.http.get(`${BASE}/time1`);
  }
  getTime2(): Observable<any> {
    return this.http.get(`${BASE}/time2`);
  }
  getTime3(): Observable<any> {
    return this.http.get(`${BASE}/time3`);
  }

  // Aggregated endpoints (alternative structure)
  getPieCharts(): Observable<any> {
    return this.http.get(`${BASE}/charts/pie`);
  }

  getBarCharts(): Observable<any> {
    return this.http.get(`${BASE}/charts/bar`);
  }

  getTimeSeries(): Observable<any> {
    return this.http.get(`${BASE}/charts/timeseries`);
  }
}
