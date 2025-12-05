import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule } from "@angular/forms";
import { SharedModule } from "src/app/shared/shared.module";
import { IssuesRoutingModule } from "./issues-routing.module";
import { IssuesListComponent } from "./issues-list.component";
import { IssuesDetailComponent } from "./issues-detail.component";
import { IssuesFormComponent } from "./issues-form.component";

@NgModule({
  declarations: [IssuesListComponent, IssuesDetailComponent, IssuesFormComponent],
  imports: [CommonModule, ReactiveFormsModule, SharedModule, IssuesRoutingModule],
})
export class IssuesModule {}
