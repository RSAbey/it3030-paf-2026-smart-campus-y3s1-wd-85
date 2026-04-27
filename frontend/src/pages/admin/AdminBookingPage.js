import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  QrCode,
  Search,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout";
import {
  approveBooking,
  getAllBookings,
  rejectBooking,
} from "../../services/bookingService";

const statusStyles = {
  APPROVED: "bg-green-100 text-green-700",
  PENDING: "bg-yellow-100 text-yellow-700",
  REJECTED: "bg-red-100 text-red-700",
  CANCELLED: "bg-gray-100 text-gray-700",
  USED: "bg-blue-100 text-blue-700",
};

const filters = ["ALL", "PENDING", "APPROVED", "REJECTED", "USED", "CANCELLED"];

function formatBookingDate(date) {
  if (!date) {
    return "No date";
  }

  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatBookingTime(startTime, endTime) {
  if (!startTime || !endTime) {
    return "No time";
  }

  return `${startTime.slice(0, 5)} - ${endTime.slice(0, 5)}`;
}

function AdminBookingPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");

  const loadBookings = async () => {
    try {
      setLoading(true);
      const data = await getAllBookings();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setBookings([]);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const pendingCount = bookings.filter(
    (booking) => booking.status?.toUpperCase() === "PENDING"
  ).length;
  const approvedCount = bookings.filter(
    (booking) => booking.status?.toUpperCase() === "APPROVED"
  ).length;
  const rejectedCount = bookings.filter(
    (booking) => booking.status?.toUpperCase() === "REJECTED"
  ).length;
  const usedCount = bookings.filter(
    (booking) => booking.status?.toUpperCase() === "USED"
  ).length;

  const filteredBookings = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return bookings.filter((booking) => {
      const status = booking.status?.toUpperCase() || "";
      const matchesFilter = activeFilter === "ALL" || status === activeFilter;
      const matchesSearch =
        !normalizedSearch ||
        booking.resourceName?.toLowerCase().includes(normalizedSearch) ||
        booking.userName?.toLowerCase().includes(normalizedSearch) ||
        booking.location?.toLowerCase().includes(normalizedSearch) ||
        booking.reason?.toLowerCase().includes(normalizedSearch);

      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, bookings, searchTerm]);

  const handleApprove = async (id) => {
    try {
      setActionId(id);
      await approveBooking(id);
      toast.success("Booking approved");
      await loadBookings();
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message ||
          err.response?.data ||
          "Failed to approve booking"
      );
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (id) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) {
      return;
    }

    try {
      setActionId(id);
      await rejectBooking(id, reason);
      toast.success("Booking rejected");
      await loadBookings();
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message ||
          err.response?.data ||
          "Failed to reject booking"
      );
    } finally {
      setActionId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Booking Control</h1>
            <p className="mt-2 text-sm text-slate-500">
              Review pending requests, approve access, and track scanned QR entries.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate("/admin/scan")}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <QrCode size={16} />
              Open QR Scanner
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">Pending Approval</p>
            <p className="mt-2 text-3xl font-bold text-amber-500">{pendingCount}</p>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">Approved</p>
            <p className="mt-2 text-3xl font-bold text-green-500">{approvedCount}</p>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">Rejected</p>
            <p className="mt-2 text-3xl font-bold text-red-500">{rejectedCount}</p>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">Used Entries</p>
            <p className="mt-2 text-3xl font-bold text-blue-500">{usedCount}</p>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full max-w-xl">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by student, resource, location, or reason"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    activeFilter === filter
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="border-b border-slate-100 px-6 py-5">
            <h2 className="text-2xl font-semibold text-slate-900">All Bookings</h2>
          </div>

          {loading && (
            <div className="px-6 py-8 text-sm text-slate-500">Loading bookings...</div>
          )}

          {!loading && filteredBookings.length === 0 && (
            <div className="px-6 py-10 text-center text-sm text-slate-500">
              No bookings match the current filters.
            </div>
          )}

          {!loading && filteredBookings.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50">
                  <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-6 py-4 font-semibold">Resource</th>
                    <th className="px-6 py-4 font-semibold">Student</th>
                    <th className="px-6 py-4 font-semibold">Schedule</th>
                    <th className="px-6 py-4 font-semibold">Location</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">QR</th>
                    <th className="px-6 py-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBookings.map((booking) => {
                    const status = booking.status?.toUpperCase() || "";
                    const isActionLoading = actionId === booking.id;

                    return (
                      <tr key={booking.id} className="align-top">
                        <td className="px-6 py-5">
                          <div>
                            <p className="font-semibold text-slate-900">
                              {booking.resourceName || `Resource #${booking.resourceId}`}
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                              {booking.reason || "No booking reason provided"}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div>
                            <p className="font-medium text-slate-800">
                              {booking.userName || `User #${booking.userId}`}
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                              Booking #{booking.id}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="space-y-2 text-sm text-slate-600">
                            <div className="flex items-center gap-2">
                              <CalendarDays size={15} className="text-slate-400" />
                              {formatBookingDate(booking.date)}
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock3 size={15} className="text-slate-400" />
                              {formatBookingTime(booking.startTime, booking.endTime)}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-sm text-slate-600">
                          {booking.location || "Location not available"}
                        </td>
                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              statusStyles[status] || "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {status || booking.status}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-sm text-slate-600">
                          {booking.qrCode ? (
                            <span className="inline-flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 font-mono text-xs text-slate-600">
                              <QrCode size={14} />
                              {booking.qrCode.slice(0, 14)}...
                            </span>
                          ) : (
                            "Not generated"
                          )}
                        </td>
                        <td className="px-6 py-5">
                          {status === "PENDING" ? (
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => handleApprove(booking.id)}
                                disabled={isActionLoading}
                                className="inline-flex items-center gap-2 rounded-lg bg-green-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                <CheckCircle2 size={15} />
                                {isActionLoading ? "Updating..." : "Approve"}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleReject(booking.id)}
                                disabled={isActionLoading}
                                className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                <XCircle size={15} />
                                {isActionLoading ? "Updating..." : "Reject"}
                              </button>
                            </div>
                          ) : (
                            <span className="text-sm text-slate-400">No actions</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminBookingPage;
