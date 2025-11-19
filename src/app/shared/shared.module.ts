import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CrudListComponent } from './crud/crud-list.component';
import { CrudDetailComponent } from './crud/crud-detail.component';
import { CrudFormComponent } from './crud/crud-form.component';

@NgModule({
  declarations: [CrudListComponent, CrudDetailComponent, CrudFormComponent],
  imports: [CommonModule, FormsModule],
  exports: [CrudListComponent, CrudDetailComponent, CrudFormComponent, CommonModule, FormsModule],
})
export class SharedModule {}
