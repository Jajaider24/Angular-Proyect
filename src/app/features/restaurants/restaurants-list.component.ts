import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RestaurantsService } from 'src/app/core/services/restaurants.service';
import { Restaurant } from 'src/app/core/models';

@Component({
  selector: 'app-restaurants-list',
  templateUrl: './restaurants-list.component.html',
  styleUrls: ['./restaurants-list.component.scss']
})
export class RestaurantsListComponent implements OnInit {
  restaurants: Restaurant[] = [];
  loading = false;

  constructor(private svc: RestaurantsService, private router: Router) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.svc.list().subscribe({
      next: (r) => (this.restaurants = r),
      error: () => (this.loading = false),
      complete: () => (this.loading = false),
    });
  }

  view(id: number) {
    this.router.navigate([`/restaurants/${id}`]);
  }

  edit(id: number) {
    this.router.navigate([`/restaurants/${id}/edit`]);
  }

  create() {
    this.router.navigate(['/restaurants/create']);
  }
}
