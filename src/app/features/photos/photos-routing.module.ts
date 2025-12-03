import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { PhotosFormComponent } from "./photos-form.component";
import { PhotosListComponent } from "./photos-list.component";

const routes: Routes = [
  { path: "", component: PhotosListComponent },
  { path: "new", component: PhotosFormComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PhotosRoutingModule {}
