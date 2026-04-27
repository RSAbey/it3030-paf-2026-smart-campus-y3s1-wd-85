import { useMemo, useState } from "react";
import { ArrowLeft, Eye, EyeOff, KeyRound } from "lucide-react";
import { useNavigate } from "react-router-dom";

function getPasswordErrors(password) {
  const errors = [];
  const numberCount = (password.match(/\d/g) || []).length;

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Must include 1 uppercase letter");
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push("Must include 1 symbol");
  }

  if (numberCount < 2) {
    errors.push("Must include at least 2 numbers");
  }

  return errors;
}

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordErrors = useMemo(
    () => getPasswordErrors(newPassword),
    [newPassword]
  );
  const confirmError =
    confirmPassword && newPassword !== confirmPassword
      ? "Confirm password must match"
      : "";

  const visiblePasswordErrors = submitted || newPassword ? passwordErrors : [];
  const visibleConfirmError = submitted ? confirmError || (!confirmPassword ? "Confirm password is required." : "") : confirmError;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitted(true);
    setSuccess("");

    const nextPasswordErrors = getPasswordErrors(newPassword);
    const nextConfirmError =
      !confirmPassword
        ? "Confirm password is required."
        : newPassword !== confirmPassword
          ? "Confirm password must match"
          : "";

    if (nextPasswordErrors.length > 0 || nextConfirmError) {
      return;
    }

    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 700));
      setSuccess("Password updated successfully");

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 900);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (value) => {
    setNewPassword(value);
    setSubmitted(false);
    setSuccess("");
  };

  const handleConfirmPasswordChange = (value) => {
    setConfirmPassword(value);
    setSubmitted(false);
    setSuccess("");
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-600 via-blue-600 to-blue-800 px-4 py-8 font-sans">
      <section className="w-full max-w-[390px] rounded-2xl bg-white px-7 py-8 shadow-2xl sm:max-w-[430px] sm:px-9 sm:py-10">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-5 flex h-[68px] w-[68px] items-center justify-center rounded-2xl bg-blue-600 text-2xl font-bold text-white shadow-sm">
            SC
          </div>
          <h1 className="text-3xl font-bold tracking-normal text-gray-900">
            Reset Password
          </h1>
          <p className="mt-2 text-base font-medium text-gray-500">
            Smart Campus Operations Hub
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="newPassword" className="mb-2 block text-sm font-semibold text-gray-800">
              New Password
            </label>
            <div className="relative">
              <input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(event) => handlePasswordChange(event.target.value)}
                placeholder="********"
                autoComplete="new-password"
                className="h-[52px] w-full rounded-lg border border-gray-200 px-4 pr-12 text-base text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((current) => !current)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {visiblePasswordErrors.map((error) => (
              <p key={error} className="mt-1 text-sm text-red-600">
                {error}
              </p>
            ))}
          </div>

          <div>
            <label htmlFor="confirmResetPassword" className="mb-2 block text-sm font-semibold text-gray-800">
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmResetPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(event) => handleConfirmPasswordChange(event.target.value)}
                placeholder="********"
                autoComplete="new-password"
                className="h-[52px] w-full rounded-lg border border-gray-200 px-4 pr-12 text-base text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((current) => !current)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {visibleConfirmError && (
              <p className="mt-1 text-sm text-red-600">{visibleConfirmError}</p>
            )}
          </div>

          {success && (
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex h-[52px] w-full items-center justify-center gap-2 rounded-lg bg-blue-600 text-base font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
          >
            <KeyRound size={20} />
            {loading ? "Updating..." : "Update Password"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="flex w-full items-center justify-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft size={16} />
            Back to login
          </button>
        </form>
      </section>
    </main>
  );
}

export default ResetPasswordPage;
