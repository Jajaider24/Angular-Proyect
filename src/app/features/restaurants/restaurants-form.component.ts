import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RestaurantsService } from 'src/app/core/services/restaurants.service';
import { Restaurant } from 'src/app/core/models';

@Component({
  selector: 'app-restaurants-form',
  templateUrl: './restaurants-form.component.html',
  styleUrls: ['./restaurants-form.component.scss']
})
export class RestaurantsFormComponent implements OnInit {
  form: FormGroup;
  loading = false;
  isEdit = false;
  id?: number;

  constructor(
    private fb: FormBuilder,
    private svc: RestaurantsService,
    private router: Router,
    private route: ActivatedRoute
  ){
    this.form = this.fb.group({
      name: ['', Validators.required],
      phone: [''],
      address: this.fb.group({ street: [''], city: [''] })
    });
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEdit = true;
      this.id = Number(idParam);
      this.load(this.id);
    }
  }

  load(id: number) {
    this.loading = true;
    this.svc.get(id).subscribe({
      next: (r) => this.form.patchValue(r as Partial<Restaurant>),
      error: () => (this.loading = false),
      complete: () => (this.loading = false),
    });
  }

  save() {
    if (this.form.invalid) return;
    const payload = this.form.value;
    this.loading = true;
    const obs = this.isEdit && this.id ? this.svc.update(this.id, payload) : this.svc.create(payload);
    obs.subscribe({
      next: () => this.router.navigate(['/restaurants']),
      error: () => (this.loading = false),
      complete: () => (this.loading = false),
    });
  }

  cancel() {
    this.router.navigate(['/restaurants']);
  }
}
