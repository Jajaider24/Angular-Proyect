# Guía integral: Mapa interactivo de Pedidos (Angular + Flask-Socket.IO)

Esta guía documenta, paso a paso y en español, cómo preparar el módulo de Pedidos y cómo integrar un mapa interactivo en tiempo real usando Socket.IO, desde los ajustes previos hasta la verificación final en producción de desarrollo.

La guía está pensada para Angular 14 con NgModules, lazy loading y un backend Flask ya existente con `Flask-SocketIO`.

---

## Objetivo
- Visualizar en tiempo real la posición de las motocicletas asociadas a pedidos.
- Permitir iniciar/detener el tracking por placa.
- Ofrecer un flujo natural desde la lista de pedidos (botón "Rastrear") hacia una vista de mapa dedicada (`/orders/map`).

## Prerrequisitos
- Backend Flask en `ms_delivery` con Socket.IO habilitado.
- Frontend Angular en `Angular-Proyect` con `ngx-socket-io` y `@angular/google-maps` instalados.
- Rutas y servicios de `orders`, `motorcycles` funcionando.

### Backend (requisitos clave)
1. Flask-SocketIO debe servir el endpoint `/socket.io`.
   - Recomendado: arrancar con `socketio.run(app)` (en lugar de `app.run`).
   - Si no se puede modificar `run.py`, usa un runner alternativo que invoque `socketio.run`.
2. Endpoints:
   - `POST /motorcycles/track/<plate>` → inicia la emisión periódica de `{ lat, lng }` en el canal `<plate>`.
   - `POST /motorcycles/stop/<plate>` → detiene la emisión.
   - `GET /motorcycles/:id` → obtener `license_plate` (si lo necesitas para resolver placa).
3. Datos emitidos: estructura `{ "lat": number, "lng": number }` en el canal con nombre de la placa.

### Frontend (requisitos clave)
1. Configuración de `ngx-socket-io` en `CoreModule`:
   - `autoConnect: false` para conectar bajo demanda.
   - `url: environment.url_web_socket` apuntando al servidor Flask-SocketIO.
2. Servicios existentes:
   - `OrdersService` (CRUD pedidos).
   - `MotorcyclesService` (CRUD motos: para resolver placa por `id`).
   - `SocketService` (wrapper sobre `Socket`).
3. Dependencias:
   - `@angular/google-maps` en `package.json` (ya incluida).

---

## Ajustes previos en Pedidos (preparación)
Antes de integrar el mapa, dejaremos consistente el listado de pedidos y agregaremos el botón de rastreo.

### 1) Normalizar datos: snake_case → camelCase
El backend retorna campos en `snake_case` (p. ej., `customer_id`, `total_price`, `created_at`). En el frontend los templates usan `camelCase` (`customerId`, `totalPrice`, `createdAt`).

- Agrega un adaptador en `OrdersService` para transformar la respuesta del backend a `camelCase`.

Ejemplo (fragmento sugerido):

```ts
// src/app/core/services/orders.service.ts
private adapt(o: any): Order {
  return {
    id: o.id,
    customerId: o.customer_id,
    items: Array.isArray(o.items) ? o.items : [], // si más adelante soportas items
    totalPrice: o.total_price,
    status: o.status,
    motorcycleId: o.motorcycle_id ?? undefined,
    addressId: o.address?.id ?? o.address_id,
    createdAt: o.created_at,
  } as Order;
}

list(params?: any): Observable<Order[]> {
  return this.api.list<any[]>(this.path, params).pipe(
    map(arr => (arr || []).map(o => this.adapt(o)))
  );
}

get(id: number): Observable<Order> {
  return this.api.get<any>(this.path, id).pipe(
    map(o => this.adapt(o))
  );
}
```

> Nota: Si prefieres mantener `snake_case` en todo el frontend, ajusta los templates en lugar de adaptar. La guía recomienda adaptar para homogeneidad.

