import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import Layout from './layout/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import NotificationsPage from './pages/NotificationsPage';
import SupervisorDashboard from './pages/supervisor/SupervisorDashboard';
import CoordinatorDashboard from './pages/coordinator/CoordinatorDashboard';
import HoiDashboard from './pages/hoi/HoiDashboard';
import DeanResearchDashboard from './pages/dean/DeanResearchDashboard';
import ScholarDashboard from './pages/scholar/ScholarDashboard';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-6 text-gray-500">Loadingâ€¦</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/scholar" element={<ScholarDashboard />} />`n        <Route path="/supervisor" element={<SupervisorDashboard />} />
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