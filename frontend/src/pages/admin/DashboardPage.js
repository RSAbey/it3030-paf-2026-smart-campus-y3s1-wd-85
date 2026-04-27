import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Box,
  Calendar,
  QrCode,
  ScanLine,
  Ticket,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout";
import StatCard from "../../components/dashboard/StatCard";
import api from "../../services/api";
import { getAllBookings } from "../../services/bookingService";

const COLORS = ["#2563EB", "#22C55E", "#F59E0B", "#EF4444", "#0F172A"];

function formatRecentDate(date) {
  if (!date) {
    return "No date";
  }

  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function DashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeTickets: 0,
    totalResources: 0,
    activeUsers: 0,
  });
  const [weeklyData, setWeeklyData] = useState([]);
  const [resourceData, setResourceData] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [statsResponse, weeklyResponse, resourceResponse, bookingsResponse] =
          await Promise.all([
            api.get("/dashboard/stats"),
            api.get("/dashboard/weekly-bookings"),
            api.get("/dashboard/resource-distribution"),
            getAllBookings(),
          ]);

        const bookings = Array.isArray(bookingsResponse) ? bookingsResponse : [];
        setStats(statsResponse.data);
        setWeeklyData(Array.isArray(weeklyResponse.data) ? weeklyResponse.data : []);
        setResourceData(
          Array.isArray(resourceResponse.data) ? resourceResponse.data : []
        );
        setRecentBookings(
          [...bookings].sort((left, right) => (right.id || 0) - (left.id || 0)).slice(0, 5)
        );
      } catch (err) {
        console.error(err);
      }
    };

    loadDashboard();
  }, []);

  const approvalBreakdown = useMemo(
    () => [
      {
        label: "Approved",
        value: recentBookings.filter(
          (booking) => booking.status?.toUpperCase() === "APPROVED"
        ).length,
      },
      {
        label: "Pending",
        value: recentBookings.filter(
          (booking) => booking.status?.toUpperCase() === "PENDING"
        ).length,
      },
      {
        label: "Rejected",
        value: recentBookings.filter(
          (booking) => booking.status?.toUpperCase() === "REJECTED"
        ).length,
      },
    ],
    [recentBookings]
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
            <p className="mt-2 text-sm text-slate-500">
              Monitor campus resource demand, approval flow, and recent booking activity.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate("/admin/bookings")}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <Calendar size={16} />
              Review Bookings
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin/scan")}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <ScanLine size={16} />
              Scan QR
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
            color="bg-slate-700"
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">Weekly Bookings</h2>
            <p className="mt-1 text-sm text-slate-500">
              Daily booking volume across the current reporting period.
            </p>
            <div className="mt-6 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total" fill="#2563EB" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">Resource Distribution</h2>
            <p className="mt-1 text-sm text-slate-500">
              Booking share across campus resources.
            </p>
            <div className="mt-6 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={resourceData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={90}
                    innerRadius={50}
                    paddingAngle={3}
                  >
                    {resourceData.map((entry, index) => (
                      <Cell
                        key={`${entry.name}-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_0.7fr]">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">Recent Bookings</h2>
            <p className="mt-1 text-sm text-slate-500">
              Most recent booking requests and approval outcomes.
            </p>

            <div className="mt-6 space-y-4">
              {recentBookings.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
                  No recent bookings available.
                </div>
              )}

              {recentBookings.map((booking) => {
                const status = booking.status?.toUpperCase?.() || "";
                const badgeClass =
                  status === "APPROVED"
                    ? "bg-green-100 text-green-700"
                    : status === "PENDING"
                      ? "bg-yellow-100 text-yellow-700"
                      : status === "REJECTED"
                        ? "bg-red-100 text-red-700"
                        : status === "USED"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-slate-100 text-slate-700";

                return (
                  <div
                    key={booking.id}
                    className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">
                        {booking.resourceName || `Resource #${booking.resourceId}`}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {booking.userName || `User #${booking.userId}`} |{" "}
                        {formatRecentDate(booking.date)} | {booking.startTime} -{" "}
                        {booking.endTime}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {booking.qrCode && (
                        <span className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-mono text-slate-500 ring-1 ring-slate-200">
                          <QrCode size={14} />
                          QR Ready
                        </span>
                      )}
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClass}`}
                      >
                        {status || "UNKNOWN"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">Approval Snapshot</h2>
            <p className="mt-1 text-sm text-slate-500">
              Current outcome mix across the latest booking activity.
            </p>

            <div className="mt-6 space-y-4">
              {approvalBreakdown.map((item, index) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-slate-700">{item.label}</p>
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: COLORS[index] }}
                    />
                  </div>
                  <p className="mt-2 text-3xl font-bold text-slate-900">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default DashboardPage;
