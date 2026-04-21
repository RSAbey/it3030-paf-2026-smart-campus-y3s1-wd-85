import { useState, useEffect } from "react";
import { createBooking } from "../../services/bookingService";
import axios from "axios";

function BookingForm() {
  const [form, setForm] = useState({
    userId: 1,
    resourceId: "",
    date: "",
    startTime: "",
    endTime: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [checking, setChecking] = useState(false);
  const [conflict, setConflict] = useState(false);

  // 🔥 LIVE CONFLICT CHECK
  useEffect(() => {
    if (form.resourceId && form.date && form.startTime && form.endTime) {
      checkConflict();
    }
  }, [form]);

  const checkConflict = async () => {
    try {
      setChecking(true);
      const res = await axios.post(
        "http://localhost:8080/api/booking/check",
        form
      );

      setConflict(res.data.conflict);
    } catch (err) {
      console.log(err);
    } finally {
      setChecking(false);
    }
  };

  // 🔥 VALIDATION
  const validate = () => {
    if (!form.resourceId || !form.date || !form.startTime || !form.endTime) {
      return "All fields are required";
    }

    if (form.endTime <= form.startTime) {
      return "End time must be after start time";
    }

    return "";
  };

  // 🔥 SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (conflict) {
      setError("Time slot already booked!");
      return;
    }

    try {
      await createBooking(form);
      setSuccess("Booking successful!");
      setError("");

      // reset form
      setForm({
        userId: 1,
        resourceId: "",
        date: "",
        startTime: "",
        endTime: "",
      });
    } catch (err) {
      setError(err.response?.data || "Booking failed");
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-xl">
      <h2 className="text-xl font-semibold mb-4">Book Resource</h2>

      {/* ERROR */}
      {error && (
        <div className="bg-red-100 text-red-600 p-2 rounded mb-3 text-sm">
          {error}
        </div>
      )}

      {/* SUCCESS */}
      {success && (
        <div className="bg-green-100 text-green-600 p-2 rounded mb-3 text-sm">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* RESOURCE */}
        <div>
          <label className="text-sm text-gray-600">Resource</label>
          <input
            type="number"
            placeholder="Enter resource ID"
            className="w-full mt-1 p-2 border rounded"
            value={form.resourceId}
            onChange={(e) =>
              setForm({ ...form, resourceId: e.target.value })
            }
          />
        </div>

        {/* DATE */}
        <div>
          <label className="text-sm text-gray-600">Date</label>
          <input
            type="date"
            className="w-full mt-1 p-2 border rounded"
            min={new Date().toISOString().split("T")[0]}
            value={form.date}
            onChange={(e) =>
              setForm({ ...form, date: e.target.value })
            }
          />
        </div>

        {/* TIME */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-gray-600">Start Time</label>
            <input
              type="time"
              className="w-full mt-1 p-2 border rounded"
              value={form.startTime}
              onChange={(e) =>
                setForm({ ...form, startTime: e.target.value })
              }
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">End Time</label>
            <input
              type="time"
              className="w-full mt-1 p-2 border rounded"
              value={form.endTime}
              onChange={(e) =>
                setForm({ ...form, endTime: e.target.value })
              }
            />
          </div>
        </div>

        {/* 🔥 CONFLICT STATUS */}
        {checking && (
          <p className="text-blue-500 text-sm">Checking availability...</p>
        )}

        {!checking && form.startTime && form.endTime && (
          <p
            className={`text-sm ${
              conflict ? "text-red-500" : "text-green-500"
            }`}
          >
            {conflict
              ? "❌ Time slot not available"
              : "✅ Time slot available"}
          </p>
        )}

        {/* BUTTON */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Book Now
        </button>
      </form>
    </div>
  );

  function BookingForm({ close }) {

    const handleSubmit = async (e) => {
      e.preventDefault();

      // your API call...

      alert("Booking created!");

      close(); // 🔥 modal close after success
    };

    return (
      <form onSubmit={handleSubmit}>
        {/* your fields */}

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Book
        </button>
      </form>
    );
  }
}

export default BookingForm;