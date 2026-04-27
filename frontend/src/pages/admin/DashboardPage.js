import AdminLayout from "../../components/layout/AdminLayout";
import StatCard from "../../components/dashboard/StatCard";
import { Calendar, Ticket, Box, Users, ScanLine } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import api from "../../services/api";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";

function DashboardPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [resources, setResources] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeTickets: 0,
    totalResources: 0,
    activeUsers: 0
  });
  const [weeklyData, setWeeklyData] = useState([]);
  const [resourceData, setResourceData] = useState([]);
  const COLORS = ["#2563EB", "#22C55E", "#F59E0B", "#EF4444"];

  useEffect(() => {
    api.get("/dashboard/stats")
        .then((res) => setStats(res.data))
        .catch((err) => console.log(err));
     api.get("/dashboard/weekly-bookings")
        .then((res) => setWeeklyData(res.data))
        .catch((err) => console.log(err));
     api.get("/dashboard/resource-distribution")
        .then((res) => setResourceData(res.data))
        .catch((err) => console.log(err));
    }, []);

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        {/* <button
          type="button"
          onClick={() => navigate("/admin/scan")}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <ScanLine size={16} />
          Scan QR
        </button> */}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-4 gap-6 mb-6">
            <StatCard
                title="Total Bookings"
                value={stats.totalBookings}
                icon={<Calendar className="text-white" />}
                color="bg-blue-500"
            />

            <StatCard
                title="Active Tickets"
                value={stats.activeTickets}
                icon={<Ticket className="text-white" />}
                color="bg-red-500"
            />

            <StatCard
                title="Total Resources"
                value={stats.totalResources}
                icon={<Box className="text-white" />}
                color="bg-green-500"
            />

            <StatCard
                title="Active Users"
                value={stats.activeUsers}
                icon={<Users className="text-white" />}
                color="bg-purple-500"
            />
        </div>

        {/* Charts placeholder */}
        <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="bg-white p-5 rounded-xl shadow">
                <h3 className="font-semibold mb-4">Weekly Bookings</h3>
                <div className="h-48 bg-gray-100 rounded flex items-center justify-center">
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={weeklyData}>
                            <XAxis dataKey="day" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="total" fill="#2563EB" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white p-5 rounded-xl shadow">
                <h3 className="font-semibold mb-4">Resource Distribution</h3>
                <div className="h-48 bg-gray-100 rounded flex items-center justify-center">
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie
                            data={resourceData}
                            dataKey="value"
                            nameKey="name"
                            outerRadius={70}
                            label
                            >
                            {resourceData.map((entry, index) => (
                                <Cell key={index} fill={COLORS[index % COLORS.length]} />
                            ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
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
