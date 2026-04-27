import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bell,
  Edit,
  Eye,
  EyeOff,
  Plus,
  RefreshCw,
  Search,
  Send,
  Trash2,
  X,
} from "lucide-react";
import AdminLayout from "../../components/layout/AdminLayout";
import {
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_PRIORITIES,
  NOTIFICATION_STATUSES,
  NOTIFICATION_VISIBILITIES,
  createNotification,
  deleteNotification,
  getAdminNotifications,
  publishNotification,
  updateNotification,
  updateNotificationVisibility,
} from "../../services/notificationService";

const emptyForm = {
  title: "",
  message: "",
  category: "General",
  priority: "Medium",
  visibility: "Public",
  targetRole: "student",
  targetUserId: "",
  status: "Draft",
};

const emptyFilters = {
  category: "All",
  priority: "All",
  status: "All",
  search: "",
};

const categoryBadge = {
  Academic: "bg-blue-100 text-blue-700",
  Maintenance: "bg-yellow-100 text-yellow-700",
  Emergency: "bg-red-100 text-red-700",
  Booking: "bg-green-100 text-green-700",
  Tickets: "bg-purple-100 text-purple-700",
  General: "bg-gray-100 text-gray-700",
};

const priorityBadge = {
  Low: "bg-slate-100 text-slate-700",
  Medium: "bg-sky-100 text-sky-700",
  High: "bg-orange-100 text-orange-700",
  Critical: "bg-red-600 text-white",
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

function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [filters, setFilters] = useState(emptyFilters);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [toast, setToast] = useState(null);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setToast(null);

    try {
      const response = await getAdminNotifications();
      setNotifications(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setToast({
        type: "error",
        message: getErrorMessage(err, "Unable to load notifications."),
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const filteredNotifications = useMemo(() => {
    const search = filters.search.trim().toLowerCase();

    return notifications.filter((notification) => {
      const matchesCategory =
        filters.category === "All" || notification.category === filters.category;
      const matchesPriority =
        filters.priority === "All" || notification.priority === filters.priority;
      const matchesStatus =
        filters.status === "All" || notification.status === filters.status;
      const matchesSearch =
        !search ||
        `${notification.title || ""} ${notification.message || ""}`
          .toLowerCase()
          .includes(search);

      return matchesCategory && matchesPriority && matchesStatus && matchesSearch;
    });
  }, [filters, notifications]);

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setToast(null);
  };

  const updateFilter = (field, value) => {
    setFilters((current) => ({ ...current, [field]: value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const buildPayload = () => ({
    title: form.title.trim(),
    message: form.message.trim(),
    category: form.category,
    priority: form.priority,
    visibility: form.visibility,
    targetRole: form.visibility === "Private" ? form.targetRole || null : null,
    targetUserId:
      form.visibility === "Private" && form.targetUserId
        ? Number(form.targetUserId)
        : null,
    status: form.status,
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setToast(null);

    if (!form.title.trim() || !form.message.trim()) {
      setToast({ type: "error", message: "Title and message are required." });
      return;
    }

    if (
      form.visibility === "Private" &&
      !form.targetRole &&
      !form.targetUserId
    ) {
      setToast({
        type: "error",
        message: "Private notifications need a target role or user.",
      });
      return;
    }

    setSaving(true);

    try {
      if (editingId) {
        await updateNotification(editingId, buildPayload());
        setToast({ type: "success", message: "Notification updated successfully." });
      } else {
        await createNotification(buildPayload());
        setToast({ type: "success", message: "Notification created successfully." });
      }

      resetForm();
      loadNotifications();
    } catch (err) {
      setToast({
        type: "error",
        message: getErrorMessage(err, "Unable to save notification."),
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (notification) => {
    setEditingId(notification.id);
    setForm({
      title: notification.title || "",
      message: notification.message || "",
      category: notification.category || "General",
      priority: notification.priority || "Medium",
      visibility: notification.visibility || "Public",
      targetRole: notification.targetRole || "student",
      targetUserId: notification.targetUserId ? String(notification.targetUserId) : "",
      status: notification.status || "Draft",
    });
    setToast(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this notification?")) {
      return;
    }

    setActionId(id);
    setToast(null);

    try {
      await deleteNotification(id);
      setToast({ type: "success", message: "Notification deleted successfully." });
      loadNotifications();
    } catch (err) {
      setToast({
        type: "error",
        message: getErrorMessage(err, "Unable to delete notification."),
      });
    } finally {
      setActionId(null);
    }
  };

  const handlePublish = async (notification) => {
    const nextPublished = notification.status !== "Published";
    setActionId(notification.id);
    setToast(null);

    try {
      await publishNotification(notification.id, nextPublished);
      setToast({
        type: "success",
        message: nextPublished
          ? "Notification published successfully."
          : "Notification unpublished successfully.",
      });
      loadNotifications();
    } catch (err) {
      setToast({
        type: "error",
        message: getErrorMessage(err, "Unable to update publish status."),
      });
    } finally {
      setActionId(null);
    }
  };

  const handleVisibilityToggle = async (notification) => {
    const nextVisibility = notification.visibility === "Public" ? "Private" : "Public";
    setActionId(notification.id);
    setToast(null);

    try {
      await updateNotificationVisibility(notification.id, {
        visibility: nextVisibility,
        targetRole: nextVisibility === "Private" ? "student" : null,
        targetUserId: null,
      });
      setToast({
        type: "success",
        message: "Notification visibility updated successfully.",
      });
      loadNotifications();
    } catch (err) {
      setToast({
        type: "error",
        message: getErrorMessage(err, "Unable to update visibility."),
      });
    } finally {
      setActionId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="text-sm text-gray-500">Create and manage campus notifications</p>
          </div>
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

        {toast && (
          <div
            className={`rounded-md border px-4 py-3 text-sm font-medium ${
              toast.type === "success"
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {toast.message}
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
          <form onSubmit={handleSubmit} className="rounded-lg bg-white p-5 shadow">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <Bell size={18} />
                {editingId ? "Edit Notification" : "New Notification"}
              </h2>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                >
                  <X size={14} />
                  Cancel
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  value={form.title}
                  onChange={(event) => updateForm("title", event.target.value)}
                  className="h-11 w-full rounded-md border border-gray-300 px-3 text-sm focus:border-blue-500 focus:outline-none"
                  placeholder="Campus update"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Message
                </label>
                <textarea
                  value={form.message}
                  onChange={(event) => updateForm("message", event.target.value)}
                  rows={4}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  placeholder="Notification details"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(event) => updateForm("category", event.target.value)}
                    className="h-11 w-full rounded-md border border-gray-300 px-3 text-sm focus:border-blue-500 focus:outline-none"
                  >
                    {NOTIFICATION_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Priority
                  </label>
                  <select
                    value={form.priority}
                    onChange={(event) => updateForm("priority", event.target.value)}
                    className="h-11 w-full rounded-md border border-gray-300 px-3 text-sm focus:border-blue-500 focus:outline-none"
                  >
                    {NOTIFICATION_PRIORITIES.map((priority) => (
                      <option key={priority} value={priority}>
                        {priority}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Visibility
                  </label>
                  <select
                    value={form.visibility}
                    onChange={(event) => updateForm("visibility", event.target.value)}
                    className="h-11 w-full rounded-md border border-gray-300 px-3 text-sm focus:border-blue-500 focus:outline-none"
                  >
                    {NOTIFICATION_VISIBILITIES.map((visibility) => (
                      <option key={visibility} value={visibility}>
                        {visibility}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(event) => updateForm("status", event.target.value)}
                    className="h-11 w-full rounded-md border border-gray-300 px-3 text-sm focus:border-blue-500 focus:outline-none"
                  >
                    {NOTIFICATION_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {form.visibility === "Private" && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Target Role
                    </label>
                    <select
                      value={form.targetRole}
                      onChange={(event) => updateForm("targetRole", event.target.value)}
                      className="h-11 w-full rounded-md border border-gray-300 px-3 text-sm focus:border-blue-500 focus:outline-none"
                    >
                      <option value="student">Student</option>
                      <option value="admin">Admin</option>
                      <option value="">No role target</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Target User ID
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={form.targetUserId}
                      onChange={(event) => updateForm("targetUserId", event.target.value)}
                      className="h-11 w-full rounded-md border border-gray-300 px-3 text-sm focus:border-blue-500 focus:outline-none"
                      placeholder="Optional"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
              >
                {editingId ? <Edit size={16} /> : <Plus size={16} />}
                {saving ? "Saving..." : editingId ? "Update Notification" : "Create Notification"}
              </button>
            </div>
          </form>

          <div className="space-y-4">
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
                  value={filters.status}
                  onChange={(event) => updateFilter("status", event.target.value)}
                  className="h-11 rounded-md border border-gray-300 px-3 text-sm focus:border-blue-500 focus:outline-none"
                >
                  <option value="All">All statuses</option>
                  {NOTIFICATION_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
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
                  <article key={notification.id} className="rounded-lg bg-white p-5 shadow">
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
                              notification.status === "Published"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {notification.status}
                          </span>
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                              notification.visibility === "Private"
                                ? "bg-indigo-100 text-indigo-700"
                                : "bg-teal-100 text-teal-700"
                            }`}
                          >
                            {notification.visibility}
                          </span>
                        </div>

                        <h3 className="text-lg font-semibold text-gray-900">
                          {notification.title}
                        </h3>
                        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-gray-600">
                          {notification.message}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                          <span>Created: {formatDate(notification.createdAt)}</span>
                          <span>Updated: {formatDate(notification.updatedAt)}</span>
                          {notification.targetRole && (
                            <span>Target role: {notification.targetRole}</span>
                          )}
                          {notification.targetUserId && (
                            <span>Target user: {notification.targetUserId}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 lg:w-[280px] lg:justify-end">
                        <button
                          type="button"
                          onClick={() => handlePublish(notification)}
                          disabled={actionId === notification.id}
                          className="inline-flex items-center gap-2 rounded-md border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:text-blue-300"
                        >
                          <Send size={14} />
                          {notification.status === "Published" ? "Unpublish" : "Publish"}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleVisibilityToggle(notification)}
                          disabled={actionId === notification.id}
                          className="inline-flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-300"
                        >
                          {notification.visibility === "Public" ? (
                            <EyeOff size={14} />
                          ) : (
                            <Eye size={14} />
                          )}
                          {notification.visibility === "Public" ? "Private" : "Public"}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleEdit(notification)}
                          className="inline-flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                        >
                          <Edit size={14} />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(notification.id)}
                          disabled={actionId === notification.id}
                          className="inline-flex items-center gap-2 rounded-md border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:text-red-300"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminNotificationsPage;
