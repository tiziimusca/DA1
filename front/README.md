# Frontend React Native

Carpeta: `front`

## Ejecutar

1. Abrir la carpeta `DA1/DA1/front`.
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Iniciar Expo para Android:
   ```bash
   npm run android
   ```

## Estructura

- `App.js`: punto de entrada de la app.
- `src/screens/`: pantallas de la app.
- `src/api/auctionApi.js`: llamadas REST y websocket.

## Conexión con backend

La app usa `http://10.0.2.2:8080/api` para Android emulador.
Si usas un dispositivo físico ajusta la URL al IP de tu máquina.
