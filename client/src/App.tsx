import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { DashboardLayout } from './components/layout/DashboardLayout';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { DashboardOverviewPage } from './pages/DashboardOverviewPage';
import { ResumesPage } from './pages/ResumesPage';
import { JobsPage } from './pages/JobsPage';
import { MatchingPage } from './pages/MatchingPage';
import { SkillGapsPage } from './pages/SkillGapsPage';
import { OptimizationsPage } from './pages/OptimizationsPage';
import { ResumeBuilderPage } from './pages/ResumeBuilderPage';
import { CoverLettersPage } from './pages/CoverLettersPage';
import { InterviewStudioPage } from './pages/InterviewStudioPage';
import { ApplicationTrackerPage } from './pages/ApplicationTrackerPage';
import { CareerSwitchPage } from './pages/CareerSwitchPage';
import { AccountSettingsPage } from './pages/AccountSettingsPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* Onboarding Wizard */}
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute>
                  <OnboardingPage />
                </ProtectedRoute>
              }
            />

            {/* Authenticated Application Workspace */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<DashboardOverviewPage />} />
              <Route path="resumes" element={<ResumesPage />} />
              <Route path="jobs" element={<JobsPage />} />
              <Route path="matching" element={<MatchingPage />} />
              <Route path="skill-gaps" element={<SkillGapsPage />} />
              <Route path="optimizations" element={<OptimizationsPage />} />
              <Route path="builder" element={<ResumeBuilderPage />} />
              <Route path="cover-letters" element={<CoverLettersPage />} />
              <Route path="interviews" element={<InterviewStudioPage />} />
              <Route path="tracker" element={<ApplicationTrackerPage />} />
              <Route path="career-switch" element={<CareerSwitchPage />} />
              <Route path="settings" element={<AccountSettingsPage />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;

