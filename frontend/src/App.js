import { Toaster } from "react-hot-toast";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import QRScanner from "./components/QRScanner";
import { AuthProvider } from "./context/AuthContext";
import DashboardPage from "./pages/admin/DashboardPage";
import AdminBookingPage from "./pages/admin/AdminBookingPage";
import LoginPage from "./pages/LoginPage";
import ResourcePage from "./pages/ResourcePage";
import TicketPage from "./pages/TicketPage";
import BookingPage from "./pages/student/BookingPage";
import StudentDashboard from "./pages/student/DashboardPage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute allowedRoles={["STUDENT"]}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/bookings/new"
            element={
              <ProtectedRoute allowedRoles={["STUDENT"]}>
                <BookingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/bookings"
            element={
              <ProtectedRoute allowedRoles={["STUDENT"]}>
                <BookingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/bookings"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminBookingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/scan"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <QRScanner />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/resources"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <ResourcePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resources"
            element={
              <ProtectedRoute allowedRoles={["STUDENT", "ADMIN"]}>
                <ResourcePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tickets"
            element={
              <ProtectedRoute allowedRoles={["STUDENT", "ADMIN"]}>
                <TicketPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
