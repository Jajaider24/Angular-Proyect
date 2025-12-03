import { ChangeDetectionStrategy, Component, OnInit } from "@angular/core";
import { Issue } from "../../models/issue.model";
import { IssuesService } from "../../services/issues.service";

@Component({
  selector: "app-issues-list",
  templateUrl: "./issues-list.component.html",
  styleUrls: ["./issues-list.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IssuesListComponent implements OnInit {
  issues: Issue[] = [];
  loading = false;

  constructor(private issuesService: IssuesService) {}

  ngOnInit(): void {
    this.loading = true;
    this.issuesService.list().subscribe({
      next: (res) => {
        this.issues = res;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }
}
