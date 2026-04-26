import { useState } from "react";
import { QrReader } from "react-qr-reader";
import { Camera, CircleCheckBig, CircleX, ScanLine } from "lucide-react";
import AdminLayout from "./layout/AdminLayout";
import axios from "../services/api";

function QRScanner() {
  const [result, setResult] = useState("");
  const [status, setStatus] = useState("idle");
  const [scanning, setScanning] = useState(false);

  const handleScan = async (data) => {
    if (!data?.text || scanning) {
      return;
    }

    try {
      setScanning(true);
      const res = await axios.get(`/booking/verify/${data.text}`);
      setStatus("valid");
      setResult(`VALID ✅ - ${res.data.resourceName || `Resource #${res.data.resourceId}`}`);
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data;

      if (message === "Booking not approved") {
        setStatus("pending");
        setResult("NOT APPROVED ⏳");
      } else {
        setStatus("invalid");
        setResult("INVALID ❌");
      }
    } finally {
      setTimeout(() => setScanning(false), 1200);
    }
  };

  return (
    <AdminLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">QR Entry Verification</h1>
          <p className="mt-2 text-lg text-slate-500">
            Scan student booking QR codes to validate approved entry access.
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
              {status === "valid" && <CircleCheckBig className="text-emerald-500" size={22} />}
              {status === "invalid" && <CircleX className="text-rose-500" size={22} />}
              {status === "pending" && <Camera className="text-amber-500" size={22} />}
              {status === "idle" && <Camera className="text-slate-400" size={22} />}
              <p className="text-lg font-medium text-slate-700">
                {result || "Waiting for scan..."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default QRScanner;
