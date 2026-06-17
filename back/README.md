# Backend Spring Boot

Carpeta: `back`

## Ejecutar

1. Abrir la carpeta `DA1/DA1/back`.
2. Instalar dependencias con Maven si es necesario.
3. Ejecutar:
   ```bash
   mvn spring-boot:run
   ```

## Endpoints disponibles

- `GET /api/paises`
- `GET /api/personas`
- `GET /api/subastas`
- `GET /api/productos`

## WebSocket

- Conectar a `ws://localhost:8080/ws/bids`.

## Base de datos

El backend usa H2 en memoria para arranque rápido y pruebas locales.

## swagger
- http://localhost:8080/swagger-ui/index.html#

## BD
-  http://localhost:8080/h2-console
