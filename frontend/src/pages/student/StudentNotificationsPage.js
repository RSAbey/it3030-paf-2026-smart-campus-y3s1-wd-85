import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle, RefreshCw, Search, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import StudentLayout from "../../components/layout/StudentLayout";
import {
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_PRIORITIES,
  getNotificationSettings,
  getStudentNotifications,
  markNotificationRead,
  markNotificationUnread,
} from "../../services/notificationService";

const categoryBadge = {
  Academic: "bg-blue-100 text-blue-700",
  Maintenance: "bg-yellow-100 text-yellow-700",
  Emergency: "bg-red-100 text-red-700",
  Booking: "bg-green-100 text-green-700",
  Tickets: "bg-purple-100 text-purple-700",
  General: "bg-gray-100 text-gray-700",
};

const categoryCard = {
  Academic: "border-l-blue-500",
  Maintenance: "border-l-yellow-500",
  Emergency: "border-l-red-500",
  Booking: "border-l-green-500",
  Tickets: "border-l-purple-500",
  General: "border-l-gray-500",
};

const priorityBadge = {
  Low: "bg-slate-100 text-slate-700",
  Medium: "bg-sky-100 text-sky-700",
  High: "bg-orange-100 text-orange-700",
  Critical: "bg-red-600 text-white",
};

const emptyFilters = {
  category: "All",
  priority: "All",
  readStatus: "All",
  search: "",
};

function getErrorMessage(error, fallback) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
}

function formatDate(value) {
  if (!value) {
    return "Not available";
  }

  return new Date(value).toLocaleString();
}

function StudentNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [settings, setSettings] = useState(null);
  const [filters, setFilters] = useState(emptyFilters);
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [message, setMessage] = useState(null);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setMessage(null);

    try {
      const [notificationsResponse, settingsResponse] = await Promise.all([
        getStudentNotifications(),
        getNotificationSettings(),
      ]);

      setNotifications(
        Array.isArray(notificationsResponse.data) ? notificationsResponse.data : []
      );
      setSettings(settingsResponse.data || null);
    } catch (err) {
      setMessage({
        type: "error",
        text: getErrorMessage(err, "Unable to load notifications."),
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications]
  );

  const filteredNotifications = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    const enabledCategories = settings?.categories || NOTIFICATION_CATEGORIES;
    const notificationsEnabled = settings?.enabled !== false;
    const highPriorityEnabled = settings?.highPriorityAlerts !== false;

    return notifications.filter((notification) => {
      const matchesSettings =
        notificationsEnabled &&
        enabledCategories.includes(notification.category) &&
        (highPriorityEnabled ||
          !["High", "Critical"].includes(notification.priority));
      const matchesCategory =
        filters.category === "All" || notification.category === filters.category;
      const matchesPriority =
        filters.priority === "All" || notification.priority === filters.priority;
      const matchesRead =
        filters.readStatus === "All" ||
        (filters.readStatus === "Read" && notification.isRead) ||
        (filters.readStatus === "Unread" && !notification.isRead);
      const matchesSearch =
        !search ||
        `${notification.title || ""} ${notification.message || ""}`
          .toLowerCase()
          .includes(search);

      return (
        matchesSettings &&
        matchesCategory &&
        matchesPriority &&
        matchesRead &&
        matchesSearch
      );
    });
  }, [filters, notifications, settings]);

  const updateFilter = (field, value) => {
    setFilters((current) => ({ ...current, [field]: value }));
  };

  const replaceNotification = (updatedNotification) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === updatedNotification.id
          ? { ...notification, ...updatedNotification }
          : notification
      )
    );
  };

  const handleReadToggle = async (notification) => {
    setActionId(notification.id);
    setMessage(null);

    try {
      const response = notification.isRead
        ? await markNotificationUnread(notification.id)
        : await markNotificationRead(notification.id);

      if (response.data?.notification) {
        replaceNotification(response.data.notification);
        window.dispatchEvent(new Event("notifications-updated"));
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: getErrorMessage(err, "Unable to update notification status."),
      });
    } finally {
      setActionId(null);
    }
  };

  return (
    <StudentLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="text-sm text-gray-500">
              {unreadCount} unread notification{unreadCount === 1 ? "" : "s"}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              to="/student/settings"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Settings size={16} />
              Settings
            </Link>
            <button
              type="button"
              onClick={loadNotifications}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-400"
            >
              <RefreshCw size={16} />
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
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

        {settings?.enabled === false && (
          <div className="rounded-md border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm font-medium text-yellow-800">
            Notifications are disabled in settings.
          </div>
        )}

        <div className="rounded-lg bg-white p-5 shadow">
          <div className="grid gap-3 lg:grid-cols-[1fr_160px_160px_160px]">
            <div className="relative">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={filters.search}
                onChange={(event) => updateFilter("search", event.target.value)}
                className="h-11 w-full rounded-md border border-gray-300 pl-10 pr-3 text-sm focus:border-blue-500 focus:outline-none"
                placeholder="Search notifications"
              />
            </div>

            <select
              value={filters.category}
              onChange={(event) => updateFilter("category", event.target.value)}
              className="h-11 rounded-md border border-gray-300 px-3 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="All">All categories</option>
              {NOTIFICATION_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <select
              value={filters.priority}
              onChange={(event) => updateFilter("priority", event.target.value)}
              className="h-11 rounded-md border border-gray-300 px-3 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="All">All priorities</option>
              {NOTIFICATION_PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>

            <select
              value={filters.readStatus}
              onChange={(event) => updateFilter("readStatus", event.target.value)}
              className="h-11 rounded-md border border-gray-300 px-3 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="All">Read status</option>
              <option value="Unread">Unread</option>
              <option value="Read">Read</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="rounded-lg bg-white p-8 text-center text-sm font-medium text-gray-500 shadow">
            Loading notifications...
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="rounded-lg bg-white p-8 text-center text-sm font-medium text-gray-500 shadow">
            No notifications found.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <article
                key={notification.id}
                className={`rounded-lg border-l-4 bg-white p-5 shadow ${
                  categoryCard[notification.category] || categoryCard.General
                }`}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          categoryBadge[notification.category] || categoryBadge.General
                        }`}
                      >
                        {notification.category}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          priorityBadge[notification.priority] || priorityBadge.Medium
                        }`}
                      >
                        {notification.priority}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          notification.isRead
                            ? "bg-gray-100 text-gray-600"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {notification.isRead ? "Read" : "Unread"}
                      </span>
                    </div>

                    <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                      {!notification.isRead && (
                        <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                      )}
                      {notification.title}
                    </h3>
                    <p className="mt-2 whitespace-pre-line text-sm leading-6 text-gray-600">
                      {notification.message}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                      <span>Published: {formatDate(notification.createdAt)}</span>
                      {notification.readAt && (
                        <span>Read: {formatDate(notification.readAt)}</span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleReadToggle(notification)}
                    disabled={actionId === notification.id}
                    className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed ${
                      notification.isRead
                        ? "border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:text-gray-300"
                        : "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400"
                    }`}
                  >
                    <CheckCircle size={16} />
                    {notification.isRead ? "Mark Unread" : "Mark Read"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </StudentLayout>
  );
}

export default StudentNotificationsPage;
