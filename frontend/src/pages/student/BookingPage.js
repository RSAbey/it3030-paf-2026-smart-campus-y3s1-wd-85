import { useEffect, useState } from "react";
import StudentLayout from "../../components/layout/StudentLayout";
import BookingCard from "../../components/bookings/BookingCard";
import BookingModal from "../../components/bookings/BookingModal";
import { getBookings } from "../../services/bookingService";

function BookingPage() {
  const [open, setOpen] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔥 LOAD BOOKINGS FROM BACKEND
  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
  try {
    const res = await getBookings();

    console.log("API RESPONSE:", res); // 🔥 debug

    // ✅ FIX HERE
    if (Array.isArray(res)) {
      setBookings(res);
    } else if (Array.isArray(res.data)) {
      setBookings(res.data);
    } else if (Array.isArray(res.content)) {
      setBookings(res.content);
    } else {
      setBookings([]);
    }

  } catch (err) {
    console.error("Error loading bookings:", err);
    setBookings([]);
  } finally {
    setLoading(false);
  }
};

  // 🔥 AFTER CREATE → REFRESH LIST
  const handleCreateBooking = async () => {
    await loadBookings();
    setOpen(false);
  };

  // 🔥 CANCEL (optional backend later)
  const handleCancelBooking = (bookingId) => {
    setBookings((current) =>
      current.filter((b) => b.id !== bookingId)
    );
  };

  return (
    <StudentLayout>
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
            <p className="mt-2 text-sm text-gray-500">
              Manage your resource reservations
            </p>
          </div>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            + Book Resource
          </button>
        </div>

        {/* LOADING */}
        {loading && (
          <p className="text-gray-500 text-sm">Loading bookings...</p>
        )}

        {/* EMPTY */}
        {!loading && bookings.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500 shadow-sm">
            No bookings found yet. Use the button above to create your first reservation.
          </div>
        )}

        {/* LIST */}
        <div className="space-y-4">
          {bookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onCancel={handleCancelBooking}
            />
          ))}
        </div>

      </div>

      {/* 🔥 MODAL */}
      {open && (
        <BookingModal
          close={() => setOpen(false)}
          refresh={handleCreateBooking}
        />
      )}
    </StudentLayout>
  );
}

export default BookingPage;