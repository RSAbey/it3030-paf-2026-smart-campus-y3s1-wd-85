import { useEffect, useState } from "react";
import StudentLayout from "../../components/layout/StudentLayout";
import BookingCard from "../../components/bookings/BookingCard";
import BookingModal from "../../components/bookings/BookingModal";

const mockBookings = [
  {
    id: 1,
    resourceName: "Lab A-101",
    date: "2026-04-28",
    startTime: "09:00",
    endTime: "11:00",
    status: "APPROVED",
    qrCode: "SC-BOOK-10021",
  },
  {
    id: 2,
    resourceName: "Auditorium",
    date: "2026-04-30",
    startTime: "14:00",
    endTime: "16:00",
    status: "PENDING",
  },
  {
    id: 3,
    resourceName: "Meeting Room B-204",
    date: "2026-05-02",
    startTime: "10:00",
    endTime: "11:30",
    status: "REJECTED",
    reason: "This room is reserved for a faculty event during the requested time.",
  },
];

function BookingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    // TODO: Fetch bookings from backend (GET /api/booking)
    setBookings(mockBookings);
  }, []);

  const handleCreateBooking = (newBooking) => {
    setBookings((currentBookings) => [newBooking, ...currentBookings]);
    setIsModalOpen(false);
  };

  const handleCancelBooking = (bookingId) => {
    // TODO: Cancel booking (PUT /api/booking/{id})
    setBookings((currentBookings) =>
      currentBookings.filter((booking) => booking.id !== bookingId)
    );
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
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            + Book Resource
          </button>
        </div>

        <div className="space-y-4">
          {bookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onCancel={handleCancelBooking}
            />
          ))}
        </div>

        {bookings.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500 shadow-sm">
            No bookings found yet. Use the button above to create your first reservation.
          </div>
        )}
      </div>

      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateBooking={handleCreateBooking}
      />
    </StudentLayout>
  );
}

export default BookingPage;
