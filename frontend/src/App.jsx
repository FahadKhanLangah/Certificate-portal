import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RequestCertificate from './pages/RequestCertificate';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Navbar from './components/Navbar';
import { ToastContainer } from 'react-toastify';
import AuditLogs from './pages/AuditLogs';
import Homepage from './pages/HomePage';
function App() {
  return (
    <BrowserRouter>
    <ToastContainer/>
      <Navbar />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/request" element={<RequestCertificate />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/audit-logs" element={<AuditLogs />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
