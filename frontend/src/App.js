import { BrowserRouter, Routes, Route } from "react-router-dom";
import StudentDashboard from "./pages/student/DashboardPage";
import DashboardPage from "./pages/admin/DashboardPage";
import ResourcePage from "./pages/ResourcePage";
import BookingPage from "./pages/BookingPage";
import TicketPage from "./pages/TicketPage";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const adminOnly = ["admin"];
const studentOnly = ["student"];
const allRoles = ["student", "admin"];

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
