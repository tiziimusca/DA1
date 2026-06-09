import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_BASE_URL } from '../../config/apiConfig';

const baseUrl = `${API_BASE_URL}/productos`;

export const fetchProductos = createAsyncThunk(
  'productos/fetchProductos',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${baseUrl}`);
      return response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchProductoPorId = createAsyncThunk(
  'productos/fetchProductoPorId',
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(`${baseUrl}/${id}`);
      return response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchDisponibles = createAsyncThunk(
  'productos/fetchDisponibles',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${baseUrl}/disponibles`);
      return response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  lista: [],
  disponibles: [],
  detalle: null,
  loading: false,
  error: null,
};

const productoSlice = createSlice({
  name: 'productos',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearDetalle: (state) => {
      state.detalle = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductos.fulfilled, (state, action) => {
        state.loading = false;
        state.lista = action.payload;
      })
      .addCase(fetchProductos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchProductoPorId.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProductoPorId.fulfilled, (state, action) => {
        state.loading = false;
        state.detalle = action.payload;
      })
      .addCase(fetchProductoPorId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchDisponibles.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDisponibles.fulfilled, (state, action) => {
        state.loading = false;
        state.disponibles = action.payload;
      })
      .addCase(fetchDisponibles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearDetalle } = productoSlice.actions;
export default productoSlice.reducer;
