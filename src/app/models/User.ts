export class User {
  id?: number;
  name?: string;
  email: string;
  password: string;
  token?: string;
  // URL pública de la foto de perfil (opcional). Usada por el navbar cuando el usuario inicia sesión con proveedores sociales.
  photoURL?: string;
}
