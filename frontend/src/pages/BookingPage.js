import { useCallback, useEffect, useMemo, useState } from "react";
import { Calendar, RefreshCw, XCircle } from "lucide-react";
import api from "../services/api";

const initialForm = {
  resourceId: "",
  date: "",
  startTime: "",
  endTime: "",
};

function getErrorMessage(error, fallback) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
}

function BookingPage() {
  const [resources, setResources] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [userId, setUserId] = useState(localStorage.getItem("userId") || "1");
  const [resourcesLoading, setResourcesLoading] = useState(false);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [checkingConflict, setCheckingConflict] = useState(false);
  const [conflict, setConflict] = useState(false);
  const [conflictMessage, setConflictMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const resourcesById = useMemo(() => {
    return resources.reduce((map, resource) => {
      map[String(resource.id)] = resource;
      return map;
    }, {});
  }, [resources]);

  const loadResources = useCallback(async () => {
    setResourcesLoading(true);
    setError("");

    try {
      // Backend: GET /api/resources for the booking resource dropdown.
      const response = await api.get("/resources");
      setResources(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to load resources."));
    } finally {
      setResourcesLoading(false);
    }
  }, []);

  const loadBookings = useCallback(async (selectedUserId) => {
    if (!selectedUserId) {
      setBookings([]);
      return;
    }

    setBookingsLoading(true);
    setError("");

    try {
      // Backend: GET /api/booking?userId={id} to show bookings for one user.
      const response = await api.get("/booking", {
        params: { userId: selectedUserId },
      });
      setBookings(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to load bookings."));
    } finally {
      setBookingsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadResources();
  }, [loadResources]);

  useEffect(() => {
    loadBookings(userId);
  }, [loadBookings, userId]);

  useEffect(() => {
    const hasAllConflictFields =
      form.resourceId && form.date && form.startTime && form.endTime;

    setConflict(false);
    setConflictMessage("");

    if (!hasAllConflictFields) {
      return;
    }

    if (form.startTime >= form.endTime) {
      setConflictMessage("End time must be after start time.");
      return;
    }

    const timeoutId = setTimeout(async () => {
      setCheckingConflict(true);

      try {
        // Backend: GET /api/booking/conflict validates same-resource time overlap live.
        const response = await api.get("/booking/conflict", {
          params: {
            resourceId: form.resourceId,
            date: form.date,
            startTime: form.startTime,
            endTime: form.endTime,
          },
        });

        const hasConflict = Boolean(response.data?.conflict);
        setConflict(hasConflict);
        setConflictMessage(
          hasConflict
            ? "Selected resource is already booked for this time."
            : "Selected resource is available for this time."
        );
      } catch (err) {
        setConflictMessage(getErrorMessage(err, "Unable to validate conflict."));
      } finally {
        setCheckingConflict(false);
      }
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [form.resourceId, form.date, form.startTime, form.endTime]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!userId) {
      setError("User ID is required.");
      return;
    }

    if (form.startTime && form.endTime && form.startTime >= form.endTime) {
      setError("End time must be after start time.");
      return;
    }

    if (conflict) {
      setError("Please choose a different resource or time slot.");
      return;
    }

    setSaving(true);

    try {
      // Backend: POST /api/booking creates a booking after server-side conflict validation.
      await api.post("/booking", {
        userId: Number(userId),
        resourceId: Number(form.resourceId),
        date: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
        status: "PENDING",
      });

      setForm(initialForm);
      setConflict(false);
      setConflictMessage("");
      setSuccess("Booking request created.");
      loadBookings(userId);
    } catch (err) {
      if (err?.response?.status === 409) {
        setConflict(true);
      }

      setError(getErrorMessage(err, "Unable to create booking."));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async (bookingId) => {
    setError("");
    setSuccess("");

    try {
      // Backend: PUT /api/booking/{id}/cancel marks the booking as CANCELLED.
      await api.put(`/booking/${bookingId}/cancel`);
      setSuccess("Booking cancelled.");
      loadBookings(userId);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to cancel booking."));
    }
  };

  const getResourceLabel = (resourceId) => {
    const resource = resourcesById[String(resourceId)];

    if (!resource) {
      return `Resource #${resourceId || "N/A"}`;
    }

    return `${resource.name || "Unnamed resource"}${
      resource.location ? ` - ${resource.location}` : ""
    }`;
  };

  const getStatusClass = (status) => {
    switch ((status || "").toUpperCase()) {
      case "APPROVED":
        return "bg-green-100 text-green-700";
      case "REJECTED":
        return "bg-red-100 text-red-700";
      case "CANCELLED":
        return "bg-gray-200 text-gray-600";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
            <p className="text-sm text-gray-500">Create and manage resource bookings</p>
          </div>
          <button
            type="button"
            onClick={() => loadBookings(userId)}
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          <form onSubmit={handleSubmit} className="rounded-lg bg-white p-5 shadow">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
              <Calendar size={18} />
              New Booking
            </h2>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  User ID
                </label>
                <input
                  type="number"
                  min="1"
                  value={userId}
                  onChange={(event) => setUserId(event.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Resource
                </label>
                <select
                  name="resourceId"
                  value={form.resourceId}
                  onChange={handleInputChange}
                  required
                  disabled={resourcesLoading}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                >
                  <option value="">
                    {resourcesLoading ? "Loading resources..." : "Select a resource"}
                  </option>
                  {resources.map((resource) => (
                    <option key={resource.id} value={resource.id}>
                      {resource.name || "Unnamed resource"}
                      {resource.type ? ` (${resource.type})` : ""}
                      {resource.capacity ? ` - ${resource.capacity} seats` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Start
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    value={form.startTime}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    End
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    value={form.endTime}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {conflictMessage && (
                <p
                  className={`text-sm ${
                    conflict ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {checkingConflict ? "Checking availability..." : conflictMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={saving || checkingConflict || conflict}
                className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {saving ? "Creating..." : "Create Booking"}
              </button>
            </div>
          </form>

          <div className="rounded-lg bg-white p-5 shadow">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">My Bookings</h2>
              <span className="text-sm text-gray-500">
                {bookingsLoading ? "Loading..." : `${bookings.length} bookings`}
              </span>
            </div>

            {bookings.length === 0 && !bookingsLoading ? (
              <div className="rounded-md border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
                No bookings found for this user.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b text-xs uppercase text-gray-500">
                    <tr>
                      <th className="py-3 pr-3">Resource</th>
                      <th className="py-3 pr-3">Date</th>
                      <th className="py-3 pr-3">Time</th>
                      <th className="py-3 pr-3">Status</th>
                      <th className="py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {bookings.map((booking) => {
                      const status = booking.status || "PENDING";
                      const isCancelled = status.toUpperCase() === "CANCELLED";

                      return (
                        <tr key={booking.id}>
                          <td className="py-3 pr-3 text-gray-900">
                            {getResourceLabel(booking.resourceId)}
                          </td>
                          <td className="py-3 pr-3 text-gray-600">
                            {booking.date || "N/A"}
                          </td>
                          <td className="py-3 pr-3 text-gray-600">
                            {booking.startTime || "N/A"} - {booking.endTime || "N/A"}
                          </td>
                          <td className="py-3 pr-3">
                            <span
                              className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusClass(
                                status
                              )}`}
                            >
                              {status}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleCancel(booking.id)}
                              disabled={isCancelled}
                              className="inline-flex items-center gap-1 rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400"
                            >
                              <XCircle size={14} />
                              Cancel
                            </button>
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
      </div>
    </div>
  );
}

export default BookingPage;
