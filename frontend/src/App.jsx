import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/Auth/Login.jsx";
import RegisterPage from "./pages/Auth/SignUp.jsx";
import Dashboard from "./pages/DashBoard/DashBoard.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import DashboardLayout from "./components/layout/DashBoardLayout.jsx";
import Coding from "./components/interview/Coding.jsx";
import Behavioral from "./components/interview/Behavioral.jsx";
import Profile from "./pages/Profile.jsx";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";
import LandingPage from "./pages/LandingPage/LandingPage.jsx";


function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<RegisterPage />} />
          <Route path="/" element={<LandingPage />} />
          <Route element={<ProtectedRoute />} > 
            <Route path = "/dashboard" element={<DashboardLayout> <Dashboard /> </ DashboardLayout>} />
            <Route path="/coding" element={<DashboardLayout> < Coding /> </ DashboardLayout>} />
            <Route path="/behavioral" element={<DashboardLayout> < Behavioral /> </ DashboardLayout>} />
            <Route path="/profile" element={<DashboardLayout> < Profile /> </ DashboardLayout>} />
          </Route>
          <Route path="*" element={<Navigate to='/' replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}


export default App;