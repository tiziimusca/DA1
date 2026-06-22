# Proyecto de Subastas

Sistema de subastas en línea con backend Java Spring Boot y frontend React Native.

### Backend: Arquitectura en Capas

- **Model**: Entidades JPA
- **Repository**: Acceso a datos (JPA)
- **Service**: Lógica de negocio
- **Controller**: Endpoints REST
- **WebSocket**: Comunicación en tiempo real

### Frontend:

- **api**: Acceso a los endpoints
- **screens**: Pantallas
- **Theme**: Plantilla global

## Arrancar el Proyecto

### Backend

```bash
cd back
mvn spring-boot:run
```

- API disponible en `http://localhost:8080/api`
- WebSocket en `ws://localhost:8080/ws/bids`
- Consola H2 en `http://localhost:8080/h2-console`

### Frontend

```bash
cd front
npm install
npx expo start
si tira el error: Error: Cannot find module 'babel-preset-expo'
ejecutar: npm install --save-dev babel-preset-expo@54.0.11
npx expo start -c
```

## Integracion

### URLs de conexion (expo)

En el archivo front/src/config/apiConfig.js:

const DEV_API_URL = 'http://192.168.0.181:8080/api';
const DEV_SERVER_URL = 'http://192.168.0.181:8080';
const PROD_API_URL = 'http://192.168.0.181:8080/api';
const PROD_SERVER_URL = 'http://192.168.0.181:8080';

Reemplazar con la IP de su maquina.

## Figma

Diseño en: https://www.figma.com/design/ntcqS6JSVT0e4dEEvFJQcE/Desarrollo-de-apps-1

## Características Implementadas

- Backend Spring Boot con MySQL (H2 en desarrollo)
- API REST completa con CRUD
- WebSocket para ofertas en tiempo real
- Frontend React Native para Android
- Validaciones y manejo de errores
- Documentación completa

## Test

Usuario: demo@gmail.com
Contraseña: demo123
