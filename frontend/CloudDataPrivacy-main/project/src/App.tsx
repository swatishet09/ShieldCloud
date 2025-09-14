import { Routes, Route } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

// Layouts
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import PatientForm from './pages/admin/PatientForm';
// import StaffManagement from './pages/admin/StaffManagement';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import PatientDetails from './pages/doctor/PatientDetails';
import ResearcherDashboard from './pages/researcher/ResearcherDashboard';
import NotFoundPage from './pages/NotFoundPage';

// Guards
import ProtectedRoute from './components/guards/ProtectedRoute';

function App() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="researcher" element={<ResearcherDashboard />} />
      </Route>
      
      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="patients/new" element={<PatientForm />} />
        <Route path="patients/edit/:id" element={<PatientForm />} />
        {/* <Route path="staff" element={<StaffManagement />} /> */}
      </Route>
      
      {/* Doctor/Staff Routes */}
      <Route path="/doctor" element={
        <ProtectedRoute allowedRoles={['doctor', 'patient']}>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route index element={<DoctorDashboard />} />
        <Route path="patients/:id" element={<PatientDetails />} />
      </Route>
      
      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;