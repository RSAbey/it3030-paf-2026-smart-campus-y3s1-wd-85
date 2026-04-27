import { useState } from "react";
import { Bell, LockKeyhole, Save, ShieldCheck, UserRound } from "lucide-react";
import AdminLayout from "../components/layout/AdminLayout";
import StudentLayout from "../components/layout/StudentLayout";

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 text-left text-sm transition hover:bg-slate-50"
    >
      <span className="font-medium text-slate-700">{label}</span>
      <span
        className={`flex h-6 w-11 items-center rounded-full p-1 transition ${
          checked ? "bg-blue-600" : "bg-slate-300"
        }`}
      >
        <span
          className={`h-4 w-4 rounded-full bg-white transition ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </span>
    </button>
  );
}

function SettingsPage({ role = "admin" }) {
  const Layout = role === "student" ? StudentLayout : AdminLayout;
  const isStudent = role === "student";
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState({
    name: isStudent ? "John Doe" : "Admin User",
    email: isStudent ? "student@campus.edu" : "admin@campus.edu",
    phone: "+94 77 123 4567",
  });
  const [preferences, setPreferences] = useState({
    emailAlerts: true,
    bookingUpdates: true,
    ticketUpdates: !isStudent,
    weeklySummary: false,
  });

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfile((current) => ({ ...current, [name]: value }));
    setSaved(false);
  };

  const togglePreference = (name) => {
    setPreferences((current) => ({ ...current, [name]: !current[name] }));
    setSaved(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSaved(true);
  };

  return (
    <Layout>
      <form onSubmit={handleSubmit} className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
            <p className="mt-1 text-sm text-slate-500">
              {isStudent ? "Student account" : "Administrator account"}
            </p>
          </div>

          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <Save size={16} />
            Save changes
          </button>
        </div>

        {saved && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            Settings saved.
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-lg bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <UserRound size={18} className="text-blue-600" />
              <h2 className="font-semibold text-slate-900">Profile</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1">
                <span className="text-xs font-medium text-slate-500">Full name</span>
                <input
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleProfileChange}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </label>

              <label className="space-y-1">
                <span className="text-xs font-medium text-slate-500">Email</span>
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleProfileChange}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </label>

              <label className="space-y-1 sm:col-span-2">
                <span className="text-xs font-medium text-slate-500">Phone</span>
                <input
                  type="tel"
                  name="phone"
                  value={profile.phone}
                  onChange={handleProfileChange}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </label>
            </div>
          </section>

          <section className="rounded-lg bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <ShieldCheck size={18} className="text-green-600" />
              <h2 className="font-semibold text-slate-900">Access</h2>
            </div>

            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
                <span>Role</span>
                <span className="font-semibold text-slate-900">
                  {isStudent ? "Student" : "Admin"}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
                <span>Status</span>
                <span className="font-semibold text-green-700">Active</span>
              </div>

              <button
                type="button"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <LockKeyhole size={16} />
                Change password
              </button>
            </div>
          </section>
        </div>

        <section className="rounded-lg bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <Bell size={18} className="text-blue-600" />
            <h2 className="font-semibold text-slate-900">Notification Preferences</h2>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <Toggle
              label="Email alerts"
              checked={preferences.emailAlerts}
              onChange={() => togglePreference("emailAlerts")}
            />
            <Toggle
              label="Booking updates"
              checked={preferences.bookingUpdates}
              onChange={() => togglePreference("bookingUpdates")}
            />
            <Toggle
              label="Ticket updates"
              checked={preferences.ticketUpdates}
              onChange={() => togglePreference("ticketUpdates")}
            />
            <Toggle
              label="Weekly summary"
              checked={preferences.weeklySummary}
              onChange={() => togglePreference("weeklySummary")}
            />
          </div>
        </section>
      </form>
    </Layout>
  );
}

export default SettingsPage;
