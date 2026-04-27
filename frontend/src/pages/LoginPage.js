import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "student@campus.edu",
    password: "student123",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      const auth = await login(formData);
      toast.success("Signed in successfully");
      navigate(auth.role === "ADMIN" ? "/admin/dashboard" : "/student/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || error.response?.data || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#dbeafe,_#f8fafc_55%)] px-4 py-10">
      <div className="mx-auto flex min-h-[80vh] max-w-5xl overflow-hidden rounded-[32px] bg-white shadow-[0_30px_80px_rgba(15,23,42,0.12)]">
        <div className="hidden flex-1 flex-col justify-between bg-slate-950 p-10 text-white lg:flex">
          <div>
            <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-1 text-xs uppercase tracking-[0.25em] text-sky-200">
              Smart Campus
            </div>
            <h1 className="mt-6 max-w-md text-5xl font-bold leading-tight">
              Secure campus booking, approval, and access control.
            </h1>
            <p className="mt-5 max-w-lg text-sm leading-7 text-slate-300">
              Sign in as a student to manage reservations, or as an admin to approve
              bookings and validate QR entry in real time.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm text-slate-300">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="font-semibold text-white">Student Demo</p>
              <p className="mt-2">student@campus.edu</p>
              <p>student123</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="font-semibold text-white">Admin Demo</p>
              <p className="mt-2">admin@campus.edu</p>
              <p>admin123</p>
            </div>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center p-8 sm:p-12">
          <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">
                Sign In
              </p>
              <h2 className="mt-3 text-3xl font-bold text-slate-900">
                Access your Smart Campus workspace
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Use your campus account to continue.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
