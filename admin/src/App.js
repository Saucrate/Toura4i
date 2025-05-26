import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { NotificationProvider } from './components/common/Notification';
import ProtectedRoute from './components/common/ProtectedRoute';
import { LogoProvider } from './context/LogoContext';
import { AuthProvider } from './context/AuthContext';

// Auth Pages
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';

// Dashboard Pages
import DashboardLayout from './components/layout/DashboardLayout';
import Home from './pages/dashboard/Home';
import Poems from './pages/dashboard/Poems';
import Poets from './pages/dashboard/Poets';
import Albums from './pages/dashboard/Albums';
import Photos from './pages/dashboard/Photos';
import Videos from './pages/dashboard/Videos';
import Playlists from './pages/dashboard/Playlists';
import Users from './pages/dashboard/Users';
import AudioRecordings from './pages/dashboard/AudioRecordings';
import NotFound from './pages/NotFound';
import Profile from './pages/dashboard/Profile';
import Books from './pages/dashboard/Books';
import Places from './pages/dashboard/Places';

const App = () => {
  return (
    <AuthProvider>
      <LogoProvider>
        <NotificationProvider>
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Dashboard Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Home />} />
              <Route path="poems" element={<Poems />} />
              <Route path="poets" element={<Poets />} />
              <Route path="albums" element={<Albums />} />
              <Route path="books" element={<Books />} />
              <Route path="places" element={<Places />} />
              <Route path="audio-recordings" element={<AudioRecordings />} />
              <Route path="photos" element={<Photos />} />
              <Route path="videos" element={<Videos />} />
              <Route path="playlists" element={<Playlists />} />
              <Route path="users" element={<Users />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </NotificationProvider>
      </LogoProvider>
    </AuthProvider>
  );
};

export default App;
