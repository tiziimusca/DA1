# Arquitectura del Backend - Spring Boot con Services

Este backend implementa una **arquitectura en capas** con separación clara de responsabilidades.

## Estructura

### 1. **Model Layer**

Ubicado en `src/main/java/com/example/auctionapp/model/`

Entidades JPA que representan las tablas de la base de datos:

- `Pais.java`
- `Persona.java`
- `Empleado.java`
- `Subasta.java`
- `Producto.java`
- etc.

Cada entidad tiene:

- Anotaciones `@Entity` y `@Table`
- Atributos con `@Column`
- Getters y Setters

### 2. **Repository Layer**

Ubicado en `src/main/java/com/example/auctionapp/repository/`

Interfaces que extienden `JpaRepository`:

- `PaisRepository`
- `PersonaRepository`
- `SubastaRepository`
- `ProductoRepository`

```java
@Repository
public interface PaisRepository extends JpaRepository<Pais, Integer> {
}
```

### 3. **Service Layer**

Ubicado en `src/main/java/com/example/auctionapp/service/`

Contiene la lógica de negocio:

- `PaisService.java`
- `PersonaService.java`
- `SubastaService.java`
- `ProductoService.java`

Cada servicio:

- Inyecta el repositorio
- Implementa CRUD
- Implementa lógica personalizada (filtros, validaciones, etc.)

```java
@Service
public class SubastaService {
  private final SubastaRepository subastaRepository;

  public List<Subasta> obtenerAbiertas() {
    return subastaRepository.findAll()
      .stream()
      .filter(s -> "abierta".equalsIgnoreCase(s.getEstado()))
      .toList();
  }
}
```

### 4. **Controller Layer**

Ubicado en `src/main/java/com/example/auctionapp/controller/`

Define los endpoints REST:

- `PaisController`
- `PersonaController`
- `SubastaController`
- `ProductoController`

Cada controlador:

- Inyecta el servicio (NO el repositorio)
- Mapea HTTP requests
- Maneja errores

```java
@RestController
@RequestMapping("/api/subastas")
public class SubastaController {
  private final SubastaService subastaService;

  @GetMapping("/abiertas")
  public List<Subasta> obtenerAbiertas() {
    return subastaService.obtenerAbiertas();
  }
}
```

### 5. **WebSocket**

Ubicado en `src/main/java/com/example/auctionapp/websocket/`

- `BidWebSocketHandler.java`: Maneja conexiones WebSocket
- `WebSocketConfig.java`: Configura endpoints WebSocket

Endpoint: `ws://localhost:8080/ws/bids`

## Endpoints API

### Paises

- `GET /api/paises` - Listar todos
- `GET /api/paises/{id}` - Obtener por ID
- `POST /api/paises` - Crear
- `PUT /api/paises/{id}` - Actualizar
- `DELETE /api/paises/{id}` - Eliminar

### Personas

- `GET /api/personas` - Listar todos
- `GET /api/personas/{id}` - Obtener por ID
- `POST /api/personas` - Crear
- `PUT /api/personas/{id}` - Actualizar
- `DELETE /api/personas/{id}` - Eliminar

### Subastas

- `GET /api/subastas` - Listar todos
- `GET /api/subastas/abiertas` - Listar abiertas
- `GET /api/subastas/proximas` - Listar próximas
- `GET /api/subastas/{id}` - Obtener por ID
- `POST /api/subastas` - Crear
- `PUT /api/subastas/{id}` - Actualizar
- `DELETE /api/subastas/{id}` - Eliminar

### Productos

- `GET /api/productos` - Listar todos
- `GET /api/productos/disponibles` - Listar disponibles
- `GET /api/productos/{id}` - Obtener por ID
- `POST /api/productos` - Crear
- `PUT /api/productos/{id}` - Actualizar
- `DELETE /api/productos/{id}` - Eliminar

## Flujo de datos

```
HTTP Request
    ↓
Controller (mapea request)
    ↓
Service (lógica de negocio)
    ↓
Repository (acceso a BD)
    ↓
Database
    ↓
Repository (retorna datos)
    ↓
Service (procesa datos)
    ↓
Controller (serializa a JSON)
    ↓
HTTP Response
```

## Ventajas

✓ **Separación de responsabilidades**
✓ **Testeable**: cada capa puede testearse independientemente
✓ **Mantenible**: cambios en BD no afectan controllers
✓ **Escalable**: agregar servicios es simple y limpio
✓ **Reutilizable**: servicios pueden usarse en múltiples controladores

## Para agregar una nueva entidad

1. Crear `Model` en `model/` (ej: `Cliente.java`)
2. Crear `Repository` en `repository/` (ej: `ClienteRepository.java`)
3. Crear `Service` en `service/` (ej: `ClienteService.java`)
4. Crear `Controller` en `controller/` (ej: `ClienteController.java`)

El Service inyecta el Repository y el Controller inyecta el Service.
