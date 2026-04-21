import BookingForm from "./BookingForm";

function BookingModal({ close }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">

      {/* Background Blur */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={close}
      ></div>

      {/* Modal Box */}
      <div className="relative bg-white rounded-xl shadow-xl w-[500px] p-6 z-50">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Book Resource</h2>

          <button onClick={close} className="text-gray-500 text-xl">
            ✕
          </button>
        </div>

        {/* Form */}
        <BookingForm close={close} />
      </div>
    </div>
  );
}

export default BookingModal;