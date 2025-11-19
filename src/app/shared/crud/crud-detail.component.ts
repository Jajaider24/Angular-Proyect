import { Component } from "@angular/core";

@Component({
  selector: "app-crud-detail",
  template: `
    <div class="crud-detail">
      <ng-content></ng-content>
    </div>
  `,
})
export class CrudDetailComponent {}
