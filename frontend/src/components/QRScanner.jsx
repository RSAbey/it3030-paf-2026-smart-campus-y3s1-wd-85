import { useState } from "react";
import { QrReader } from "react-qr-reader";
import {
  Camera,
  CircleCheckBig,
  CircleX,
  Clock3,
  QrCode,
  ScanLine,
} from "lucide-react";
import AdminLayout from "./layout/AdminLayout";
import {
  getBookingByQrCode,
  validateQrCode,
} from "../services/bookingService";

function QRScanner() {
  const [result, setResult] = useState("");
  const [status, setStatus] = useState("idle");
  const [scanning, setScanning] = useState(false);
  const [booking, setBooking] = useState(null);
  const [currentQrCode, setCurrentQrCode] = useState("");
  const [validating, setValidating] = useState(false);

  const handleScan = async (data) => {
    if (!data?.text || scanning) {
      return;
    }

    try {
      setScanning(true);
      const qrCode = data.text.trim();
      const foundBooking = await getBookingByQrCode(qrCode);
      const bookingStatus = foundBooking.status?.toUpperCase?.() || "";

      setCurrentQrCode(qrCode);
      setBooking(foundBooking);

      if (foundBooking.isUsed) {
        setStatus("used");
        setResult("QR already used");
      } else if (bookingStatus === "APPROVED") {
        setStatus("valid");
        setResult(
          `VALID - ${foundBooking.resourceName || `Resource #${foundBooking.resourceId}`}`
        );
      } else {
        setStatus("pending");
        setResult("Booking not approved");
      }
    } catch (err) {
      setBooking(null);
      setCurrentQrCode("");
      setStatus("invalid");
      setResult(err.response?.data?.message || err.response?.data || "Invalid QR");
    } finally {
      setTimeout(() => setScanning(false), 1200);
    }
  };

  const handleValidateEntry = async () => {
    if (!currentQrCode) {
      return;
    }

    try {
      setValidating(true);
      const validatedBooking = await validateQrCode(currentQrCode);
      setBooking(validatedBooking);
      setStatus("used");
      setResult("Entry validated");
    } catch (err) {
      setStatus("invalid");
      setResult(
        err.response?.data?.message || err.response?.data || "Validation failed"
      );
    } finally {
      setValidating(false);
    }
  };

  return (
    <AdminLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            QR Entry Verification
          </h1>
          <p className="mt-2 text-lg text-slate-500">
            Scan student booking QR codes to verify approved entry access.
          </p>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <ScanLine size={22} />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Scan QR</h2>
              <p className="text-sm text-slate-500">
                Point the camera at the booking QR code to verify access.
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
            <QrReader
              onResult={(scanResult) => {
                if (scanResult) {
                  handleScan(scanResult);
                }
              }}
              constraints={{ facingMode: "environment" }}
            />
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
            <div className="flex items-center gap-3">
              {status === "valid" && (
                <CircleCheckBig className="text-emerald-500" size={22} />
              )}
              {status === "invalid" && (
                <CircleX className="text-rose-500" size={22} />
              )}
              {status === "used" && (
                <CircleX className="text-amber-500" size={22} />
              )}
              {status === "pending" && (
                <Camera className="text-amber-500" size={22} />
              )}
              {status === "idle" && (
                <Camera className="text-slate-400" size={22} />
              )}
              <p className="text-lg font-medium text-slate-700">
                {result || "Waiting for scan..."}
              </p>
            </div>
          </div>

          {booking && (
            <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">
                    {booking.resourceName || `Resource #${booking.resourceId}`}
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">
                    User #{booking.userId}
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                    <Clock3 size={16} />
                    {booking.date} | {booking.startTime} - {booking.endTime}
                  </div>
                  {booking.reason && (
                    <p className="mt-3 text-sm text-rose-600">
                      Reason: {booking.reason}
                    </p>
                  )}
                </div>

                <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {booking.status}
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <QrCode size={16} />
                    QR: {booking.qrCode}
                  </div>
                </div>

                <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  Used: {booking.isUsed ? "Yes" : "No"}
                </div>
              </div>

              <button
                type="button"
                onClick={handleValidateEntry}
                disabled={
                  validating ||
                  booking.isUsed ||
                  booking.status?.toUpperCase?.() !== "APPROVED"
                }
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <CircleCheckBig size={16} />
                {validating ? "Validating..." : "Validate Entry"}
              </button>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default QRScanner;
