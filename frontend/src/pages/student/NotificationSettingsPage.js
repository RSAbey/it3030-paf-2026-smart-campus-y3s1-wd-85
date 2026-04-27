import { useCallback, useEffect, useState } from "react";
import { Bell, RefreshCw, Save, Settings } from "lucide-react";
import StudentLayout from "../../components/layout/StudentLayout";
import {
  NOTIFICATION_CATEGORIES,
  getNotificationSettings,
  saveNotificationSettings,
} from "../../services/notificationService";

function getErrorMessage(error, fallback) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
}

function NotificationSettingsPage() {
  const [enabled, setEnabled] = useState(true);
  const [categories, setCategories] = useState(NOTIFICATION_CATEGORIES);
  const [highPriorityAlerts, setHighPriorityAlerts] = useState(true);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await getNotificationSettings();
      setEnabled(response.data?.enabled !== false);
      setCategories(
        Array.isArray(response.data?.categories)
          ? response.data.categories
          : NOTIFICATION_CATEGORIES
      );
      setHighPriorityAlerts(response.data?.highPriorityAlerts !== false);
    } catch (err) {
      setMessage({
        type: "error",
        text: getErrorMessage(err, "Unable to load notification settings."),
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const toggleCategory = (category) => {
    setMessage(null);
    setCategories((current) =>
      current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category]
    );
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      await saveNotificationSettings({
        enabled,
        categories,
        highPriorityAlerts,
      });

      setMessage({
        type: "success",
        text: "Notification settings saved.",
      });
      window.dispatchEvent(new Event("notifications-updated"));
    } catch (err) {
      setMessage({
        type: "error",
        text: getErrorMessage(err, "Unable to save notification settings."),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <StudentLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notification Settings</h1>
            <p className="text-sm text-gray-500">Manage notification preferences</p>
          </div>
          <button
            type="button"
            onClick={loadSettings}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-400"
          >
            <RefreshCw size={16} />
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {message && (
          <div
            className={`rounded-md border px-4 py-3 text-sm font-medium ${
              message.type === "success"
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <section className="rounded-lg bg-white p-5 shadow">
            <div className="mb-4 flex items-center gap-2">
              <Bell size={18} className="text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Delivery</h2>
            </div>

            <div className="space-y-4">
              <label className="flex items-center justify-between gap-4 rounded-md border border-gray-200 px-4 py-3">
                <span>
                  <span className="block text-sm font-semibold text-gray-900">
                    Enable all notifications
                  </span>
                  <span className="block text-xs text-gray-500">
                    Turn campus notifications on or off
                  </span>
                </span>
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(event) => {
                    setEnabled(event.target.checked);
                    setMessage(null);
                  }}
                  className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </label>

              <label className="flex items-center justify-between gap-4 rounded-md border border-gray-200 px-4 py-3">
                <span>
                  <span className="block text-sm font-semibold text-gray-900">
                    High-priority alerts
                  </span>
                  <span className="block text-xs text-gray-500">
                    Keep high and critical campus alerts enabled
                  </span>
                </span>
                <input
                  type="checkbox"
                  checked={highPriorityAlerts}
                  onChange={(event) => {
                    setHighPriorityAlerts(event.target.checked);
                    setMessage(null);
                  }}
                  className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </label>
            </div>
          </section>

          <section className="rounded-lg bg-white p-5 shadow">
            <div className="mb-4 flex items-center gap-2">
              <Settings size={18} className="text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Categories</h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {NOTIFICATION_CATEGORIES.map((category) => (
                <label
                  key={category}
                  className="flex items-center justify-between gap-4 rounded-md border border-gray-200 px-4 py-3"
                >
                  <span className="text-sm font-semibold text-gray-900">
                    {category}
                  </span>
                  <input
                    type="checkbox"
                    checked={categories.includes(category)}
                    onChange={() => toggleCategory(category)}
                    className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </label>
              ))}
            </div>
          </section>

          <button
            type="submit"
            disabled={saving || loading}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400 sm:w-auto"
          >
            <Save size={16} />
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </form>
      </div>
    </StudentLayout>
  );
}

export default NotificationSettingsPage;
