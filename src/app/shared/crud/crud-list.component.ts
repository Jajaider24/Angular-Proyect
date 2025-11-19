import { Component, Input } from "@angular/core";

@Component({
  selector: "app-crud-list",
  template: `
    <div class="crud-list">
      <h3>{{ title }}</h3>
      <ng-content></ng-content>
    </div>
  `,
})
export class CrudListComponent {
  @Input() title = "Lista";
}
