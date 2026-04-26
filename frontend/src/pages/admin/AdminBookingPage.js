import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  QrCode,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout";
import {
  approveBooking,
  getAllBookings,
  getResources,
  rejectBooking,
} from "../../services/bookingService";

const statusStyles = {
  APPROVED: "bg-green-100 text-green-700",
  PENDING: "bg-yellow-100 text-yellow-700",
  REJECTED: "bg-red-100 text-red-700",
  CANCELLED: "bg-gray-100 text-gray-700",
};

const monthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
});

const weekdayFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
});

const dayFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function normalizeArrayResponse(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.content)) {
    return response.content;
  }

  if (Array.isArray(response?.data?.data)) {
    return response.data.data;
  }

  if (Array.isArray(response?.data?.content)) {
    return response.data.content;
  }

  return [];
}

function buildCalendarDays(bookings) {
  const safeBookings = Array.isArray(bookings) ? bookings : [];
  const bookingDates = new Set(
    safeBookings.map((booking) => booking?.date).filter(Boolean)
  );
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = firstDay.getDay();
  const days = [];

  for (let i = 0; i < startOffset; i += 1) {
    days.push(null);
  }

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    const date = new Date(year, month, day);
    const isoDate = date.toISOString().split("T")[0];
    days.push({
      day,
      isoDate,
      isToday: isoDate === today.toISOString().split("T")[0],
      isBooked: bookingDates.has(isoDate),
    });
  }

  return {
    label: monthFormatter.format(firstDay),
    weekdays: Array.from({ length: 7 }, (_, index) =>
      weekdayFormatter.format(new Date(2026, 3, 5 + index))
    ),
    days,
  };
}

function AdminBookingPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [message, setMessage] = useState("");

  const loadBookings = async () => {
    try {
      const [bookingsRes, resourcesRes] = await Promise.all([
        getAllBookings(),
        getResources(),
      ]);

      const normalizedBookings = normalizeArrayResponse(bookingsRes);
      console.log(normalizedBookings);
      setBookings(normalizedBookings);
      setResources(normalizeArrayResponse(resourcesRes));
    } catch (err) {
      console.error(err);
      setBookings([]);
      setResources([]);
      setMessage("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const safeBookings = Array.isArray(bookings) ? bookings : [];
  const safeResources = Array.isArray(resources) ? resources : [];

  const resourceNameMap = useMemo(() => {
    return safeResources.reduce((map, resource) => {
      map[resource.id] = resource.name;
      return map;
    }, {});
  }, [safeResources]);

  const calendar = useMemo(() => buildCalendarDays(safeBookings), [safeBookings]);

  const pendingCount = safeBookings.filter(
    (booking) => booking.status === "PENDING"
  ).length;
  const approvedCount = safeBookings.filter(
    (booking) => booking.status === "APPROVED"
  ).length;
  const rejectedCount = safeBookings.filter(
    (booking) => booking.status === "REJECTED"
  ).length;

  const handleApprove = async (id) => {
    try {
      setActionId(id);
      await approveBooking(id);
      setMessage("Booking Approved");
      await loadBookings();
    } catch (err) {
      console.error(err);
      setMessage(
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
    if (!reason) return;

    try {
      setActionId(id);
      await rejectBooking(id, reason);
      setMessage("Booking Rejected");
      await loadBookings();
    } catch (err) {
      console.error(err);
      setMessage(
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
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Booking System</h1>
            <p className="text-sm text-gray-500">
              Manage resource bookings and approval decisions
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate("/admin/scan")}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              <QrCode size={18} />
              Scan QR
            </button>

            <button className="rounded-lg bg-blue-600 px-4 py-2 text-white">
              + New Booking
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-white px-5 py-4 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">Pending</p>
            <p className="mt-1 text-2xl font-bold text-amber-500">
              {pendingCount}
            </p>
          </div>
          <div className="rounded-2xl bg-white px-5 py-4 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">Approved</p>
            <p className="mt-1 text-2xl font-bold text-emerald-500">
              {approvedCount}
            </p>
          </div>
          <div className="rounded-2xl bg-white px-5 py-4 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">Rejected</p>
            <p className="mt-1 text-2xl font-bold text-rose-500">
              {rejectedCount}
            </p>
          </div>
        </div>

        {message && (
          <div className="rounded-2xl bg-white px-5 py-4 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200">
            {message}
          </div>
        )}

        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
              <CalendarDays size={22} />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">
                {calendar.label} - Availability Calendar
              </h2>
              <p className="text-sm text-slate-500">
                Highlighted dates show days with booking activity.
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-7 gap-3">
            {calendar.weekdays.map((weekday) => (
              <div
                key={weekday}
                className="pb-2 text-center text-sm font-semibold uppercase tracking-wide text-slate-500"
              >
                {weekday}
              </div>
            ))}

            {calendar.days.map((day, index) => {
              if (!day) {
                return (
                  <div
                    key={`empty-${index}`}
                    className="h-32 rounded-2xl bg-slate-50"
                  />
                );
              }

              const classes = day.isToday
                ? "bg-blue-600 text-white"
                : day.isBooked
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-slate-50 text-slate-500";

              return (
                <div
                  key={day.isoDate}
                  className={`flex h-32 items-center justify-center rounded-2xl text-lg font-semibold ${classes}`}
                >
                  {day.day}
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex flex-wrap gap-6 border-t border-slate-100 pt-4 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <span className="h-4 w-4 rounded bg-blue-600"></span>
              Today
            </div>
            <div className="flex items-center gap-2">
              <span className="h-4 w-4 rounded bg-emerald-100"></span>
              Booked
            </div>
            <div className="flex items-center gap-2">
              <span className="h-4 w-4 rounded bg-slate-100"></span>
              Available
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="border-b border-slate-100 px-6 py-5">
            <h2 className="text-3xl font-semibold text-slate-900">
              All Bookings
            </h2>
          </div>

          {loading && (
            <div className="px-6 py-8 text-sm text-slate-500">
              Loading bookings...
            </div>
          )}

          {!loading && safeBookings.length === 0 && (
            <div className="px-6 py-8 text-sm text-slate-500">
              No bookings found.
            </div>
          )}

          {!loading && safeBookings.length > 0 && (
            <div className="divide-y divide-slate-100">
              {safeBookings.map((booking) => {
                const bookingStatus = booking.status?.toUpperCase?.() || "";
                const resourceName =
                  booking.resourceName ||
                  resourceNameMap[booking.resourceId] ||
                  `Resource #${booking.resourceId}`;

                const isActionLoading = actionId === booking.id;

                return (
                  <div
                    key={booking.id}
                    className="flex flex-col gap-4 px-6 py-6 xl:flex-row xl:items-center xl:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-2xl font-semibold text-slate-900">
                          {resourceName}
                        </h3>
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            statusStyles[bookingStatus] ||
                            "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {bookingStatus || booking.status}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-5 text-sm text-slate-500">
                        <div className="flex items-center gap-2">
                          <CalendarDays size={16} />
                          {booking.date
                            ? dayFormatter.format(
                                new Date(`${booking.date}T00:00:00`)
                              )
                            : "No date"}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock3 size={16} />
                          {booking.startTime} - {booking.endTime}
                        </div>
                        <div>Booked by: User #{booking.userId}</div>
                      </div>

                      {booking.reason && (
                        <p className="mt-3 text-sm text-rose-600">
                          Reason: {booking.reason}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {bookingStatus === "APPROVED" && (
                        <div className="flex items-center gap-2 text-emerald-500">
                          <ShieldCheck size={24} />
                        </div>
                      )}

                      {bookingStatus === "REJECTED" && (
                        <div className="flex items-center gap-2 text-rose-500">
                          <XCircle size={24} />
                        </div>
                      )}

                      {bookingStatus === "PENDING" && (
                        <div className="mt-2 flex gap-2">
                          <button
                            onClick={() => handleApprove(booking.id)}
                            disabled={isActionLoading}
                            className="rounded bg-green-500 px-3 py-1 text-white disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isActionLoading ? "Updating..." : "Approve"}
                          </button>

                          <button
                            onClick={() => handleReject(booking.id)}
                            disabled={isActionLoading}
                            className="rounded bg-red-500 px-3 py-1 text-white disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isActionLoading ? "Updating..." : "Reject"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminBookingPage;
