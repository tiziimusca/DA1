import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_BASE_URL } from '../../config/apiConfig';

const baseUrl = `${API_BASE_URL}/clientes/me/metodos-pago`;

// El back devuelve los errores de validación como TEXTO PLANO (no JSON),
// así que response.json() falla y perdíamos el mensaje. Esto lee texto o JSON.
async function extraerMensajeError(response) {
  try {
    const texto = await response.text();
    if (!texto) return `Error ${response.status}`;
    try {
      const json = JSON.parse(texto);
      return json.mensaje ?? json.message ?? json.error ?? texto;
    } catch (_) {
      return texto; // texto plano: "...: El número de tarjeta debe contener entre 13 y 19 dígitos"
    }
  } catch (_) {
    return `Error ${response.status}`;
  }
}

// GET todos
export const fetchMetodosPago = createAsyncThunk(
  'metodoPago/fetchAll',
  async (clienteId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${baseUrl}?clienteId=${clienteId}`);
      if (!response.ok) throw new Error('Error al obtener los métodos de pago');
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// GET por id
export const fetchMetodoPagoPorId = createAsyncThunk(
  'metodoPago/fetchById',
  async ({ id, tipo, clienteId }, { rejectWithValue }) => {
    try {
      // El id no es único entre tipos: hay que mandar tipo para pegarle a la tabla correcta
      const response = await fetch(`${baseUrl}/${id}?clienteId=${clienteId}&tipo=${tipo}`);
      if (!response.ok) throw new Error('Error al obtener el método de pago');
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// POST crear
export const createMetodoPago = createAsyncThunk(
  'metodoPago/create',
  async ({ data, clienteId }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${baseUrl}?clienteId=${clienteId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        return rejectWithValue(await extraerMensajeError(response));
      }
      return await response.json(); // ← devuelve el nuevo método creado
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// PUT editar
export const updateMetodoPago = createAsyncThunk(
  'metodoPago/update',
  async ({ id, data, clienteId }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${baseUrl}/${id}?clienteId=${clienteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        return rejectWithValue(await extraerMensajeError(response));
      }
      return await response.json(); // ← devuelve el método actualizado
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// DELETE eliminar
export const deleteMetodoPago = createAsyncThunk(
  'metodoPago/delete',
  async ({ id, tipo, clienteId }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${baseUrl}/${id}?clienteId=${clienteId}&tipo=${tipo}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        return rejectWithValue(await extraerMensajeError(response));
      }
      return { id, tipo }; // ← (id, tipo) identifica de forma única al método en la lista combinada
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  lista: [],
  detalle: null,
  loading: false,
  error: null,
};

const metodoPagoSlice = createSlice({
  name: 'metodoPago',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
    clearDetalle: (state) => { state.detalle = null; },
  },
  extraReducers: (builder) => {
    const pending = (state) => { 
        state.loading = true;  
        state.error = null; 
    };
    const rejected = (state, action) => { 
        state.loading = false; 
        state.error = action.payload; 
    };

    builder
      // fetchAll
      .addCase(fetchMetodosPago.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.lista = [];
      })
      .addCase(fetchMetodosPago.fulfilled, (state, action) => {
        state.loading = false;
        // Sin dedup: el id se repite entre tipos a propósito (cada tabla tiene su
        // propio autoincremental). La identidad real es (tipo, id), así que NO
        // filtramos por id o estaríamos borrando métodos legítimos.
        state.lista = action.payload;
      })
      .addCase(fetchMetodosPago.rejected, rejected)

      // fetchById
      .addCase(fetchMetodoPagoPorId.pending, pending)
      .addCase(fetchMetodoPagoPorId.fulfilled, (state, action) => {
        state.loading = false;
        state.detalle = action.payload;
      })
      .addCase(fetchMetodoPagoPorId.rejected, rejected)

      // create
      .addCase(createMetodoPago.pending, pending)
      .addCase(createMetodoPago.fulfilled, (state, action) => {
        state.loading = false;

      })
      .addCase(createMetodoPago.rejected, rejected)

      // update
      .addCase(updateMetodoPago.pending, pending)
      .addCase(updateMetodoPago.fulfilled, (state, action) => {
        state.loading = false;
        
        // Matcheamos por (tipo, id): el id solo no es único entre tipos.
        const index = state.lista.findIndex(
          item => item.id == action.payload.id && item.tipo === action.payload.tipo
        );

        if (index !== -1) {
          state.lista[index] = action.payload;
        }

        if (state.detalle?.id == action.payload.id && state.detalle?.tipo === action.payload.tipo) {
            state.detalle = action.payload;
        }
      })
      .addCase(updateMetodoPago.rejected, rejected)

      .addCase(deleteMetodoPago.pending, pending)
      .addCase(deleteMetodoPago.fulfilled, (state, action) => {
        state.loading = false;
        const { id, tipo } = action.payload;
        // Filtramos por (tipo, id) para no borrar de la lista un método de otro tipo con el mismo id
        state.lista = state.lista.filter((item) => !(item.id == id && item.tipo === tipo));
      })
      .addCase(deleteMetodoPago.rejected, rejected);
  },
});

export const { clearError, clearDetalle } = metodoPagoSlice.actions;
export default metodoPagoSlice.reducer;