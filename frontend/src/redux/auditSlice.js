import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchAuditLogs = createAsyncThunk(
  'audit/fetchAuditLogs',
  async (_, thunkAPI) => {
    try {
      const response = await axios.get('http://localhost:5000/api/audits', {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to load audit logs');
    }
  }
);


const auditSlice = createSlice({
  name: 'audit',
  initialState: {
    logs: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAuditLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAuditLogs.fulfilled, (state, action) => {
        state.logs = action.payload;
        state.loading = false;
      })
      .addCase(fetchAuditLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default auditSlice.reducer;