### 2) Botón "Rastrear" en la lista de pedidos
- Añade una columna de acción “Rastrear”.
- Si el pedido tiene `motorcycleId`, resuelve la placa con `MotorcyclesService.get(id)` → extrae `license_plate`.
- Llama `POST /motorcycles/track/<plate>` y redirige a `/orders/map?plate=<plate>`.

Ejemplo (fragmento de template):

```html
<!-- src/app/features/orders/orders-list.component.html (o inline) -->
<button class="btn btn-sm btn-outline-success ms-1" (click)="track(o)">
  Rastrear
</button>
```

Ejemplo (fragmento TS):

```ts
// src/app/features/orders/orders-list.component.ts
import { MotorcyclesService } from 'src/app/core/services/motorcycles.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

constructor(
  private svc: OrdersService,
  private motos: MotorcyclesService,
  private http: HttpClient,
  private router: Router,
) {}

track(o: Order) {
  if (!o.motorcycleId) {
    Swal.fire('Sin moto', 'El pedido no tiene motocicleta asignada.', 'info');
    return;
  }
  this.motos.get(o.motorcycleId).subscribe({
    next: (moto) => {
      const plate = (moto as any).license_plate;
      if (!plate) {
        Swal.fire('Sin placa', 'No se pudo resolver la placa.', 'warning');
        return;
      }
      this.http.post(`${environment.url_backend}/motorcycles/track/${plate}`, {})
        .subscribe({
          next: () => this.router.navigate(['/orders/map'], { queryParams: { plate } }),
          error: () => Swal.fire('Error', 'No fue posible iniciar el trackeo.', 'error')
        });
    },
    error: () => Swal.fire('Error', 'No fue posible obtener la motocicleta.', 'error')
  });
}
```

> Importante: si no existen rutas `create`, `:id`, `:id/edit` aún, oculta esos botones o crea stubs temporales para evitar navegación a wildcard.

---

## Diseño de la solución del mapa
- Vista dedicada en `orders`: ruta `orders/map`.
- Componente `OrdersMapComponent` con `GoogleMap`, uno o varios `MapMarker` y `MapPolyline` por placa.
- Servicio `TrackingService` que orquesta:
  - `start(plate)` / `stop(plate)` (HTTP contra backend).
  - `positions$(plate)` vía `SocketService.fromEvent<{lat,lng}>(plate)`.
  - Gestión de estado local (diccionario placa → buffer de puntos, marker, polyline).
- Conexión Socket:
  - `autoConnect: false`; `socket.connect()` al entrar; `socket.disconnect()` al salir (si no compartes socket en otras vistas).

---

## Implementación del mapa (paso a paso)

### 1) Ruta `orders/map`
- Edita `src/app/features/orders/orders-routing.module.ts` y agrega:

```ts
{ path: 'map', component: OrdersMapComponent }
```

### 2) Componente `OrdersMapComponent`
- Estructura mínima de archivos:
  - `orders-map.component.ts`
  - `orders-map.component.html`
  - `orders-map.component.scss`
- Importa `GoogleMapsModule` en `OrdersModule`.

Ejemplo de módulo:

```ts
// src/app/features/orders/orders.module.ts
import { GoogleMapsModule } from '@angular/google-maps';

@NgModule({
  declarations: [OrdersComponent, OrdersListComponent, OrdersMapComponent],
  imports: [CommonModule, FormsModule, OrdersRoutingModule, SharedModule, GoogleMapsModule],
})
export class OrdersModule {}
```

Ejemplo de componente:

