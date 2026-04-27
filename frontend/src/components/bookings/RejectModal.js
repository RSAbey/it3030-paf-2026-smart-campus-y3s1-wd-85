import { useState } from "react";

function RejectModal({ onClose, onConfirm }) {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    onConfirm(reason.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-lg font-semibold">Reject Booking</h2>

        <input
          type="text"
          placeholder="Enter rejection reason..."
          className="mb-4 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
        />

        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="rounded-lg bg-gray-200 px-4 py-2 hover:bg-gray-300"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            type="button"
            className="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={handleConfirm}
            disabled={!reason.trim()}
          >
            Confirm Reject
          </button>
        </div>
      </div>
    </div>
  );
}

export default RejectModal;