import { useEffect, useState } from "react";
import StudentLayout from "../../components/layout/StudentLayout";
import BookingCard from "../../components/bookings/BookingCard";
import BookingModal from "../../components/bookings/BookingModal";
import { cancelBooking, getBookings } from "../../services/bookingService";

function BookingPage() {
  const userId = 1;
  const [open, setOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadBookings = async () => {
    try {
      const data = await getBookings(userId);
      console.log("API response:", data);
      setBookings(data);
    } catch (err) {
      console.error("Error loading bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const closeModal = () => {
    setOpen(false);
    setSelectedBooking(null);
  };

  const handleOpenCreate = () => {
    setSelectedBooking(null);
    setOpen(true);
  };

  const handleEditBooking = (booking) => {
    setSelectedBooking(booking);
    setOpen(true);
  };

  const handleRefreshBookings = async () => {
    await loadBookings();
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      await cancelBooking(bookingId);
      await loadBookings();
    } catch (err) {
      console.error("Error cancelling booking:", err);
    }
  };

  return (
    <StudentLayout>
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
            <p className="mt-2 text-sm text-gray-500">
              Manage your resource reservations
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            + Book Resource
          </button>
        </div>

        {loading && (
          <p className="text-gray-500 text-sm">Loading bookings...</p>
        )}

        {!loading && bookings.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500 shadow-sm">
            No bookings found yet. Use the button above to create your first reservation.
          </div>
        )}

        <div className="space-y-4">
          {bookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onEdit={handleEditBooking}
              onCancel={handleCancelBooking}
            />
          ))}
        </div>
      </div>

      {open && (
        <BookingModal
          close={closeModal}
          refresh={handleRefreshBookings}
          booking={selectedBooking}
        />
      )}
    </StudentLayout>
  );
}

export default BookingPage;
