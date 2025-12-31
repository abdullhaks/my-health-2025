import { Toaster } from 'react-hot-toast';
import {BrowserRouter as Router , Routes , Route} from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import UserRoutes from './routes/user/UserRoutes';
import AdminRoutes from './routes/admin/AdminRoutes';
import DoctorRoutes from './routes/doctor/DoctorRoutes'
import { Suspense, useEffect } from 'react';
import Loader from './sharedComponents/Loaders';
import axios from 'axios';


const clientURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';



function App() {

  useEffect(() => {
    axios.get(`${clientURL}`)
      .then(response => {
        console.log('Backend is healthy:', response.data);
      })
      .catch(error => {
        console.error('Backend health check failed:', error);
      });
  }, []);


  return (
    <Router>

      <ToastContainer/>
      <Toaster/>
      <Suspense fallback={<Loader />}>
      {/* Main Application Routes */}
      <Routes>
        <Route path="/user/*" element={<UserRoutes />} />
        <Route path="/doctor/*" element={<DoctorRoutes />} />
        <Route path="/admin/*" element={<AdminRoutes />} />

        <Route path="/*" element={<UserRoutes />} />

      </Routes>
    </Suspense>
    </Router>
  )
}

export default App