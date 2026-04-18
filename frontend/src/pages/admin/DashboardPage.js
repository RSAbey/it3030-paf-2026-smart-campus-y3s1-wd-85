import AdminLayout from "../../components/layout/AdminLayout";
import StatCard from "../../components/dashboard/StatCard";
import { Calendar, Ticket, Box, Users } from "lucide-react";

function DashboardPage() {
  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Cards */}
      <div className="grid grid-cols-4 gap-6 mb-6">
            <StatCard
                title="Total Bookings"
                value="156"
                icon={<Calendar className="text-white" />}
                color="bg-blue-500"
            />

            <StatCard
                title="Active Tickets"
                value="23"
                icon={<Ticket className="text-white" />}
                color="bg-red-500"
            />

            <StatCard
                title="Total Resources"
                value="89"
                icon={<Box className="text-white" />}
                color="bg-green-500"
            />

            <StatCard
                title="Active Users"
                value="342"
                icon={<Users className="text-white" />}
                color="bg-purple-500"
            />
        </div>

        {/* Charts placeholder */}
        <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="bg-white p-5 rounded-xl shadow">
                <h3 className="font-semibold mb-4">Weekly Bookings</h3>
                <div className="h-48 bg-gray-100 rounded flex items-center justify-center">
                Chart Here
                </div>
            </div>

            <div className="bg-white p-5 rounded-xl shadow">
                <h3 className="font-semibold mb-4">Resource Distribution</h3>
                <div className="h-48 bg-gray-100 rounded flex items-center justify-center">
                Chart Here
                </div>
            </div>
        </div>
        
        {/*Activity Section*/}
        <div className="bg-white p-5 rounded-xl shadow">
             <h3 className="font-semibold mb-4">Recent Activity</h3>

            <div className="space-y-3 text-sm text-gray-600">
                <p>📅 New booking - Room A101</p>
                <p>🛠 Ticket resolved - Lab AC Repair</p>
                <p>📦 Resource added - Projector</p>
            </div>
        </div>
    </AdminLayout>
  );
}

export default DashboardPage;