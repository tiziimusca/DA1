# Arquitectura MVVM - Frontend React Native

Este proyecto implementa la arquitectura **MVVM (Model-View-ViewModel)** con **Redux** en React Native.

## Estructura

### 1. **Model (Redux Slices)**

Ubicado en `src/redux/slices/`

- `subastaSlice.js`: Define el estado, acciones y thunks para subastas
- `productoSlice.js`: Define el estado, acciones y thunks para productos

Cada slice contiene:

- Estado inicial
- Reducers (mutaciones síncronas)
- Extra Reducers (manejo de acciones asíncronas)

```javascript
// Ejemplo
const subastaSlice = createSlice({
  name: "subastas",
  initialState: { lista: [], loading: false, error: null },
  reducers: {
    /* ... */
  },
  extraReducers: {
    /* manejo de fetchSubastas */
  },
});
```

### 2. **Store**

Ubicado en `src/redux/store.js`

Centraliza todos los reducers:

```javascript
configureStore({
  reducer: {
    subastas: subastaReducer,
    productos: productoReducer,
  },
});
```

### 3. **ViewModel (Custom Hooks)**

Ubicado en `src/hooks/`

- `useSubastasViewModel.js`: Encapsula la lógica de subastas
- `useProductosViewModel.js`: Encapsula la lógica de productos

Los ViewModels exponen:

- **Estado**: datos del Redux
- **Acciones**: métodos que disparan acciones
- **Utilidades**: helpers para el componente

```javascript
export const useSubastasViewModel = () => {
  const dispatch = useDispatch();
  const { lista, loading, error } = useSelector((state) => state.subastas);

  return {
    subastas: lista,
    loading,
    error,
    cargarTodas: () => dispatch(fetchSubastas()),
  };
};
```

### 4. **View (React Components)**

Ubicado en `src/screens/`

Los componentes React usan los ViewModels:

```javascript
export default function AuctionListScreen({ navigation }) {
  const { subastas, loading, error, cargarTodas } = useSubastasViewModel();

  useEffect(() => {
    cargarTodas();
  }, []);

  return (
    <View>
      {loading ? <ActivityIndicator /> : <FlatList data={subastas} ... />}
    </View>
  );
}
```

## Flujo de datos

```
View Component
    ↓
useViewModel Hook (ViewModel)
    ↓
Redux Store (Model)
    ↓
API Backend / Slices (Business Logic)
    ↓
Redux Store (actualiza estado)
    ↓
useSelector Hook (View se suscribe)
    ↓
View re-renderiza
```

## Ventajas

✓ **Separación de responsabilidades**: View, ViewModel, Model
✓ **Testeable**: Lógica aislada en hooks y slices
✓ **Reutilizable**: ViewModels pueden usarse en múltiples componentes
✓ **Escalable**: Redux facilita agregar más slices sin complejidad

## Ejemplo práctico

Para agregar una nueva entidad (ej: Clientes):

1. Crear `src/redux/slices/clienteSlice.js` (Model)
2. Agregar al store: `cliente: clienteReducer`
3. Crear `src/hooks/useClientesViewModel.js` (ViewModel)
4. Usar en componentes: `const { clientes, loading } = useClientesViewModel();` (View)
