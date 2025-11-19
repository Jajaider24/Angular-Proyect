import { Component, Input } from "@angular/core";

@Component({
  selector: "app-crud-form",
  template: `
    <form class="crud-form">
      <ng-content></ng-content>
    </form>
  `,
})
export class CrudFormComponent {
  @Input() model: any;
}
