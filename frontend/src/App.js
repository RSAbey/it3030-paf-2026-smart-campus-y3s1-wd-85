import {BrowserRouter, Routes, Route} from "react-router-dom";
import StudentDashboard from "./pages/student/DashboardPage";
import DashboardPage from "./pages/admin/DashboardPage";
import AdminBookingPage from "./pages/admin/AdminBookingPage";
import BookingPage from "./pages/student/BookingPage";
import ResourcePage from "./pages/ResourcePage";
import TicketPage from "./pages/TicketPage";
import LoginPage from "./pages/LoginPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/admin/dashboard" element={<DashboardPage />} />
        <Route path="/admin/bookings" element={<AdminBookingPage />} />
        <Route path="/student/bookings/new" element={<BookingPage />} />
        <Route path="/student/bookings" element={<BookingPage />} />
        <Route path="/resources" element={<ResourcePage />} />
        <Route path="/tickets" element={<TicketPage />} />  
      </Routes>
    </BrowserRouter>
  );
  
}

export default App;
