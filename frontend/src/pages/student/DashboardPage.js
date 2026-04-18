import StudentLayout from "../../components/layout/StudentLayout";
import StatCard from "../../components/dashboard/StatCard";
import { Calendar, Ticket, Clock } from "lucide-react";

function DashboardPage() {
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
        <button className="bg-blue-600 text-white py-3 rounded-lg font-medium">
          + Book Resource
        </button>

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