import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { PhotosDetailComponent } from "./photos-detail.component";
import { PhotosFormComponent } from "./photos-form.component";
import { PhotosListComponent } from "./photos-list.component";

const routes: Routes = [
  { path: "", component: PhotosListComponent },
  { path: "new", component: PhotosFormComponent },
  { path: ":id", component: PhotosDetailComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PhotosRoutingModule {}
