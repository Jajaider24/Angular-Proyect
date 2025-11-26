# 🚀 COMANDOS ÚTILES PARA EL PROYECTO

## 📦 Instalación y Setup

```bash
# Instalar todas las dependencias
npm install

# Limpiar node_modules e instalar desde cero (si hay problemas)
npm run install:clean
```

## 🔧 Desarrollo

```bash
# Levantar servidor de desarrollo Angular (con proxy al backend)
npm start
# O explícito:
ng serve --proxy-config proxy.conf.json

# Acceder a la app
# http://localhost:4200
```

## 🏗️ Build

```bash
# Build de producción
npm run build
# O explícito:
ng build --configuration production

# Build de desarrollo
ng build
```

## 🧪 Testing

```bash
# Ejecutar tests unitarios
npm test
# O explícito:
ng test

# Ejecutar tests e2e
npm run e2e
# O explícito:
ng e2e
```

## 🔍 Linting

```bash
# Ejecutar linter
npm run lint
# O explícito:
ng lint
```

## 🎨 Generar Componentes (Angular CLI)

```bash
# Generar un nuevo módulo feature con routing
ng generate module features/ejemplo --routing

# Generar componente dentro de un módulo
ng generate component features/ejemplo/ejemplo-list

# Generar servicio
ng generate service core/services/ejemplo

# Generar modelo/interface
ng generate interface core/models/ejemplo model

# Generar guard
ng generate guard guards/ejemplo

# Generar interceptor
ng generate interceptor interceptors/ejemplo
```

## 📁 Estructura de Features (Patrón Establecido)

Para crear un nuevo módulo CRUD completo, seguir esta estructura:

```bash
# Ejemplo para crear módulo "Shifts"
ng generate module features/shifts --routing
ng generate component features/shifts/shifts
ng generate component features/shifts/shifts-list
ng generate component features/shifts/shifts-form
ng generate component features/shifts/shifts-detail
```

Luego copiar y adaptar desde `addresses`, `motorcycles` o `drivers`.

## 🗄️ Backend (ms_delivery-main)

```bash
# Navegar al backend
cd ms_delivery-main

# Crear entorno virtual Python (primera vez)
python -m venv venv

# Activar entorno virtual
# Windows:
.\venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar servidor Flask
python run.py

# El backend correrá en:
# http://localhost:5000
```

## 🔗 Proxy Configuration

El archivo `proxy.conf.json` ya está configurado para redirigir `/api` al backend:

```json
{
  "/api": {
    "target": "http://localhost:5000",
    "secure": false,
    "changeOrigin": true
  }
}
```

Esto permite que Angular en `http://localhost:4200` haga peticiones a `/api/restaurants` y el proxy las redirija a `http://localhost:5000/api/restaurants`.

## 🌐 Navegación en la App

Una vez levantado el servidor:

### Módulos Existentes (Originales):
- http://localhost:4200/dashboard
- http://localhost:4200/restaurants
- http://localhost:4200/products
- http://localhost:4200/menus
- http://localhost:4200/customers
- http://localhost:4200/orders
- http://localhost:4200/reports

### Módulos Nuevos (Creados):
- ✅ http://localhost:4200/addresses
- ✅ http://localhost:4200/motorcycles
- ✅ http://localhost:4200/drivers

### Módulos Pendientes:
- ⏳ http://localhost:4200/shifts
- ⏳ http://localhost:4200/issues
- ⏳ http://localhost:4200/photos

## 🐛 Debugging

```bash
# Ver errores de compilación en tiempo real
npm start

# Ver errores de linting
ng lint

# Verificar versiones
ng version

# Limpiar cache de Angular
ng cache clean
```

## 📊 Verificar Estructura del Proyecto

```bash
# Ver árbol de directorios (PowerShell)
tree /f src/app/features

# Ver solo carpetas
tree /a src/app/features

# Buscar archivos específicos
dir /s /b *.module.ts
```

## 🔄 Git Commands (Control de Versiones)

```bash
# Ver estado actual
git status

# Ver cambios en archivos
git diff

# Agregar todos los cambios
git add .

# Commit con mensaje
git commit -m "feat: Agregar CRUDs de Addresses, Motorcycles y Drivers"

# Push a GitHub
git push origin main

# Ver historial de commits
git log --oneline

# Crear nueva rama para feature
git checkout -b feature/shifts-module
```

## 🔍 Buscar en el Código

```bash
# Buscar un string en todos los archivos (PowerShell)
Select-String -Path "src\**\*.ts" -Pattern "DriversService"

# Buscar archivos por nombre
Get-ChildItem -Path src -Recurse -Filter "*drivers*"
```

## 📦 Actualizar Dependencias

```bash
# Ver dependencias desactualizadas
npm outdated

# Actualizar todas las dependencias (cuidado en producción)
npm update

# Actualizar una dependencia específica
npm install lucide-angular@latest

# Verificar vulnerabilidades
npm audit

# Corregir vulnerabilidades automáticamente
npm audit fix
```

## 🎨 Customización de Estilos

Los estilos globales están en:
- `src/styles.scss` - Estilos globales
- `src/assets/scss/` - Variables y mixins de Argon Dashboard

Para modificar colores principales, editar variables en `src/assets/scss/argon-dashboard/custom/_variables.scss`.

## 🔐 Autenticación (Firebase - OAuth)

El proyecto ya tiene configurado:
- `firebaseConfig.js` - Configuración de Firebase
- `firebase-auth.service.ts` - Servicio de autenticación
- Guards de autenticación

Para probar autenticación:
1. Asegúrate de tener configurado Firebase en `firebaseConfig.js`
2. Navega a http://localhost:4200/login
3. Usa OAuth con Google, Microsoft o GitHub

## 📚 Recursos de Documentación

- Angular: https://angular.io/docs
- Reactive Forms: https://angular.io/guide/reactive-forms
- RxJS: https://rxjs.dev/
- Argon Dashboard: https://www.creative-tim.com/product/argon-dashboard-angular
- Bootstrap 4: https://getbootstrap.com/docs/4.6/

## 💡 Tips

1. **Hot Reload:** Angular CLI detecta cambios automáticamente, no necesitas reiniciar el servidor
2. **Errores de Compilación:** Si hay errores, revisa la terminal donde corre `npm start`
3. **Errores de Console:** Abre DevTools (F12) en el navegador para ver errores JS
4. **Network Tab:** Usa la pestaña Network en DevTools para ver peticiones HTTP y sus respuestas
5. **Angular DevTools:** Instala la extensión de Chrome "Angular DevTools" para debugging avanzado

## 🆘 Solución de Problemas Comunes

### Error: "Cannot find module"
```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### Error: "Port 4200 is already in use"
```bash
# Matar proceso en puerto 4200
# Windows:
netstat -ano | findstr :4200
taskkill /PID [PID_NUMBER] /F

# Linux/Mac:
lsof -ti:4200 | xargs kill -9
```

### Error: Lazy loading no funciona
Verificar que el módulo:
1. Tenga `@NgModule` correctamente configurado
2. Tenga routing module con `RouterModule.forChild()`
3. Esté importado en `admin-layout.routing.ts` con `loadChildren`

### Error: Formulario no valida
Verificar:
1. Que el FormGroup esté inicializado en `ngOnInit()`
2. Que los `formControlName` coincidan con los del FormGroup
3. Que el template use `[formGroup]="form"`

---

¡Proyecto Angular 14 con CRUDs completos listo para desarrollo! 🚀
