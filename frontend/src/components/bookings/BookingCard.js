import { CalendarDays, Clock3, QrCode, XCircle } from "lucide-react";

const statusStyles = {
  APPROVED: "bg-green-100 text-green-700",
  PENDING: "bg-yellow-100 text-yellow-700",
  REJECTED: "bg-red-100 text-red-700",
  CANCELLED: "bg-gray-100 text-gray-700",
};

function formatBookingDate(date) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function BookingCard({ booking, onCancel, onEdit, onDelete, canDelete = false }) {
  const { id, resourceName, date, startTime, endTime, status, qrCode, reason } = booking;

  return (
    <div className="border bg-white p-5 rounded-xl shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{resourceName}</h2>

          <div className="mt-3 flex flex-col gap-2 text-sm text-gray-500 sm:flex-row sm:items-center sm:gap-5">
            <div className="flex items-center gap-2">
              <CalendarDays size={16} className="text-blue-500" />
              <span>{formatBookingDate(date)}</span>
            </div>

            <div className="flex items-center gap-2">
              <Clock3 size={16} className="text-blue-500" />
              <span>
                {startTime} - {endTime}
              </span>
            </div>
          </div>
        </div>

        <span
          className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-semibold ${
            statusStyles[status] || "bg-gray-100 text-gray-700"
          }`}
        >
          {status}
        </span>
      </div>

      {status === "APPROVED" && (
        <div className="mt-4 rounded-xl border border-green-100 bg-green-50 p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-white p-2 text-green-600 shadow-sm">
              <QrCode size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-green-800">Entry QR</p>
              <p className="mt-1 text-sm text-green-700">
                Show this code at the resource entrance: {qrCode}
              </p>
            </div>
          </div>
        </div>
      )}

      {status === "REJECTED" && reason && (
        <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <XCircle size={18} className="mt-0.5 text-red-500" />
            <div>
              <p className="text-sm font-medium text-red-800">Reason</p>
              <p className="mt-1 text-sm text-red-700">{reason}</p>
            </div>
          </div>
        </div>
      )}

      {(status === "PENDING" || canDelete) && (
        <div className="mt-4 flex justify-end gap-3">
          {status === "PENDING" && (
            <>
              <button
                type="button"
                onClick={() => onEdit(booking)}
                className="rounded-lg border border-blue-200 px-4 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => {
                  console.log("Cancel button booking ID:", booking.id);
                  onCancel(booking.id);
                }}
                className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
              >
                Cancel Booking
              </button>
            </>
          )}

          {canDelete && onDelete && (
            <button
              type="button"
              onClick={() => onDelete(id)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default BookingCard;
