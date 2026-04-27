import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Html5QrcodeScanner } from "html5-qrcode";
import {
  CircleCheckBig,
  CircleX,
  Clock3,
  QrCode,
  RefreshCcw,
  ScanLine,
} from "lucide-react";
import AdminLayout from "./layout/AdminLayout";
import {
  getBookingByQrCode,
  scanBookingQr,
} from "../services/bookingService";

function QRScanner() {
  const scannerRef = useRef(null);
  const scanLockedRef = useRef(false);
  const [booking, setBooking] = useState(null);
  const [currentQrCode, setCurrentQrCode] = useState("");
  const [scannerStatus, setScannerStatus] = useState("idle");
  const [message, setMessage] = useState("Point the camera at a booking QR code.");
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    if (scannerRef.current) {
      return undefined;
    }

    const scanner = new Html5QrcodeScanner(
      "smart-campus-qr-reader",
      {
        fps: 10,
        qrbox: { width: 240, height: 240 },
        aspectRatio: 1,
      },
      false
    );

    scannerRef.current = scanner;

    scanner.render(
      async (decodedText) => {
        if (scanLockedRef.current) {
          return;
        }

        try {
          scanLockedRef.current = true;
          const qrCode = decodedText.trim();
          const foundBooking = await getBookingByQrCode(qrCode);
          const bookingStatus = foundBooking.status?.toUpperCase?.() || "";

          setCurrentQrCode(qrCode);
          setBooking(foundBooking);

          if (foundBooking.isUsed) {
            setScannerStatus("used");
            setMessage("QR already used");
            toast.error("QR already used");
          } else if (bookingStatus === "APPROVED") {
            setScannerStatus("valid");
            setMessage("Approved booking found. Ready to validate entry.");
            toast.success("Booking found");
          } else {
            setScannerStatus("invalid");
            setMessage("Booking exists, but it is not approved for entry.");
            toast.error("Booking is not approved");
          }
        } catch (err) {
          setBooking(null);
          setCurrentQrCode("");
          setScannerStatus("invalid");
          setMessage(
            err.response?.data?.message || err.response?.data || "Invalid QR code"
          );
          toast.error(
            err.response?.data?.message || err.response?.data || "Invalid QR code"
          );
        } finally {
          setTimeout(() => {
            scanLockedRef.current = false;
          }, 1200);
        }
      },
      () => {}
    );

    return () => {
      scanner
        .clear()
        .catch(() => {});
      scannerRef.current = null;
    };
  }, []);

  const resetScanState = () => {
    setBooking(null);
    setCurrentQrCode("");
    setScannerStatus("idle");
    setMessage("Point the camera at a booking QR code.");
  };

  const handleValidateEntry = async () => {
    if (!currentQrCode) {
      return;
    }

    try {
      setValidating(true);
      const validatedBooking = await scanBookingQr(currentQrCode);
      setBooking(validatedBooking);
      setScannerStatus("used");
      setMessage("Entry validated and QR marked as used.");
      toast.success("Entry validated");
    } catch (err) {
      setScannerStatus("invalid");
      setMessage(
        err.response?.data?.message || err.response?.data || "Validation failed"
      );
      toast.error(
        err.response?.data?.message || err.response?.data || "Validation failed"
      );
    } finally {
      setValidating(false);
    }
  };

  const statusIcon =
    scannerStatus === "valid" ? (
      <CircleCheckBig className="text-green-500" size={22} />
    ) : scannerStatus === "used" ? (
      <CircleX className="text-amber-500" size={22} />
    ) : scannerStatus === "invalid" ? (
      <CircleX className="text-red-500" size={22} />
    ) : (
      <ScanLine className="text-slate-400" size={22} />
    );

  return (
    <AdminLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">QR Entry Scanner</h1>
            <p className="mt-2 text-sm text-slate-500">
              Scan approved booking passes, preview the reservation, and validate one-time entry.
            </p>
          </div>

          <button
            type="button"
            onClick={resetScanState}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <RefreshCcw size={16} />
            Reset Scan
          </button>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                <QrCode size={20} />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">Camera Scanner</h2>
                <p className="text-sm text-slate-500">
                  Use the device camera to detect student booking QR passes.
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div id="smart-campus-qr-reader" />
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
              <div className="flex items-center gap-3">
                {statusIcon}
                <p className="text-sm font-medium text-slate-700">{message}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-2xl font-semibold text-slate-900">Booking Details</h2>
            <p className="mt-2 text-sm text-slate-500">
              Booking info will appear here after a successful scan.
            </p>

            {!booking && (
              <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
                Waiting for a valid QR scan.
              </div>
            )}

            {booking && (
              <div className="mt-6 space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900">
                        {booking.resourceName || `Resource #${booking.resourceId}`}
                      </h3>
                      <p className="mt-2 text-sm text-slate-500">
                        {booking.userName || `User #${booking.userId}`}
                      </p>
                    </div>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      {booking.status}
                    </span>
                  </div>

                  <div className="mt-4 space-y-3 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Clock3 size={15} />
                      {booking.date} | {booking.startTime} - {booking.endTime}
                    </div>
                    <div>
                      <strong className="text-slate-700">Location:</strong>{" "}
                      {booking.location || "Location not available"}
                    </div>
                    <div>
                      <strong className="text-slate-700">Reason:</strong>{" "}
                      {booking.reason || "No reason provided"}
                    </div>
                    <div className="break-all">
                      <strong className="text-slate-700">QR:</strong> {booking.qrCode}
                    </div>
                    <div>
                      <strong className="text-slate-700">Used:</strong>{" "}
                      {booking.isUsed ? "Yes" : "No"}
                    </div>
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
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <CircleCheckBig size={16} />
                  {validating ? "Validating..." : "Validate Entry"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default QRScanner;
