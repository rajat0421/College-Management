import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Teachers from './pages/Teachers';
import Branches from './pages/Branches';
import Subjects from './pages/Subjects';
import Attendance from './pages/Attendance';
import Report from './pages/Report';
import Profile from './pages/Profile';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route
                      path="/students"
                      element={
                        <AdminRoute>
                          <Students />
                        </AdminRoute>
                      }
                    />
                    <Route
                      path="/teachers"
                      element={
                        <AdminRoute>
                          <Teachers />
                        </AdminRoute>
                      }
                    />
                    <Route
                      path="/branches"
                      element={
                        <AdminRoute>
                          <Branches />
                        </AdminRoute>
                      }
                    />
                    <Route
                      path="/subjects"
                      element={
                        <AdminRoute>
                          <Subjects />
                        </AdminRoute>
                      }
                    />
                    <Route path="/attendance" element={<Attendance />} />
                    <Route path="/report" element={<Report />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
