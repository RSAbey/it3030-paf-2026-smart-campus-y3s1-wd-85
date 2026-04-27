import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getStudentDashboard } from "../../services/dashboardService";
import StudentLayout from "../../components/layout/StudentLayout";
import StatCard from "../../components/dashboard/StatCard";
import { Calendar, Ticket, Clock } from "lucide-react";
import BookingModal from "../../components/bookings/BookingModal";

function DashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const userId = 1; // Replace with actual user ID from auth context
  const [open, setOpen] = useState(false);

  const handleBookingRefresh = async () => {
    try {
      const res = await getStudentDashboard(userId);
      setData(res.data);
      console.log("API response:", res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getStudentDashboard(userId)
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        console.log(err);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <StudentLayout>

      {/* Title */}
      <h1 className="text-2xl font-bold mb-1">
        Welcome back, John!
      </h1>
      <p className="text-gray-500 mb-6">
        Here's what's happening with your campus activities
      </p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <StatCard
          title="Total Bookings"
          value="12"
          icon={<Calendar className="text-white" />}
          color="bg-blue-500"
        />

        <StatCard
          title="Active Tickets"
          value="3"
          icon={<Ticket className="text-white" />}
          color="bg-yellow-500"
        />

        <StatCard
          title="Pending Approvals"
          value="2"
          icon={<Clock className="text-white" />}
          color="bg-red-500"
        />
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button
          onClick={() => setOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          + Book Resource
        </button>
        {open && <BookingModal close={() => setOpen(false)} refresh={handleBookingRefresh} />}

        <button className="border border-blue-600 text-blue-600 py-3 rounded-lg font-medium">
          + Create Ticket
        </button>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-5 rounded-xl shadow">
        <h3 className="font-semibold mb-4">Recent Activity</h3>

        <div className="space-y-3 text-sm text-gray-600">
          <p>🟢 Lab A-101 booking approved (2 hours ago)</p>
          <p>🟡 Projector issue reported (5 hours ago)</p>
          <p>🟡 Room B-205 requested (1 day ago)</p>
          <p>🟢 AC fixed (2 days ago)</p>
        </div>
      </div>

    </StudentLayout>
  );
}

export default DashboardPage;