```ts
// src/app/features/orders/orders-map.component.ts
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TrackingService } from './tracking.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-orders-map',
  templateUrl: './orders-map.component.html',
  styleUrls: ['./orders-map.component.scss']
})
export class OrdersMapComponent implements OnInit, OnDestroy {
  center: google.maps.LatLngLiteral = { lat: 5.07, lng: -75.49 };
  zoom = 14;
  plates: string[] = []; // placas activas
  markers: Record<string, google.maps.MarkerOptions> = {};
  polylines: Record<string, google.maps.LatLngLiteral[]> = {};

  private destroy$ = new Subject<void>();

  constructor(private route: ActivatedRoute, private tracking: TrackingService) {}

  ngOnInit(): void {
    this.tracking.connect();
    this.route.queryParamMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const plate = params.get('plate');
      if (plate) this.addPlate(plate);
    });
  }

  addPlate(plate: string) {
    if (this.plates.includes(plate)) return;
    this.plates.push(plate);
    this.polylines[plate] = [];

    this.tracking.positions$(plate)
      .pipe(takeUntil(this.destroy$))
      .subscribe(pos => {
        if (!pos) return;
        // actualizar buffer de polilínea
        this.polylines[plate].push(pos);
        if (this.polylines[plate].length > 500) this.polylines[plate].shift();
        // actualizar marcador
        this.markers[plate] = {
          position: pos,
          title: plate,
          icon: { url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png' }
        };
        // centrar la primera vez
        if (this.polylines[plate].length === 1) this.center = pos;
      });
  }

  start(plate: string) { this.tracking.start(plate).subscribe(); }
  stop(plate: string)  { this.tracking.stop(plate).subscribe(); }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    // detener todas las placas activas (opcional)
    this.plates.forEach(p => this.tracking.stop(p).subscribe({ next: () => {}, error: () => {} }));
    this.tracking.disconnect();
  }
}
```

```html
<!-- src/app/features/orders/orders-map.component.html -->
<div class="container-fluid p-3">
  <div class="d-flex align-items-center mb-2">
    <h5 class="mb-0">Mapa de Pedidos</h5>
    <div class="ms-auto d-flex gap-2">
      <!-- Campo simple para activar una placa -->
      <input #plateBox type="text" class="form-control form-control-sm" placeholder="Placa (ej. ABC123)" style="width:180px;">
      <button class="btn btn-sm btn-primary" (click)="addPlate(plateBox.value)">Seguir</button>
    </div>
  </div>

  <google-map [height]="'70vh'" [width]="'100%'" [center]="center" [zoom]="zoom">
    <map-marker *ngFor="let p of plates" [options]="markers[p]"></map-marker>
    <map-polyline *ngFor="let p of plates" [path]="polylines[p]"></map-polyline>
  </google-map>

  <div class="mt-2 small text-muted">Placas activas: {{ plates.join(', ') || 'ninguna' }}</div>
</div>
```

### 3) Servicio `TrackingService`

```ts
// src/app/features/orders/tracking.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SocketService } from 'src/app/core/services/socket.service';

export interface Position { lat: number; lng: number; }

@Injectable({ providedIn: 'root' })
export class TrackingService {
  constructor(private http: HttpClient, private socket: SocketService) {}

  connect()    { this.socket.connect(); }
  disconnect() { this.socket.disconnect(); }

  start(plate: string): Observable<any> { return this.http.post(`${environment.url_backend}/motorcycles/track/${plate}`, {}); }
  stop(plate: string): Observable<any>  { return this.http.post(`${environment.url_backend}/motorcycles/stop/${plate}`, {}); }

  positions$(plate: string) { return this.socket.fromEvent<Position>(plate); }
}
```

> Nota: Este servicio asume que el backend emite en el canal con nombre exacto de la placa.

---

## Estrategia de conexión Socket
- Mantén `autoConnect: false` y conecta solo en vistas que realmente consuman socket (ej. mapa).
- Evita adjuntar `user_id` en el handshake si el backend no lo requiere (puede causar 400). Conéctate “limpio” y suscríbete a los canales tras conectar.
- Limpia subscripciones con `takeUntil` y desconecta al destruir el componente.

---

## Pruebas end-to-end
1. Arrancar Backend con Socket.IO:

```powershell
# Activar venv si aplica
# & .\venv\Scripts\Activate.ps1

# Recomendado (equivalente):
# python -c "from app import create_app, socketio; app = create_app(); socketio.run(app, debug=True)"

# Arranque actual (si no modificas run.py) – puede no servir /socket.io
py .\run.py
```

