import { useEffect, useState } from "react";
import { LogIn, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  loginAdmin,
  loginStudent,
  registerStudent,
  validatePassword,
} from "../services/authService";

const ROLE_STUDENT = "student";
const ROLE_ADMIN = "admin";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}

function getErrorMessage(error, fallback) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
}

function getDashboardPath(role) {
  return role === ROLE_ADMIN ? "/admin/dashboard" : "/student/dashboard";
}

function LoginPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState(ROLE_STUDENT);
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isRegistering = mode === "register";
  const isAdmin = role === ROLE_ADMIN;

  useEffect(() => {
    if (isAdmin && isRegistering) {
      setMode("login");
    }
  }, [isAdmin, isRegistering]);

  const validateForm = () => {
    if (!email.trim()) {
      return "Email address is required.";
    }

    return validatePassword(password, isRegistering ? confirmPassword : undefined);
  };

  const saveSession = (user) => {
    const userRole = (user?.role || role).toLowerCase();
    localStorage.setItem("role", userRole);
    localStorage.setItem("userEmail", user?.email || email.trim());

    if (user?.id) {
      localStorage.setItem("userId", String(user.id));
    }

    if (rememberMe) {
      localStorage.setItem("rememberUser", "true");
    } else {
      localStorage.removeItem("rememberUser");
    }

    navigate(getDashboardPath(userRole));
  };

  const handleEmailSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      let response;
      const payload = {
        email: email.trim(),
        password,
        confirmPassword: isRegistering ? confirmPassword : undefined,
      };

      if (isRegistering) {
        response = await registerStudent(payload);
      } else if (isAdmin) {
        response = await loginAdmin(payload);
      } else {
        response = await loginStudent(payload);
      }

      saveSession(response.data);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to sign in. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);

    try {
      const googleSignIn =
        window.smartCampusAuth?.signInWithGoogle ||
        window.authService?.signInWithGoogle;

      if (typeof googleSignIn !== "function") {
        throw new Error("Google sign in is not configured yet.");
      }

      const authResult = await googleSignIn();
      const googleRole = (authResult?.role || authResult?.user?.role || ROLE_STUDENT).toLowerCase();

      if (isAdmin && googleRole !== ROLE_ADMIN) {
        throw new Error("You are not authorized as admin.");
      }

      saveSession({
        id: authResult?.id || authResult?.user?.id,
        email: authResult?.email || authResult?.user?.email || email.trim(),
        role: isAdmin ? ROLE_ADMIN : ROLE_STUDENT,
      });
    } catch (err) {
      setError(getErrorMessage(err, "Unable to continue with Google."));
    } finally {
      setLoading(false);
    }
  };

  const updateRole = (nextRole) => {
    setRole(nextRole);
    setError("");
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-600 via-blue-600 to-blue-800 px-4 py-8 font-sans">
      <section className="w-full max-w-[390px] rounded-2xl bg-white px-7 py-8 shadow-2xl sm:max-w-[430px] sm:px-9 sm:py-10">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-5 flex h-[68px] w-[68px] items-center justify-center rounded-2xl bg-blue-600 text-2xl font-bold text-white shadow-sm">
            SC
          </div>
          <h1 className="text-3xl font-bold tracking-normal text-gray-900">
            Smart Campus
          </h1>
          <p className="mt-2 text-base font-medium text-gray-500">
            Operations Hub
          </p>
        </div>

        <div className="mb-5 grid grid-cols-2 rounded-lg bg-gray-100 p-1 text-sm font-semibold">
          <button
            type="button"
            onClick={() => updateRole(ROLE_STUDENT)}
            className={`rounded-md px-3 py-2 transition ${
              !isAdmin ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"
            }`}
          >
            Student
          </button>
          <button
            type="button"
            onClick={() => updateRole(ROLE_ADMIN)}
            className={`rounded-md px-3 py-2 transition ${
              isAdmin ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"
            }`}
          >
            Admin
          </button>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
              !isRegistering
                ? "border-blue-600 text-blue-600"
                : "border-gray-200 text-gray-500"
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            disabled={isAdmin}
            onClick={() => setMode("register")}
            className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
              isRegistering
                ? "border-blue-600 text-blue-600"
                : "border-gray-200 text-gray-500"
            } disabled:cursor-not-allowed disabled:border-gray-100 disabled:text-gray-300`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleEmailSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-semibold text-gray-800">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={isAdmin ? "admin@campus.edu" : "student@campus.edu"}
              autoComplete="email"
              className="h-[52px] w-full rounded-lg border border-gray-200 px-4 text-base text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-semibold text-gray-800">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="********"
              autoComplete={isRegistering ? "new-password" : "current-password"}
              className="h-[52px] w-full rounded-lg border border-gray-200 px-4 text-base text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {isRegistering && (
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-semibold text-gray-800"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="********"
                autoComplete="new-password"
                className="h-[52px] w-full rounded-lg border border-gray-200 px-4 text-base text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          )}

          <div className="flex items-center justify-between gap-4 text-sm">
            <label className="flex items-center gap-2 font-medium text-gray-500">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Remember me
            </label>
            <button
              type="button"
              className="font-medium text-blue-600 hover:text-blue-700"
              onClick={() => setError("Forgot password is not configured yet.")}
            >
              Forgot password?
            </button>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex h-[52px] w-full items-center justify-center gap-2 rounded-lg bg-blue-600 text-base font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
          >
            {isRegistering ? <UserPlus size={20} /> : <LogIn size={20} />}
            {loading ? "Please wait..." : isRegistering ? "Create Account" : "Sign In"}
          </button>
        </form>

        {!isRegistering && (
          <>
            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-sm font-medium text-gray-500">Or continue with</span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="flex h-[52px] w-full items-center justify-center gap-3 rounded-lg border border-gray-200 bg-white text-base font-semibold text-gray-900 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-400"
            >
              <GoogleIcon />
              Continue with Google
            </button>
          </>
        )}
      </section>

      <p className="mt-8 text-center text-sm font-medium text-white">
        © 2026 Smart Campus Operations Hub
      </p>
    </main>
  );
}

export default LoginPage;
