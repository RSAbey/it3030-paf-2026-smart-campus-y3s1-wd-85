import BookingForm from "./BookingForm";

function BookingModal({ isOpen, onClose, onCreateBooking }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative z-10 w-full max-w-2xl rounded-2xl border border-white/70 bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Book Resource</h2>
            <p className="mt-1 text-sm text-gray-500">
              Fill in the details below to request a new reservation.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            x
          </button>
        </div>

        <BookingForm close={onClose} onCreateBooking={onCreateBooking} />
      </div>
    </div>
  );
}

export default BookingModal;
