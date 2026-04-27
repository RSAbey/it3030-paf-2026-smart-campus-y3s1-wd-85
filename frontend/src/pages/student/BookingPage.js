import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import StudentLayout from "../../components/layout/StudentLayout";
import BookingCard from "../../components/bookings/BookingCard";
import BookingModal from "../../components/bookings/BookingModal";
import { cancelBooking, getBookings } from "../../services/bookingService";

const filters = ["ALL", "PENDING", "APPROVED", "REJECTED", "CANCELLED", "USED"];

function BookingPage() {
  const [open, setOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("ALL");

  const loadBookings = async () => {
    try {
      const data = await getBookings();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error("Failed to load bookings");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const filteredBookings = useMemo(() => {
    if (activeFilter === "ALL") {
      return bookings;
    }

    return bookings.filter(
      (booking) => booking.status?.toUpperCase() === activeFilter
    );
  }, [activeFilter, bookings]);

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

  const handleCancelBooking = async (bookingId) => {
    try {
      await cancelBooking(bookingId);
      toast.success("Booking cancelled");
      await loadBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data || "Failed to cancel booking");
    }
  };

  return (
    <StudentLayout>
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
            <p className="mt-2 text-sm text-gray-500">
              Manage your resource reservations and approved entry QR passes.
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

        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                activeFilter === filter
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 shadow-sm ring-1 ring-gray-200 hover:bg-gray-50"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {loading && <p className="text-sm text-gray-500">Loading bookings...</p>}

        {!loading && filteredBookings.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500 shadow-sm">
            No bookings found for the selected filter.
          </div>
        )}

        {!loading && filteredBookings.length > 0 && (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onEdit={handleEditBooking}
                onCancel={handleCancelBooking}
              />
            ))}
          </div>
        )}
      </div>

      {open && (
        <BookingModal
          close={closeModal}
          refresh={loadBookings}
          booking={selectedBooking}
        />
      )}
    </StudentLayout>
  );
}

export default BookingPage;
