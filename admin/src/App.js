import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { NotificationProvider } from './components/common/Notification';

// Auth Pages
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';

// Dashboard Pages
import DashboardLayout from './components/layout/DashboardLayout';
import Home from './pages/dashboard/Home';
import Poems from './pages/dashboard/Poems';
import Poets from './pages/dashboard/Poets';
import Albums from './pages/dashboard/Albums';
import Talat from './pages/dashboard/Talat';
import Photos from './pages/dashboard/Photos';
import Videos from './pages/dashboard/Videos';
import Playlists from './pages/dashboard/Playlists';
import Users from './pages/dashboard/Users';
import NotFound from './pages/NotFound';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <NotificationProvider>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Dashboard Routes */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <DashboardLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Home />} />
          <Route path="poems" element={<Poems />} />
          <Route path="poets" element={<Poets />} />
          <Route path="albums" element={<Albums />} />
          <Route path="talat" element={<Talat />} />
          <Route path="photos" element={<Photos />} />
          <Route path="videos" element={<Videos />} />
          <Route path="playlists" element={<Playlists />} />
          <Route path="users" element={<Users />} />
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </NotificationProvider>
  );
};

export default App;