2. Arrancar Frontend:

```powershell
npm install --legacy-peer-deps
ng serve
```

3. Datos de prueba:
   - Asegúrate de tener un `order` con `motorcycle_id` válido.
   - Obtén la placa: `GET /motorcycles/:id` → `license_plate`.

4. Flujo UI:
   - En `/orders`, haz clic en “Rastrear”.
   - Se hará `POST /motorcycles/track/<plate>` y navegará a `/orders/map?plate=<plate>`.
   - Debes ver el marcador moverse cada ~5s y la polilínea crecer.

---

## Solución de problemas
- Handshake 400 en Socket.IO:
  - Verifica que el backend corre con `socketio.run(app)`. Con `app.run` no se sirve `/socket.io`.
  - Asegura que `environment.url_web_socket` apunta al host/puerto correctos.
  - No envíes `auth/query` custom si el servidor no los espera.
- `404` en `start_tracking`:
  - La placa no existe en BD. Crea la moto o corrige `motorcycle_id` en el pedido.
- Marker no aparece:
  - Revisa en consola si llegan eventos `{lat,lng}`. Verifica canal = placa exacta.
- OneDrive/Windows:
  - Rutas largas o locks pueden afectar auto-recargas. Si ves comportamientos extraños, prueba el repo fuera de OneDrive.

---

## Extensiones Opcionales
- Notificaciones: usar `ngx-toastr` para avisar “nuevo pedido” y reproducir sonido.
- Filtros: activar múltiples placas con colores distintos y leyenda.
- Persistencia: guardar placas seguidas en `localStorage` para reanudar.
- Seguridad: cuando exista validación server-side de OAuth, enviar JWT válido en todas las llamadas.

---

## Referencia rápida
- Backend (emit): `socketio.emit('<plate>', { lat, lng })` cada 5s.
- Endpoints: `POST /motorcycles/track/<plate>` / `POST /motorcycles/stop/<plate>`.
- Socket cliente: `SocketService.fromEvent<Position>(plate)`.
- Mapa: `@angular/google-maps` (`<google-map>`, `<map-marker>`, `<map-polyline>`).

---

## Checklist final
- [ ] `OrdersService` adapta snake_case → camelCase.
- [ ] Botón “Rastrear” en la lista y navegación a `/orders/map`.
- [ ] `OrdersMapComponent` renderiza marcador y polilínea.
- [ ] `TrackingService` conecta/desconecta socket; suscribe a eventos; start/stop por placa.
- [ ] Pruebas e2e realizadas (marcador se mueve, polilínea crece, sin errores).

Con esto, el módulo de Pedidos queda listo y el mapa interactivo funciona de extremo a extremo.

---

## Estado actual tras la integración inicial (resumen de cambios y verificación)

Esta sección documenta lo que acabamos de integrar y los puntos que aún no están completamente operativos.

**Cambios aplicados (frontend):**
- `OrdersService` ahora adapta snake_case → camelCase en `list/get` para que la UI muestre correctamente `customerId`, `totalPrice`, `createdAt`, `motorcycleId`.
- `OrdersListComponent` incorpora botón “Rastrear” que:
  - Resuelve la placa a partir de `motorcycleId` usando `MotorcyclesService.get(id)`.
  - Llama `POST /motorcycles/track/<plate>`.
  - Navega a `#/orders/map?plate=<plate>`.
- `OrdersMapComponent` creado con Google Maps (`@angular/google-maps`), marcadores y polilíneas por placa, y conexión a Socket.IO.
- `TrackingService` creado para orquestar `start/stop` (HTTP) y `positions$` (Socket.IO). 
- `OrdersModule` y `orders-routing.module` actualizados para declarar `OrdersMapComponent` y exponer la ruta `orders/map`.

