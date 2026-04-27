import { useState } from "react";
import {
  CalendarDays,
  Clock3,
  Download,
  MapPin,
  QrCode,
  User,
  XCircle,
} from "lucide-react";

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

function formatBookingTime(time) {
  return time ? time.substring(0, 5) : "";
}

function BookingCard({ booking, onCancel, onEdit, onDelete, canDelete = false }) {
  const [showQrModal, setShowQrModal] = useState(false);
  const {
    id,
    userName,
    resourceName,
    location,
    date,
    startTime,
    endTime,
    status,
    qrCode,
    reason,
  } = booking;
  const qrImageUrl = `http://localhost:8080/api/bookings/qr/${id}`;

  return (
    <div className="border bg-white p-5 rounded-xl shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{resourceName}</h2>
          <div className="mt-4 space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <User size={16} className="text-blue-500" />
              <span>
                <strong>Student:</strong> {userName || `User #${booking.userId}`}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-blue-500" />
              <span>
                <strong>Location:</strong> {location || "Location not available"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <CalendarDays size={16} className="text-blue-500" />
              <span>
                <strong>Date:</strong> {formatBookingDate(date)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Clock3 size={16} className="text-blue-500" />
              <span>
                <strong>Time:</strong> {formatBookingTime(startTime)} - {formatBookingTime(endTime)}
              </span>
            </div>

            <div>
              <strong>Reason:</strong> {reason || "No reason provided"}
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

      {status === "APPROVED" && qrCode && (
        <div className="mt-4 rounded-xl border border-green-100 bg-green-50 p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="rounded-lg bg-white p-2 text-green-600 shadow-sm">
              <QrCode size={20} />
            </div>

            <div className="flex-1">
              <p className="text-sm font-medium text-green-800">Entry QR</p>
              <p className="mt-1 text-sm text-green-700">
                Show this QR at the resource entrance for validation.
              </p>
            </div>

            <div className="flex flex-col items-start gap-3 sm:items-end">
              <button
                type="button"
                onClick={() => setShowQrModal(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-green-200 bg-white px-3 py-2 text-sm font-medium text-green-700 transition hover:bg-green-100"
              >
                <QrCode size={16} />
                View QR
              </button>

              <a
                href={qrImageUrl}
                download={`booking-${id}.png`}
                className="inline-flex items-center gap-2 rounded-lg border border-green-200 bg-white px-3 py-2 text-sm font-medium text-green-700 transition hover:bg-green-100"
              >
                <Download size={16} />
                Download QR
              </a>
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

      {showQrModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowQrModal(false)}
          />

          <div className="relative z-50 w-[360px] rounded-xl bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">Booking QR</h3>
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 transition hover:bg-gray-50"
              >
                Close
              </button>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <img
                src={qrImageUrl}
                alt={`Booking ${id} QR`}
                className="h-full w-full rounded-md bg-white"
              />
            </div>

            <a
              href={qrImageUrl}
              download={`booking-${id}.png`}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <Download size={16} />
              Download QR
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookingCard;
