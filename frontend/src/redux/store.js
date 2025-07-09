import { configureStore } from '@reduxjs/toolkit';
import certificateReducer from './certificateSlice';
import authReducer from './authSlice';
import auditReducer from './auditSlice'
export const store = configureStore({
  reducer: {
    certificate: certificateReducer,
    auth: authReducer,
    audit: auditReducer
  },
});
