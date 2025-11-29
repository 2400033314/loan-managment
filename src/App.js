import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ApplicationProvider } from './contexts/ApplicationContext';
import Login from './components/Auth/Login';
import BorrowerDashboard from './components/Borrower/BorrowerDashboard';
import BorrowerCatalog from './components/Borrower/BorrowerCatalog';
import BorrowerApplication from './components/Borrower/BorrowerApplication';
import AnalystDashboard from './components/FinancialAnalyst/AnalystDashboard';
import AdminDashboard from './components/Admin/AdminDashboard';
import './App.css';

function PrivateRoute({ children, allowedRoles = [] }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="container">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/" />;
  }
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }
  
  return children;
}

function App() {
  return (
    <AuthProvider>
      <ApplicationProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Login />} />
            
            {/* Admin Routes */}
            <Route 
              path="/admin/dashboard" 
              element={
                <PrivateRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </PrivateRoute>
              } 
            />
            
            {/* Borrower Routes */}
            <Route 
              path="/borrower/dashboard" 
              element={
                <PrivateRoute allowedRoles={['borrower']}>
                  <BorrowerDashboard />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/borrower/catalog" 
              element={
                <PrivateRoute allowedRoles={['borrower']}>
                  <BorrowerCatalog />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/borrower/application" 
              element={
                <PrivateRoute allowedRoles={['borrower']}>
                  <BorrowerApplication />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/borrower/application/:id/edit" 
              element={
                <PrivateRoute allowedRoles={['borrower']}>
                  <BorrowerApplication />
                </PrivateRoute>
              } 
            />
            
            {/* Financial Analyst Routes */}
            <Route 
              path="/analyst/dashboard" 
              element={
                <PrivateRoute allowedRoles={['financial_analyst', 'admin']}>
                  <AnalystDashboard />
                </PrivateRoute>
              } 
            />
            
            {/* Default redirect */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </ApplicationProvider>
    </AuthProvider>
  );
}

export default App;