**Qué funciona ya:**
- Listado de pedidos renderiza columnas con datos adaptados (si backend devuelve campos esperados).
- Botón “Rastrear” ejecuta el flujo previsto y abre el mapa con la placa como query param.
- `orders/map` muestra un mapa, crea marcador y traza la polilínea conforme llegan eventos `{lat,lng}` para la placa.

**Fallas y pendientes detectados:**
- Botón “Crear pedido” no funciona: enrutamos a `/orders/create` pero no existen componentes/rutas para `create`, `:id`, `:id/edit` (también afecta “Ver” y “Editar”).
- Modelo de `Order` en frontend vs backend:
  - Backend maneja `menu_id` + `quantity` (no una lista `items`).
  - El formulario de creación/edición aún no existe y deberá mapear `camelCase → snake_case` al enviar (`menuId → menu_id`, `totalPrice → total_price`, etc.).
- Socket.IO backend: si el servidor corre con `app.run` en lugar de `socketio.run(app)`, el handshake puede fallar (400) y el mapa no recibirá eventos.
- Google Maps API: se requiere cargar el script de Google Maps con una API key válida (tag `<script src="https://maps.googleapis.com/maps/api/js?key=...">` en `index.html`) para que el mapa renderice correctamente.
- Paginación: el frontend pasa `page/limit`, pero el backend actualmente retorna todo; la paginación en UI es local.

---

## Plan de solución (antes de cerrar la historia del mapa)

1) CRUD de Pedidos mínimo viable (habilitar botones “Crear/Ver/Editar”):
- Crear `OrdersFormComponent` (reactive forms) y `OrdersDetailComponent`.
- Rutas en `orders-routing.module.ts`:
  - `{ path: 'create', component: OrdersFormComponent }`
  - `{ path: ':id', component: OrdersDetailComponent }`
  - `{ path: ':id/edit', component: OrdersFormComponent }`
- Formulario (creación/edición) deberá:
  - Seleccionar `menu` y `quantity` (coherente con backend).
  - Calcular `totalPrice` en cliente (opcional) o recibir del backend.
  - Enviar payload mapeando `camelCase → snake_case`:
    - `customerId → customer_id`, `menuId → menu_id`, `motorcycleId → motorcycle_id`, `totalPrice → total_price`.
  - Manejar estados `status` (`pending`, `assigned`, `in_transit`, `delivered`, `cancelled`).

2) Google Maps API key:
- Agregar el script oficial en `src/index.html` (o usar un cargador centralizado) y configurar una API key válida.
- Verificar que el mapa renderiza (sin errores de consola) antes de probar Socket.IO.

3) Socket.IO servidor:
- Arrancar el backend con `socketio.run(app)` para exponer `/socket.io` correctamente y evitar handshakes 400.
- Validar que `POST /motorcycles/track/<plate>` comienza a emitir eventos periódicamente y que el canal coincide exactamente con la placa.

4) Mejora de `OrdersService` para escritura (opcional inmediato):
- Añadir adaptadores de salida al crear/actualizar:
  - `toBackend(o: Partial<Order>)` que transforme `camelCase → snake_case` al enviar.
  - Dejar la lectura en `adapt()` como está.

5) Paginación (opcional):
- Mantener paginación en cliente por ahora. Documentar limitaciones y, si se requiere, coordinar con backend para soportar `page/limit`.

---

## Pruebas recomendadas tras aplicar el plan

- Crear un pedido desde `orders/create` seleccionando `menu` y `quantity`; verificar que aparece en la lista con campos correctos.
- Asignar una `motorcycle` a un pedido, presionar “Rastrear”, verificar:
  - `POST /motorcycles/track/<plate>` responde 200.
  - `orders/map` recibe eventos y el marcador se mueve.
- Editar un pedido en `:id/edit` y verificar que el mapeo `camelCase ↔ snake_case` funciona.
- Validar el mapa con 2–3 placas concurrentes y que no haya memory leaks (desuscribirse al salir de la vista).

Con estas correcciones, el flujo de Pedidos queda consistente (CRUD básico + tracking) y el mapa en tiempo real funciona de forma robusta.
