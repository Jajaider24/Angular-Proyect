import { ChangeDetectionStrategy, Component, OnInit } from "@angular/core";
import { Photo } from "../../models/photo.model";
import { PhotosService } from "../../services/photos.service";

@Component({
  selector: "app-photos-list",
  templateUrl: "./photos-list.component.html",
  styleUrls: ["./photos-list.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PhotosListComponent implements OnInit {
  photos: Photo[] = [];
  loading = false;

  constructor(private photosService: PhotosService) {}

  ngOnInit(): void {
    this.loading = true;
    this.photosService.list().subscribe({
      next: (res) => {
        this.photos = res;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }
}
