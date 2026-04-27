import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getCurrentUserRole } from "../../services/authService";

function normalizeRole(role) {
  return (role || "").toLowerCase();
}

function getDashboardPath(role) {
  return normalizeRole(role) === "admin" ? "/admin/dashboard" : "/student/dashboard";
}

function ProtectedRoute({ allowedRoles, children }) {
  const [status, setStatus] = useState("checking");
  const [role, setRole] = useState(normalizeRole(localStorage.getItem("role")));
  const userEmail = localStorage.getItem("userEmail");

  useEffect(() => {
    let isMounted = true;

    if (!userEmail) {
      setRole("");
      setStatus("denied");
      return undefined;
    }

    getCurrentUserRole(userEmail)
      .then((response) => {
        if (!isMounted) {
          return;
        }

        const verifiedRole = normalizeRole(response.data?.role);
        localStorage.setItem("role", verifiedRole);
        setRole(verifiedRole);
        setStatus(allowedRoles.includes(verifiedRole) ? "allowed" : "denied");
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        localStorage.clear();
        sessionStorage.clear();
        setRole("");
        setStatus("denied");
      });

    return () => {
      isMounted = false;
    };
  }, [allowedRoles, userEmail]);

  if (status === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 text-sm font-medium text-gray-600">
        Checking access...
      </div>
    );
  }

  if (status === "denied") {
    if (!role) {
      return <Navigate to="/login" replace />;
    }

    return <Navigate to={getDashboardPath(role)} replace />;
  }

  return children;
}

export default ProtectedRoute;
