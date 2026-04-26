import {BrowserRouter, Routes, Route} from "react-router-dom";
import StudentDashboard from "./pages/student/DashboardPage";
import DashboardPage from "./pages/admin/DashboardPage";
import ResourcePage from "./pages/ResourcePage";
import BookingPage from "./pages/BookingPage";
import TicketPage from "./pages/TicketPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/admin/dashboard" element={<DashboardPage />} />
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
