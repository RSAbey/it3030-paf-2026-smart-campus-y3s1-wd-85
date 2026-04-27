import { useEffect, useState } from "react";
import {
  checkConflict,
  createBooking,
  getResources,
  updateBooking,
} from "../../services/bookingService";

function getInitialResourceId(booking) {
  if (booking?.resourceId !== undefined && booking?.resourceId !== null) {
    return String(booking.resourceId);
  }

  return "";
}

function BookingForm({ close, refresh = async () => {}, booking }) {
  const [resources, setResources] = useState([]);
  const [loadingResources, setLoadingResources] = useState(true);
  const [formData, setFormData] = useState({
    resourceId: getInitialResourceId(booking),
    date: booking?.date || "",
    startTime: booking?.startTime || "",
    endTime: booking?.endTime || "",
    reason: booking?.reason || "",
  });
  const [error, setError] = useState("");
  const [conflict, setConflict] = useState(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const loadResources = async () => {
      try {
        const data = await getResources();
        setResources(data);

        if (!booking?.resourceId && booking?.resourceName) {
          const matchedResource = data.find(
            (resource) => resource.name === booking.resourceName
          );

          if (matchedResource) {
            setFormData((currentData) => ({
              ...currentData,
              resourceId: String(matchedResource.id),
            }));
          }
        }
      } catch (err) {
        console.error("Error loading resources:", err);
        setResources([]);
      } finally {
        setLoadingResources(false);
      }
    };

    loadResources();
  }, [booking]);

  const handleConflictCheck = async (data) => {
    if (!data.resourceId || !data.date || !data.startTime || !data.endTime) {
      setConflict(null);
      return;
    }

    try {
      setChecking(true);

      const payload = {
        resourceId: Number(data.resourceId),
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
      };

      const res = await checkConflict(payload);

      setConflict(res.conflict);
    } catch (err) {
      console.error(err);
    } finally {
      setChecking(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => {
      const updated = {
        ...currentData,
        [name]: value,
      };

      setTimeout(() => handleConflictCheck(updated), 300);

      return updated;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !formData.resourceId ||
      !formData.date ||
      !formData.startTime ||
      !formData.endTime
    ) {
      setError("Please fill in all required booking details.");
      return;
    }

    if (formData.endTime <= formData.startTime) {
      setError("End time must be after the start time.");
      return;
    }

    if (conflict === true) {
      setError("This time slot is already booked!");
      return;
    }

    setError("");

    try {
      const payload = {
        resourceId: Number(formData.resourceId),
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        reason: formData.reason,
      };

      if (booking?.id) {
        await updateBooking(booking.id, payload);
      } else {
        await createBooking(payload);
      }

      await refresh();
      close();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || "Booking failed!");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="resourceId" className="text-sm font-medium text-gray-700">
          Resource
        </label>
        <select
          id="resourceId"
          name="resourceId"
          value={formData.resourceId}
          onChange={handleChange}
          disabled={loadingResources || resources.length === 0}
          className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
          <option value="">
            {loadingResources ? "Loading resources..." : "Select a resource"}
          </option>
          {resources.map((resource) => (
            <option key={resource.id} value={resource.id}>
              {resource.name}
            </option>
          ))}
        </select>
        {!loadingResources && resources.length === 0 && (
          <p className="mt-2 text-sm text-red-600">
            No resources available right now.
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="date" className="text-sm font-medium text-gray-700">
            Date
          </label>
          <input
            id="date"
            name="date"
            type="date"
            min={new Date().toISOString().split("T")[0]}
            value={formData.date}
            onChange={handleChange}
            className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label htmlFor="reason" className="text-sm font-medium text-gray-700">
            Reason
          </label>
          <input
            id="reason"
            name="reason"
            type="text"
            placeholder="Study session"
            value={formData.reason}
            onChange={handleChange}
            className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="startTime" className="text-sm font-medium text-gray-700">
            Start Time
          </label>
          <input
            id="startTime"
            name="startTime"
            type="time"
            value={formData.startTime}
            onChange={handleChange}
            className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label htmlFor="endTime" className="text-sm font-medium text-gray-700">
            End Time
          </label>
          <input
            id="endTime"
            name="endTime"
            type="time"
            value={formData.endTime}
            onChange={handleChange}
            className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      {checking && (
        <p className="text-sm text-gray-400">Checking availability...</p>
      )}

      {conflict === true && (
        <p className="text-sm text-red-600">
          Time slot already booked
        </p>
      )}

      {conflict === false && (
        <p className="text-sm text-green-600">
          Time slot available
        </p>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={close}
          className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loadingResources || resources.length === 0 || !formData.resourceId}
          className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Submit Booking
        </button>
      </div>
    </form>
  );
}

export default BookingForm;
