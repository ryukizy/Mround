import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ChecklistFormPage from './pages/ChecklistFormPage';
import HistoryPage from './pages/HistoryPage';
import DetailReportPage from './pages/DetailReportPage';

// Components
import BottomNav from './components/BottomNav';
import ProtectedRoute from './components/ProtectedRoute';

function AppContent() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500">Memuat aplikasi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container bg-gray-50">
      <Routes>
        {/* Public Route */}
        <Route 
          path="/login" 
          element={currentUser ? <Navigate to="/dashboard" replace /> : <LoginPage />} 
        />

        {/* Protected Routes */}
        <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/checklist" element={<ProtectedRoute><ChecklistFormPage /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
        <Route path="/detail/:id" element={<ProtectedRoute><DetailReportPage /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to={currentUser ? "/dashboard" : "/login"} replace />} />
      </Routes>

      {/* Bottom Navigation - only show when logged in and not on login page */}
      {currentUser && <BottomNav />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
