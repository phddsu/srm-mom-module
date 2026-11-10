import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import Layout from './layout/Layout';
import LoginPage from './pages/LoginPage';
import ChangePassword from './pages/ChangePassword'; // Added
import DashboardPage from './pages/DashboardPage';
import NotificationsPage from './pages/NotificationsPage';
import SupervisorDashboard from './pages/supervisor/SupervisorDashboard';
import CoordinatorDashboard from './pages/coordinator/CoordinatorDashboard';
import HoiDashboard from './pages/hoi/HoiDashboard';
import DeanResearchDashboard from './pages/dean/DeanResearchDashboard';
import ScholarDashboard from './pages/scholar/ScholarDashboard';
import MoMDetailPage from './pages/scholar/MoMDetailPage';
import Profile from './pages/scholar/Profile';
import Leave from './pages/scholar/Leave';
import UserManagement from './pages/admin/UserManagement';
import SupervisorLeave from './pages/supervisor/SupervisorLeave';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="p-6 text-gray-500">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  
  // If the user requires a password change, force them to the change password page
  if (user.requiresPasswordChange && window.location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      {/* Standalone route for password change (does not use Layout) */}
      <Route path="/change-password" element={<ChangePassword />} />

      <Route path="/mom/:id" element={<ProtectedRoute><MoMDetailPage /></ProtectedRoute>} />
      
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/scholar" element={<ScholarDashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/leave" element={<Leave />} />
        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="/supervisor" element={<SupervisorDashboard />} />
        <Route path="/supervisor/leaves" element={<SupervisorLeave />} />
        <Route path="/coordinator" element={<CoordinatorDashboard />} />
        <Route path="/hoi" element={<HoiDashboard />} />
        <Route path="/dean" element={<DeanResearchDashboard />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}