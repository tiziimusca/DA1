# Proyecto de Subastas

Sistema de subastas en línea con backend Java Spring Boot y frontend React Native.

## 📁 Estructura del Proyecto

```
DA1/
├── back/              # Backend Spring Boot
│   ├── src/main/java/com/example/auctionapp/
│   │   ├── model/           # Entidades JPA
│   │   ├── repository/      # Interfaces de acceso a datos
│   │   ├── service/         # Lógica de negocio
│   │   ├── controller/      # Endpoints REST
│   │   ├── websocket/       # Manejo de WebSocket
│   │   └── config/          # Configuraciones
│   └── pom.xml
│
├── front/             # Frontend React Native
│   ├── src/
│   │   ├── screens/          # Pantallas de la app
│   │   ├── components/       # Componentes reutilizables
│   │   ├── api/              # Cliente HTTP y WebSocket
│   │   ├── redux/
│   │   │   ├── slices/       # Redux slices (estado)
│   │   │   └── store.js      # Configuración Redux
│   │   └── hooks/            # Custom hooks (ViewModels)
│   ├── App.js
│   ├── package.json
│   └── app.json
```

## 🏗️ Arquitectura

### Backend: Arquitectura en Capas

- **Model**: Entidades JPA
- **Repository**: Acceso a datos (JPA)
- **Service**: Lógica de negocio
- **Controller**: Endpoints REST
- **WebSocket**: Comunicación en tiempo real

Ver [ARCHITECTURE.md](back/ARCHITECTURE.md)

### Frontend: Arquitectura MVVM + Redux

- **Model**: Redux Slices (estado centralizado)
- **ViewModel**: Custom Hooks (lógica de presentación)
- **View**: React Components (pantallas)

Ver [MVVM_ARCHITECTURE.md](front/MVVM_ARCHITECTURE.md)

## 🚀 Arrancar el Proyecto

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
npm run android
```

## 🔗 Integración

### URLs de conexión (Emulador Android)

- REST API: `http://10.0.2.2:8080/api`
- WebSocket: `ws://10.0.2.2:8080/ws/bids`

Para dispositivo físico, reemplaza `10.0.2.2` con la IP de tu máquina.

## 🎨 Figma

Diseño visual en: https://www.figma.com/design/ntcqS6JSVT0e4dEEvFJQcE/Desarrollo-de-apps-1

## 📚 Documentación Adicional

- [Backend Architecture](back/ARCHITECTURE.md)
- [Frontend MVVM Architecture](front/MVVM_ARCHITECTURE.md)
- [Backend README](back/README.md)
- [Frontend README](front/README.md)

## ✨ Características Implementadas

✅ Backend Spring Boot con MySQL (H2 en desarrollo)
✅ API REST completa con CRUD
✅ WebSocket para ofertas en tiempo real
✅ Frontend React Native para Android
✅ Arquitectura MVVM con Redux
✅ Validaciones y manejo de errores
✅ Documentación completa
