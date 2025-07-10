import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000';

export const submitCSR = createAsyncThunk(
  'certificate/submitCSR',
  async ({ csrContent, commonName }) => {
    try {
      const { data } = await axios.post(`${API_URL}/api/certificates/submit-csr`, {
        csrContent,
        commonName,
      });
      return data;
    } catch (error) {
      return console.log(error.res)
    }
  }
);

export const createCertificateRequest = createAsyncThunk(
  'certificate/createCertificateRequest',
  async ({ commonName }, thunkAPI) => {
    try {
      const res = await axios.post('http://localhost:5000/api/certificates/request', { commonName });
      thunkAPI.dispatch(fetchCertificates());
      return res.data.message;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data.message);
    }
  }
);

export const fetchCertificates = createAsyncThunk(
  'certificate/fetchCertificates',
  async (_, thunkAPI) => {
    try {
      const { data } = await axios.get(`${API_URL}/api/certificates`);
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Error');
    }
  }
);

export const revokeCertificate = createAsyncThunk(
  'certificate/revokeCertificate',
  async (id, thunkAPI) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/certificates/revoke/${id}`);
      thunkAPI.dispatch(fetchCertificates());
      return res.data.message;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data.message);
    }
  }
);

export const renewCertificate = createAsyncThunk(
  'certificate/renewCertificate',
  async (id, thunkAPI) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/certificates/renew/${id}`);
      thunkAPI.dispatch(fetchCertificates());
      return res.data.message;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data.message);
    }
  }
);


const certificateSlice = createSlice({
  name: 'certificate',
  initialState: {
    loading: false,
    certificates: [],
    error: null,
    message: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(submitCSR.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitCSR.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
      })
      .addCase(submitCSR.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      }).addCase(fetchCertificates.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCertificates.fulfilled, (state, action) => {
        state.loading = false;
        state.certificates = action.payload;
      })
      .addCase(fetchCertificates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      }).addCase(createCertificateRequest.pending, (state) => {
        state.loading = true;
      })
      .addCase(createCertificateRequest.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(createCertificateRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      }).addCase(revokeCertificate.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload
      })
      .addCase(revokeCertificate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      }).addCase(renewCertificate.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload
      })
      .addCase(renewCertificate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default certificateSlice.reducer;
