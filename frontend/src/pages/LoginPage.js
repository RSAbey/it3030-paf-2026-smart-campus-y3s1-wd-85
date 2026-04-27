import { useEffect, useState } from "react";
import { LogIn, UserPlus, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  loginAdmin,
  loginStudent,
  registerStudent,
  validatePassword,
  loginWithGoogle,
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

  // Registration form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  // Password visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Field-specific errors
  const [fieldErrors, setFieldErrors] = useState({});

  const isRegistering = mode === "register";
  const isAdmin = role === ROLE_ADMIN;

  useEffect(() => {
    if (isAdmin && isRegistering) {
      setMode("login");
    }
  }, [isAdmin, isRegistering]);

  // Clear field errors when mode changes
  useEffect(() => {
    setFieldErrors({});
  }, [mode]);

  const validateForm = () => {
    const errors = {};

    if (isRegistering) {
      // Registration-specific validation
      if (!firstName.trim()) {
        errors.firstName = "First name is required.";
      }
      if (!lastName.trim()) {
        errors.lastName = "Last name is required.";
      }
    }

    if (!email.trim()) {
      errors.email = "Email address is required.";
    } else if (isRegistering) {
      // Validate email format for registration
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        errors.email = "Please enter a valid email address.";
      }
    }

    const passwordError = validatePassword(password, isRegistering ? confirmPassword : undefined);
    if (passwordError) {
      errors.password = passwordError;
    }

    if (isRegistering && !confirmPassword) {
      errors.confirmPassword = "Confirm password is required.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
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

    const isValid = validateForm();
    if (!isValid) {
      return;
    }

    setLoading(true);

    try {
      let response;

      if (isRegistering) {
        response = await registerStudent({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          password,
          role: "student"
        });

        // Show success message
        setError("");
        
        // Clear all registration form fields
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setFirstName("");
        setLastName("");
        setFieldErrors({});
        
        // Show success popup and switch to Sign In tab after delay
        setTimeout(() => {
          setMode("login");
          alert("Registration successful. Please sign in.");
        }, 500);
        
        return;
      } else if (isAdmin) {
        response = await loginAdmin({
          email: email.trim(),
          password,
        });
      } else {
        response = await loginStudent({
          email: email.trim(),
          password,
        });
      }

      saveSession(response.data);
    } catch (err) {
      // Handle registration errors
      if (isRegistering) {
        const errorMsg = getErrorMessage(err, "Registration failed. Please try again.");
        setError(errorMsg);
      } else {
        setError(getErrorMessage(err, "Unable to sign in. Please try again."));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");

    // Block Google login for admin tab
    if (isAdmin) {
      setError("Google login is only available for students.");
      return;
    }

    setLoading(true);

    try {
      // Use Google Identity Services for sign-in
      // This will open a popup for Google authentication
      const client = window.google?.accounts?.id;

      if (!client) {
        throw new Error("Google sign in is not configured yet.");
      }

      // Initialize the Google Sign-In callback
      window.googleCallback = async (response) => {
        try {
          // Decode the JWT token to get user info
          const payload = JSON.parse(atob(response.credential.split('.')[1]));

          const googleUser = {
            name: payload.name,
            email: payload.email,
            provider: "google"
          };

          // Call backend API with Google user data
          const apiResponse = await loginWithGoogle(googleUser);

          saveSession({
            email: apiResponse.data.email,
            name: apiResponse.data.name,
            role: ROLE_STUDENT
          });
        } catch (err) {
          setError(getErrorMessage(err, "Unable to continue with Google."));
        } finally {
          setLoading(false);
        }
      };

      // Render the Google sign-in button in a popup
      client.initialize({
        client_id: "YOUR_GOOGLE_CLIENT_ID",
        callback: window.googleCallback,
        auto_select: false,
        cancel_on_tap_outside: false
      });

      // Prompt for Google sign-in
      client.prompt();

    } catch (err) {
      setError(getErrorMessage(err, "Unable to continue with Google."));
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
            className={`rounded-md px-3 py-2 transition ${!isAdmin ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"
              }`}
          >
            Student
          </button>
          <button
            type="button"
            onClick={() => updateRole(ROLE_ADMIN)}
            className={`rounded-md px-3 py-2 transition ${isAdmin ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"
              }`}
          >
            Admin
          </button>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${!isRegistering
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
            className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${isRegistering
              ? "border-blue-600 text-blue-600"
              : "border-gray-200 text-gray-500"
              } disabled:cursor-not-allowed disabled:border-gray-100 disabled:text-gray-300`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleEmailSubmit} className="space-y-5">
          {isRegistering && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="mb-2 block text-sm font-semibold text-gray-800">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(event) => {
                      setFirstName(event.target.value);
                      if (error) setError("");
                    }}
                    placeholder="First name"
                    autoComplete="given-name"
                    className="h-[52px] w-full rounded-lg border border-gray-200 px-4 text-base text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                  {fieldErrors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{fieldErrors.firstName}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="lastName" className="mb-2 block text-sm font-semibold text-gray-800">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(event) => {
                      setLastName(event.target.value);
                      if (error) setError("");
                    }}
                    placeholder="Last name"
                    autoComplete="family-name"
                    className="h-[52px] w-full rounded-lg border border-gray-200 px-4 text-base text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                  {fieldErrors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{fieldErrors.lastName}</p>
                  )}
                </div>
              </div>
            </>
          )}

          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-semibold text-gray-800">
              {isRegistering ? "Student Email" : "Email Address"}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (error) setError("");
              }}
              placeholder={isAdmin ? "admin@campus.edu" : "student@campus.edu"}
              autoComplete="email"
              className="h-[52px] w-full rounded-lg border border-gray-200 px-4 text-base text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
            {fieldErrors.email && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-semibold text-gray-800">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  if (error) setError("");
                }}
                placeholder="********"
                autoComplete={isRegistering ? "new-password" : "current-password"}
                className="h-[52px] w-full rounded-lg border border-gray-200 px-4 pr-12 text-base text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>
            )}
          </div>

          {isRegistering && (
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-semibold text-gray-800"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(event) => {
                    setConfirmPassword(event.target.value);
                    if (error) setError("");
                  }}
                  placeholder="********"
                  autoComplete="new-password"
                  className="h-[52px] w-full rounded-lg border border-gray-200 px-4 pr-12 text-base text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.confirmPassword}</p>
              )}
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
            disabled={loading || Object.keys(fieldErrors).length > 0}
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
