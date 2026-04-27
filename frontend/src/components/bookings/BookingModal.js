import BookingForm from "./BookingForm";

function BookingModal({ close, refresh, booking }) {
  const mode = booking ? "edit" : "create";

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={close}
      ></div>

      <div className="bg-white p-6 rounded-xl z-50 w-[400px]">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">
            {mode === "edit" ? "Edit Booking" : "Book Resource"}
          </h2>

          <button
            type="button"
            onClick={close}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 transition hover:bg-gray-50"
          >
            Close
          </button>
        </div>

        <BookingForm
          key={booking?.id ?? "create"}
          close={close}
          refresh={refresh}
          booking={booking}
        />
      </div>
    </div>
  );
}

export default BookingModal;
