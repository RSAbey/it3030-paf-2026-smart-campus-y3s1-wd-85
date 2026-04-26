import BookingForm from "./BookingForm";

function BookingModal({ close, refresh, booking }) {
  const mode = booking ? "edit" : "create";

  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={close}
      ></div>

      <div className="bg-white p-6 rounded-xl z-50 w-[400px]">
        <h2 className="text-lg font-semibold mb-4">
          {mode === "edit" ? "Edit Booking" : "Book Resource"}
        </h2>

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
