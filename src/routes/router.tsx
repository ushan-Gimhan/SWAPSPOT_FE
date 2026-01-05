import React, { lazy, Suspense, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

const LandingPage = lazy(() => import("../pages/Home"));
const Login = lazy(() => import("../pages/Login"));
const SignUp = lazy(() => import("../pages/SignUp"));
const UserDashboard = lazy(() => import("../pages/UserDashboard"));
const UserProfile = lazy(() => import("../pages/UserProfile"));
const PostItem = lazy(() => import("../pages/PostItem"));
const Massege = lazy(() => import("../pages/massege"));
const AdminDashboard = lazy(() => import("../pages/adminDashboard"));
const LoginSuccess = lazy(() => import("../pages/LoginSuccess"));

function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { user} = useAuth();

  // If logged in → go to dashboard
  if (user) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}

export default function Router() {
  const [view, setView] = useState<string>("");

  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center">Loading...</div>}>
      <Routes>

        {/* First load → Home */}
        <Route
          path="/"
          element={
            <PublicOnlyRoute>
              <LandingPage />
            </PublicOnlyRoute>
          }
        />

        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          }
        />

        <Route
          path="/signup"
          element={
            <PublicOnlyRoute>
              <SignUp setView={setView} />
            </PublicOnlyRoute>
          }
        />
        

        {/* Protected Page */}
        <Route path="/dashboard" element={<UserDashboard />} />

        <Route path="/profile" element={<UserProfile />} />
        <Route path="/post" element={<PostItem />} />

        <Route path="/messages" element={<Massege />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        <Route path="/login-success" element={<LoginSuccess />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </Suspense>
  );
}
