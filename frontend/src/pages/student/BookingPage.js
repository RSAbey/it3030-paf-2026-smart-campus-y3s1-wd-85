import { useState } from "react";
import BookingForm from "../../components/bookings/BookingForm";
import BookingModal from "../../components/bookings/BookingModal";

function BookingPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="p-6 relative">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        {/* <h2 className="text-xl font-semibold">My Bookings</h2> */}

        <button
          onClick={() => setOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Book Resource
        </button>
      </div>

      {/* Booking List (your existing UI here) */}

      {/* Modal */}
      {open && <BookingModal close={() => setOpen(false)} />}
    </div>
  );
}

export default BookingPage;