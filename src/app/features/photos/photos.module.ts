import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { SharedModule } from "src/app/shared/shared.module";
import { PhotosFormComponent } from "./photos-form.component";
import { PhotosListComponent } from "./photos-list.component";
import { PhotosRoutingModule } from "./photos-routing.module";

@NgModule({
  declarations: [PhotosListComponent, PhotosFormComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    SharedModule,
    PhotosRoutingModule,
  ],
})
export class PhotosModule {}
