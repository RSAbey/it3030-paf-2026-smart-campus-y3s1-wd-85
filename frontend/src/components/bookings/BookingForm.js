import { useState } from "react";

const resourceOptions = [
  "Lab A-101",
  "Auditorium",
  "Meeting Room B-204",
  "Computer Lab C-12",
];

function BookingForm({ close, onCreateBooking }) {
  const [formData, setFormData] = useState({
    resourceName: resourceOptions[0],
    date: "",
    startTime: "",
    endTime: "",
    purpose: "",
  });
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
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

    setError("");

    const newBooking = {
      id: Date.now(),
      resourceName: formData.resourceName,
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      purpose: formData.purpose,
      status: "PENDING",
    };

    // TODO: Create booking (POST /api/booking)
    onCreateBooking(newBooking);
    close();
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
