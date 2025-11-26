import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { ReportsRoutingModule } from "./reports-routing.module";
import { ReportsComponent } from "./reports.component";
import { ReportsService } from "./reports.service";


@NgModule({
  declarations: [ReportsComponent],
  imports: [CommonModule, HttpClientModule, ReportsRoutingModule],
  providers: [ReportsService],
})
export class ReportsModule {}
