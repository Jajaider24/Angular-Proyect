import { ChangeDetectionStrategy, Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Issue } from "../../models/issue.model";
import { IssuesService } from "../../services/issues.service";

@Component({
  selector: "app-issues-detail",
  templateUrl: "./issues-detail.component.html",
  styleUrls: ["./issues-detail.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IssuesDetailComponent implements OnInit {
  issue?: Issue;
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private issuesService: IssuesService
  ) {}

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get("id")!;
    this.loading = true;
    this.issuesService.view(id).subscribe({
      next: (res) => {
        this.issue = res;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }
}
