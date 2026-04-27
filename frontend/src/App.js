import { BrowserRouter, Route, Routes } from "react-router-dom";
import QRScanner from "./components/QRScanner";
import DashboardPage from "./pages/admin/DashboardPage";
import AdminBookingPage from "./pages/admin/AdminBookingPage";
import NotificationsPage from "./pages/NotificationsPage";
import ResourcePage from "./pages/ResourcePage";
import SettingsPage from "./pages/SettingsPage";
import TicketPage from "./pages/TicketPage";
import BookingPage from "./pages/student/BookingPage";
import StudentDashboard from "./pages/student/DashboardPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/bookings/new" element={<BookingPage />} />
        <Route path="/student/bookings" element={<BookingPage />} />
        <Route path="/student/notifications" element={<NotificationsPage role="student" />} />
        <Route path="/student/settings" element={<SettingsPage role="student" />} />
        <Route path="/admin/dashboard" element={<DashboardPage />} />
        <Route path="/admin/bookings" element={<AdminBookingPage />} />
        <Route path="/admin/scan" element={<QRScanner />} />
        <Route path="/admin/resources" element={<ResourcePage />} />
        <Route path="/admin/notifications" element={<NotificationsPage role="admin" />} />
        <Route path="/admin/settings" element={<SettingsPage role="admin" />} />
        <Route path="/resources" element={<ResourcePage />} />
        <Route path="/bookings" element={<BookingPage />} />
        <Route path="/tickets" element={<TicketPage role="student" />} />
        <Route path="/student/tickets" element={<TicketPage role="student" />} />
        <Route path="/admin/tickets" element={<TicketPage role="admin" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
