import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

function QRScanner({ onScan, isOpen }) {
  const elementIdRef = useRef(`reader-${Math.random().toString(36).slice(2)}`);
  const scannerRef = useRef(null);
  const isMountedRef = useRef(false);
  const hasStartedRef = useRef(false);
  const [status, setStatus] = useState("Starting camera...");

  useEffect(() => {
    isMountedRef.current = true;

    if (!isOpen) {
      setStatus("Scanner closed");
      return () => {
        isMountedRef.current = false;
      };
    }

    if (!navigator.mediaDevices) {
      setStatus("Camera not supported on this device. Try image upload instead.");
      return () => {
        isMountedRef.current = false;
      };
    }

    const startScanner = async () => {
      try {
        if (scannerRef.current && hasStartedRef.current) {
          await scannerRef.current.stop().catch(() => {});
          scannerRef.current.clear();
          scannerRef.current = null;
          hasStartedRef.current = false;
        }

        const scanner = new Html5Qrcode(elementIdRef.current);
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 200, height: 200 },
          },
          (decodedText) => {
            onScan(decodedText);
          },
          () => {}
        );

        hasStartedRef.current = true;

        if (isMountedRef.current) {
          setStatus("Waiting for scan...");
        }
      } catch (err) {
        console.error("Camera error:", err);
        if (isMountedRef.current) {
          setStatus("Unable to access camera. Try image upload instead.");
        }
      }
    };

    startScanner();

    return () => {
      isMountedRef.current = false;

      if (scannerRef.current) {
        try {
          if (hasStartedRef.current) {
            scannerRef.current
              .stop()
              .then(() => {
                hasStartedRef.current = false;
                scannerRef.current.clear();
                scannerRef.current = null;
              })
              .catch(() => {});
          } else {
            scannerRef.current.clear();
            scannerRef.current = null;
          }
        } catch (err) {
          console.log("Scanner already stopped");
        }
      }
    };
  }, [isOpen, onScan]);

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    let html5Qr = null;

    try {
      if (scannerRef.current && hasStartedRef.current) {
        await scannerRef.current.stop().catch(() => {});
        scannerRef.current.clear();
        scannerRef.current = null;
        hasStartedRef.current = false;
      }

      html5Qr = new Html5Qrcode(elementIdRef.current);
      const result = await html5Qr.scanFile(file, true);
      onScan(result);
    } catch (err) {
      alert("Invalid QR image");
    } finally {
      if (html5Qr) {
        try {
          html5Qr.clear();
        } catch (err) {
          console.log("Upload scanner already cleared");
        }
      }
      event.target.value = "";
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div
        id={elementIdRef.current}
        className="h-[250px] w-full max-w-[300px] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
      />
      <div className="mt-3 text-sm text-gray-500">{status}</div>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="mt-3 w-full max-w-[300px] text-sm text-gray-500"
      />
    </div>
  );
}

export default QRScanner;
