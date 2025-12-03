import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { SharedModule } from "src/app/shared/shared.module";
import { IssuesDetailComponent } from "./issues-detail.component";
import { IssuesFormComponent } from "./issues-form.component";
import { IssuesListComponent } from "./issues-list.component";
import { IssuesRoutingModule } from "./issues-routing.module";

@NgModule({
  declarations: [
    IssuesListComponent,
    IssuesFormComponent,
    IssuesDetailComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    SharedModule,
    IssuesRoutingModule,
  ],
})
export class IssuesModule {}
