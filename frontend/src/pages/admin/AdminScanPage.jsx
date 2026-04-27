import { useCallback, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { CircleCheckBig, CircleX, Clock3, ImageUp, QrCode } from "lucide-react";
import AdminLayout from "../../components/layout/AdminLayout";
import QRScanner from "../../components/QRScanner";
import {
  getBookingByQrCode,
  validateQrCode,
} from "../../services/bookingService";

function AdminScanPage() {
  const [statusMessage, setStatusMessage] = useState("Waiting for scan...");
  const [statusType, setStatusType] = useState("idle");
  const [booking, setBooking] = useState(null);
  const [currentQrCode, setCurrentQrCode] = useState("");
  const [validating, setValidating] = useState(false);
  const lastScannedRef = useRef("");

  const handleScan = useCallback(async (data) => {
    const qrCode = data?.trim();

    if (!qrCode || qrCode === lastScannedRef.current) {
      return;
    }

    try {
      lastScannedRef.current = qrCode;
      setStatusMessage("Checking QR...");
      const foundBooking = await getBookingByQrCode(qrCode);
      const bookingStatus = foundBooking.status?.toUpperCase?.() || "";

      setBooking(foundBooking);
      setCurrentQrCode(qrCode);

      if (foundBooking.isUsed) {
        setStatusType("used");
        setStatusMessage("QR already used");
      } else if (bookingStatus === "APPROVED") {
        setStatusType("valid");
        setStatusMessage("Approved booking found");
      } else {
        setStatusType("invalid");
        setStatusMessage("Booking is not approved");
      }
    } catch (err) {
      console.error(err);
      setBooking(null);
      setCurrentQrCode("");
      setStatusType("invalid");
      setStatusMessage(
        err.response?.data?.message || err.response?.data || "Invalid QR"
      );
    }
  }, []);

  const handleImageScan = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const scanner = new Html5Qrcode("image-qr-reader");

    try {
      setStatusMessage("Scanning uploaded image...");
      const result = await scanner.scanFile(file, true);
      await handleScan(result);
    } catch (err) {
      console.error(err);
      setStatusType("invalid");
      setStatusMessage("Invalid QR image");
    } finally {
      try {
        scanner.clear();
      } catch (err) {
        console.log("Image scanner already cleared");
      }
      event.target.value = "";
    }
  };

  const handleValidate = async () => {
    if (!currentQrCode) {
      return;
    }

    try {
      setValidating(true);
      const validatedBooking = await validateQrCode(currentQrCode);
      setBooking(validatedBooking);
      setStatusType("used");
      setStatusMessage("Access granted. Entry validated.");
    } catch (err) {
      console.error(err);
      setStatusType("invalid");
      setStatusMessage(
        err.response?.data?.message || err.response?.data || "Validation failed"
      );
    } finally {
      setValidating(false);
    }
  };

  const statusIcon =
    statusType === "valid" ? (
      <CircleCheckBig size={18} className="text-green-500" />
    ) : statusType === "invalid" || statusType === "used" ? (
      <CircleX
        size={18}
        className={statusType === "used" ? "text-amber-500" : "text-red-500"}
      />
    ) : (
      <QrCode size={18} className="text-slate-400" />
    );

  return (
    <AdminLayout>
      <div className="mx-auto mt-10 max-w-2xl space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            QR Entry Verification
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Scan student booking QR codes using the camera or upload an image.
          </p>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <QRScanner onScan={handleScan} />

          <div className="mt-4 flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            {statusIcon}
            {statusMessage}
          </div>

          <div className="mt-4">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
              <ImageUp size={16} />
              Upload QR Image
              <input
                type="file"
                accept="image/*"
                onChange={handleImageScan}
                className="hidden"
              />
            </label>
            <div id="image-qr-reader" className="hidden" />
          </div>
        </div>

        {booking && (
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {booking.resourceName || `Resource #${booking.resourceId}`}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Student: {booking.userName || `User #${booking.userId}`}
                </p>
              </div>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                {booking.status}
              </span>
            </div>

            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Clock3 size={16} />
                {booking.date} | {booking.startTime} - {booking.endTime}
              </div>
              <div>Location: {booking.location || "Not available"}</div>
              <div>Reason: {booking.reason || "No reason provided"}</div>
              <div>Used: {booking.isUsed ? "Yes" : "No"}</div>
            </div>

            <button
              type="button"
              onClick={handleValidate}
              disabled={
                validating ||
                booking.isUsed ||
                booking.status?.toUpperCase?.() !== "APPROVED"
              }
              className="mt-5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {validating ? "Validating..." : "Validate Entry"}
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminScanPage;
