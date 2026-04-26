import { useState } from "react";
import { checkConflict, createBooking, updateBooking } from "../../services/bookingService";

const resourceOptions = [
  "Lab A-101",
  "Auditorium",
  "Meeting Room B-204",
  "Computer Lab C-12",
];

const resourceMap = {
  "Lab A-101": 1,
  Auditorium: 2,
  "Meeting Room B-204": 3,
  "Computer Lab C-12": 4,
};

const resourceNamesById = {
  1: "Lab A-101",
  2: "Auditorium",
  3: "Meeting Room B-204",
  4: "Computer Lab C-12",
};

function getInitialResourceName(booking) {
  if (booking?.resourceName) {
    return booking.resourceName;
  }

  if (booking?.resourceId && resourceNamesById[booking.resourceId]) {
    return resourceNamesById[booking.resourceId];
  }

  return resourceOptions[0];
}

function BookingForm({ close, refresh = async () => {}, booking }) {
  const [formData, setFormData] = useState({
    resourceName: getInitialResourceName(booking),
    date: booking?.date || "",
    startTime: booking?.startTime || "",
    endTime: booking?.endTime || "",
    purpose: booking?.purpose || "",
  });
  const [error, setError] = useState("");
  const [conflict, setConflict] = useState(null);
  const [checking, setChecking] = useState(false);

  const handleConflictCheck = async (data) => {
    if (!data.date || !data.startTime || !data.endTime) {
      setConflict(null);
      return;
    }

    try {
      setChecking(true);

      const payload = {
        resourceId: resourceMap[data.resourceName],
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
      !formData.resourceName ||
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
        userId: booking?.userId || 1,
        resourceId: resourceMap[formData.resourceName],
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
      };

      if (booking?.id) {
        await updateBooking(booking.id, payload);
      } else {
        await createBooking(payload);
      }

      await refresh();
      close();
    } catch (err) {
      setError(err.response?.data || "Booking failed!");
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
        <label htmlFor="resourceName" className="text-sm font-medium text-gray-700">
          Resource
        </label>
        <select
          id="resourceName"
          name="resourceName"
          value={formData.resourceName}
          onChange={handleChange}
          className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
          {resourceOptions.map((resource) => (
            <option key={resource} value={resource}>
              {resource}
            </option>
          ))}
        </select>
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
          <label htmlFor="purpose" className="text-sm font-medium text-gray-700">
            Purpose
          </label>
          <input
            id="purpose"
            name="purpose"
            type="text"
            placeholder="Study session"
            value={formData.purpose}
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
          className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Submit Booking
        </button>
      </div>
    </form>
  );
}

export default BookingForm;
