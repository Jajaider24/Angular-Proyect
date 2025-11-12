import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Theater } from 'src/app/models/theater.model';
import { TheaterService } from 'src/app/services/theater.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.scss']
})
export class ManageComponent implements OnInit {
  mode: number; // 1: view, 2: create, 3: update
  theater: Theater;
  theFormGroup: FormGroup; // Policía de formulario
  trySend: boolean;
  constructor(private activatedRoute: ActivatedRoute,
    private theatersService: TheaterService,
    private router: Router,
    private theFormBuilder: FormBuilder //Definir las reglas
  ) {
    this.trySend = false;
    this.theater = { id: 0 };
    this.configFormGroup()
  }

  ngOnInit(): void { // Definir el modo según la URL
    const currentUrl = this.activatedRoute.snapshot.url.join('/'); //Tomar una foto a la ruta, un split por slash/ y unirlo en un string
    if (currentUrl.includes('view')) {
      this.mode = 1;  // Modo de visualización 
    } else if (currentUrl.includes('create')) {
      this.mode = 2;  // Modo de creación
    } else if (currentUrl.includes('update')) {
      this.mode = 3;  // Modo de actualización
    }
    if (this.activatedRoute.snapshot.params.id) {  // Si hay un id en la ruta, obtener el teatro correspondiente a ese id 
      this.theater.id = this.activatedRoute.snapshot.params.id  //Tomar una foto a la ruta y obtener el parámetro id 
      this.getTheater(this.theater.id)  // Llamar al método para obtener el teatro 
    }

  }

  configFormGroup() {                                 // Definir las reglas del formulario
    this.theFormGroup = this.theFormBuilder.group({
      // primer elemento del vector, valor por defecto
      //Segundo elemento del vector, validaciones que se aplicarán a ese
      //Tercer elemento del vector, si hay más de una validación en la lista, serán las reglas
      id: [0,[]],
      capacity: [0, [Validators.required, Validators.min(1), Validators.max(100)]], // Capacidad requerida entre 1 y 100 
      location: ['', [Validators.required, Validators.minLength(2)]]  // Ubicación requerida con longitud mínima de 2 caracteres
    })
  }


  get getTheFormGroup() {              // Obtener los controles del formulario para facilitar el acceso en la plantilla
    return this.theFormGroup.controls  // Retornar los controles del formulario
  }

  getTheater(id: number) {  // Obtener el teatro por id, buscando en el servicio del backend
    this.theatersService.view(id).subscribe({ // Llamar al servicio para obtener el teatro 4.2
      next: (response) => {  // Manejar la respuesta exitosa del servicio 
        this.theater = response;  // Asignar la respuesta al objeto theater
         // Actualizar los valores del formulario con los datos del teatro obtenido

        this.theFormGroup.patchValue({  // Actualizar los valores del formulario (Provee informacion en las cajas de texto)
          id: this.theater.id,  // Asignar el id del teatro al formulario 
          capacity: this.theater.capacity,  // Asignar la capacidad del teatro al formulario
          location: this.theater.location  // Asignar la ubicación del teatro al formulario 
        });
        
        console.log('Theater fetched successfully:', this.theater);  // Imprimir en consola el teatro obtenido 
      },
      error: (error) => {
        console.error('Error fetching theater:', error);
      }
    });
  }
  back() {
    this.router.navigate(['/theaters/list']);
  }

  create() {                          // Método para crear un nuevo teatro
    this.trySend = true;              // Indicar que se ha intentado enviar el formulario 
    if (this.theFormGroup.invalid) {  // Verificar si el formulario es inválido 
      Swal.fire({
        title: 'Error!',
        text: 'Por favor, complete todos los campos requeridos.',  // Mensaje de error si el formulario es inválido
        icon: 'error',
      })
      return;  // Salir del método si el formulario es inválido
    }
    this.theatersService.create(this.theFormGroup.value).subscribe({  // Llamar al servicio para crear el teatro con los valores del formulario
      next: (theater) => {
        console.log('Theater created successfully:', theater);
        Swal.fire({
          title: 'Creado!',
          text: 'Registro creado correctamente.',
          icon: 'success',
        })
        this.router.navigate(['/theaters/list']);  // Navegar de vuelta a la lista de teatros después de la creación exitosa
      },
      error: (error) => {
        console.error('Error creating theater:', error);
      }
    });
  }
  update() {
    this.trySend = true;
    if (this.theFormGroup.invalid) {
      Swal.fire({
        title: 'Error!',
        text: 'Por favor, complete todos los campos requeridos.',
        icon: 'error',
      })
      return;
    }
    this.theatersService.update(this.theFormGroup.value).subscribe({  
      next: (theater) => {
        console.log('Theater updated successfully:', theater);
        Swal.fire({
          title: 'Actualizado!',
          text: 'Registro actualizado correctamente.',
          icon: 'success',
        })
        this.router.navigate(['/theaters/list']);
      },
      error: (error) => {
        console.error('Error updating theater:', error);
      }
    });
  }

}
