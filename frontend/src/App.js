import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Pages
import LoginPage from "./components/loginpage/LoginPage";
import ForgotPassword from "./components/loginpage/ForgotPassword";
import ResetPassword from "./components/loginpage/ResetPassword";
import Dashboard from "./pages/Dashboard";
import AdminPage from "./pages/AdminPage";
import PaymentHistory from "./pages/PaymentHistory";
import ReportTable from "./components/RepoartTable/ReportTable"; 

// ✅ नवीन कॉम्पोनंट्स इम्पोर्ट करा (पाथ तुमच्या फाईल स्ट्रक्चरनुसार तपासा)
import DuePaymentsTable from "./components/admin/DuePaymentsTable"; 
import PaidPaymentsTable from "./components/admin/PaidPaymentsTable";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ✅ Default route → Login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* 🔐 Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          }
        />

        {/* ✅ नवीन: बाकी रक्कम (Pending) Route */}
        <Route
          path="/pending"
          element={
            <ProtectedRoute>
              <DuePaymentsTable />
            </ProtectedRoute>
          }
        />

        {/* ✅ नवीन: पूर्ण रक्कम (Completed) Route */}
        <Route
          path="/completed"
          element={
            <ProtectedRoute>
              <PaidPaymentsTable />
            </ProtectedRoute>
          }
        />

        <Route
          path="/payment-history"
          element={
            <ProtectedRoute>
              <PaymentHistory />
            </ProtectedRoute>
          }
        />

        {/* ✅ REPORT ROUTE */}
        <Route
          path="/report"
          element={
            <ProtectedRoute>
              <ReportTable />
            </ProtectedRoute>
          }
        />

        {/* ❌ Invalid URL → Admin */}
        <Route path="*" element={<Navigate to="/admin" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;