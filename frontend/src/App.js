import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import StudentDashboard from "./pages/student/DashboardPage";
import DashboardPage from "./pages/admin/DashboardPage";
import ResourcePage from "./pages/ResourcePage";
import TicketPage from "./pages/TicketPage";
import BookingPage from "./pages/student/BookingPage";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ProfilePage from "./pages/ProfilePage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminNotificationsPage from "./pages/admin/AdminNotificationsPage";
import StudentNotificationsPage from "./pages/student/StudentNotificationsPage";
import NotificationSettingsPage from "./pages/student/NotificationSettingsPage";

const adminOnly = ["admin"];
const studentOnly = ["student"];
const allRoles = ["student", "admin"];

function DashboardRedirect() {
  const role = (localStorage.getItem("role") || "").toLowerCase();
  return <Navigate to={role === "admin" ? "/admin/dashboard" : "/student/dashboard"} replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route
          path="/dashboard"
          element={<ProtectedRoute allowedRoles={allRoles}><DashboardRedirect /></ProtectedRoute>}
        />
        <Route
          path="/student/dashboard"
          element={<ProtectedRoute allowedRoles={studentOnly}><StudentDashboard /></ProtectedRoute>}
        />
        <Route
          path="/admin/dashboard"
          element={<ProtectedRoute allowedRoles={adminOnly}><DashboardPage /></ProtectedRoute>}
        />
        <Route
          path="/resources"
          element={<ProtectedRoute allowedRoles={allRoles}><ResourcePage /></ProtectedRoute>}
        />
        <Route
          path="/bookings"
          element={<ProtectedRoute allowedRoles={allRoles}><BookingPage /></ProtectedRoute>}
        />
        <Route
          path="/tickets"
          element={<ProtectedRoute allowedRoles={allRoles}><TicketPage /></ProtectedRoute>}
        />
        <Route
          path="/admin/resources"
          element={<ProtectedRoute allowedRoles={adminOnly}><ResourcePage /></ProtectedRoute>}
        />
        <Route
          path="/admin/bookings"
          element={<ProtectedRoute allowedRoles={adminOnly}><BookingPage /></ProtectedRoute>}
        />
        <Route
          path="/admin/tickets"
          element={<ProtectedRoute allowedRoles={adminOnly}><TicketPage /></ProtectedRoute>}
        />
        <Route
          path="/admin/notifications"
          element={<ProtectedRoute allowedRoles={adminOnly}><AdminNotificationsPage /></ProtectedRoute>}
        />
        <Route
          path="/admin/profile"
          element={<ProtectedRoute allowedRoles={adminOnly}><ProfilePage role="admin" /></ProtectedRoute>}
        />
        <Route
          path="/student/resources"
          element={<ProtectedRoute allowedRoles={studentOnly}><ResourcePage /></ProtectedRoute>}
        />
        <Route
          path="/student/bookings"
          element={<ProtectedRoute allowedRoles={studentOnly}><BookingPage /></ProtectedRoute>}
        />
        <Route
          path="/student/tickets"
          element={<ProtectedRoute allowedRoles={studentOnly}><TicketPage /></ProtectedRoute>}
        />
        <Route
          path="/student/notifications"
          element={<ProtectedRoute allowedRoles={studentOnly}><StudentNotificationsPage /></ProtectedRoute>}
        />
        <Route
          path="/student/settings"
          element={<ProtectedRoute allowedRoles={studentOnly}><NotificationSettingsPage /></ProtectedRoute>}
        />
        <Route
          path="/student/notifications/settings"
          element={<ProtectedRoute allowedRoles={studentOnly}><NotificationSettingsPage /></ProtectedRoute>}
        />
        <Route
          path="/student/profile"
          element={<ProtectedRoute allowedRoles={studentOnly}><ProfilePage role="student" /></ProtectedRoute>}
        />
        <Route
          path="/admin/*"
          element={<ProtectedRoute allowedRoles={adminOnly}><Navigate to="/admin/dashboard" replace /></ProtectedRoute>}
        />
        <Route
          path="/student/*"
          element={<ProtectedRoute allowedRoles={studentOnly}><Navigate to="/student/dashboard" replace /></ProtectedRoute>}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
