import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";

import { ClipboardModule } from "ngx-clipboard";

import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { DashboardComponent } from "../../pages/dashboard/dashboard.component";
import { AdminLayoutRoutes } from "./admin-layout.routing";
// import { ToastrModule } from 'ngx-toastr';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(AdminLayoutRoutes),
    FormsModule,
    HttpClientModule,
    NgbModule,
    ClipboardModule,
  ],
  declarations: [DashboardComponent],
})
export class AdminLayoutModule {}
