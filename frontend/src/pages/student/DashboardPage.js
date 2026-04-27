import { useEffect, useState } from "react";
import { Calendar, Clock3, Plus, Ticket } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import StudentLayout from "../../components/layout/StudentLayout";
import BookingModal from "../../components/bookings/BookingModal";
import StatCard from "../../components/dashboard/StatCard";
import { useAuth } from "../../context/AuthContext";
import { getStudentDashboard } from "../../services/dashboardService";

function formatSchedule(booking) {
  return `${booking.date || "No date"} | ${booking.startTime || "--:--"} - ${
    booking.endTime || "--:--"
  }`;
}

function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const response = await getStudentDashboard();
      setData(response.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <StudentLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Welcome back, {user?.name || "Student"}!
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Track your campus bookings, pending approvals, and recent activity from one place.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <Plus size={16} />
              Book Resource
            </button>
            <button
              type="button"
              onClick={() => navigate("/student/bookings")}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              View My Bookings
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            title="My Bookings"
            value={loading ? "..." : data?.myBookings ?? 0}
            icon={<Calendar className="text-white" />}
            color="bg-blue-500"
          />
          <StatCard
            title="Active Tickets"
            value={loading ? "..." : data?.myTickets ?? 0}
            icon={<Ticket className="text-white" />}
            color="bg-emerald-500"
          />
          <StatCard
            title="Pending Approvals"
            value={loading ? "..." : data?.pendingBookings ?? 0}
            icon={<Clock3 className="text-white" />}
            color="bg-amber-500"
          />
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Recent Bookings</h2>
              <p className="mt-1 text-sm text-slate-500">
                Your latest booking requests and approvals.
              </p>
            </div>
          </div>

          {loading && (
            <div className="mt-6 text-sm text-slate-500">Loading recent bookings...</div>
          )}

          {!loading && (!data?.recentBookings || data.recentBookings.length === 0) && (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
              No recent bookings yet.
            </div>
          )}

          {!loading && data?.recentBookings?.length > 0 && (
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {data.recentBookings.map((booking) => {
                const status = booking.status?.toUpperCase?.() || "";
                const badgeClass =
                  status === "APPROVED"
                    ? "bg-green-100 text-green-700"
                    : status === "PENDING"
                      ? "bg-yellow-100 text-yellow-700"
                      : status === "REJECTED"
                        ? "bg-red-100 text-red-700"
                        : "bg-slate-100 text-slate-700";

                return (
                  <div
                    key={booking.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {booking.resourceName || `Booking #${booking.id}`}
                        </h3>
                        <p className="mt-2 text-sm text-slate-500">
                          {formatSchedule(booking)}
                        </p>
                      </div>

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
          )}
        </div>
      </div>

      {open && (
        <BookingModal
          close={() => setOpen(false)}
          refresh={loadDashboard}
        />
      )}
    </StudentLayout>
  );
}

export default DashboardPage;
