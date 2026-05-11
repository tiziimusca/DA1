import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchSubastas = createAsyncThunk(
  'subastas/fetchSubastas',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('http://10.0.2.2:8080/api/subastas');
      return response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAbiertas = createAsyncThunk(
  'subastas/fetchAbiertas',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('http://10.0.2.2:8080/api/subastas/abiertas');
      return response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchProximas = createAsyncThunk(
  'subastas/fetchProximas',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('http://10.0.2.2:8080/api/subastas/proximas');
      return response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  lista: [],
  abiertas: [],
  proximas: [],
  loading: false,
  error: null,
};

const subastaSlice = createSlice({
  name: 'subastas',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubastas.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubastas.fulfilled, (state, action) => {
        state.loading = false;
        state.lista = action.payload;
      })
      .addCase(fetchSubastas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAbiertas.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAbiertas.fulfilled, (state, action) => {
        state.loading = false;
        state.abiertas = action.payload;
      })
      .addCase(fetchAbiertas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchProximas.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProximas.fulfilled, (state, action) => {
        state.loading = false;
        state.proximas = action.payload;
      })
      .addCase(fetchProximas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = subastaSlice.actions;
export default subastaSlice.reducer;
