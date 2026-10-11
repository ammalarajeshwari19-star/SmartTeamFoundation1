import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import { useAuth } from './context/AuthContext';
import LoadingSpinner from './components/LoadingSpinner';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import ProjectDiscoveryPage from './pages/ProjectDiscoveryPage';
import ProjectDetailsPage from './pages/ProjectDetailsPage';
import CreateProjectPage from './pages/CreateProjectPage';
import EditProjectPage from './pages/EditProjectPage';
import MyProjectsPage from './pages/MyProjectsPage';
import TeamMembersPage from './pages/TeamMembersPage';
import RecommendationsPage from './pages/RecommendationsPage';
import SkillGapPage from './pages/SkillGapPage';
import TeamManagementPage from './pages/TeamManagementPage';
import NotificationsPage from './pages/NotificationsPage';
import SettingsPage from './pages/SettingsPage';
import TeammatesPage from './pages/TeammatesPage';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingSpinner text="Authenticating session..." />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Public Routes */}
        <Route index element={<LandingPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="projects" element={<ProjectDiscoveryPage />} />
        <Route path="projects/:id" element={<ProjectDetailsPage />} />
        <Route path="projects/:id/team" element={<TeamMembersPage />} />
        <Route path="projects/:id/recommendations" element={<RecommendationsPage />} />
        <Route path="projects/:id/skill-gap" element={<SkillGapPage />} />
        <Route path="teammates" element={<TeammatesPage />} />
        <Route path="profile/:id" element={<ProfilePage />} />

        {/* Protected Authenticated Routes */}
        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile/edit"
          element={
            <ProtectedRoute>
              <EditProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="projects/create"
          element={
            <ProtectedRoute>
              <CreateProjectPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="projects/:id/edit"
          element={
            <ProtectedRoute>
              <EditProjectPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="projects/:id/manage"
          element={
            <ProtectedRoute>
              <TeamManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="my-projects"
          element={
            <ProtectedRoute>
              <MyProjectsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        {/* 404 Catch-All */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
