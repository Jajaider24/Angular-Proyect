import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { IssuesDetailComponent } from "./issues-detail.component";
import { IssuesFormComponent } from "./issues-form.component";
import { IssuesListComponent } from "./issues-list.component";

const routes: Routes = [
  { path: "", component: IssuesListComponent },
  { path: "new", component: IssuesFormComponent },
  { path: ":id", component: IssuesDetailComponent },
  { path: ":id/edit", component: IssuesFormComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class IssuesRoutingModule {}
