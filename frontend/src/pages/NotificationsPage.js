import { useMemo, useState } from "react";
import { AlertTriangle, Bell, CheckCircle2, Clock3, MailOpen } from "lucide-react";
import AdminLayout from "../components/layout/AdminLayout";
import StudentLayout from "../components/layout/StudentLayout";

const ADMIN_NOTIFICATIONS = [
  {
    id: 1,
    title: "Booking request pending approval",
    message: "Room A101 has a new reservation request for today.",
    time: "10 min ago",
    type: "warning",
    read: false,
  },
  {
    id: 2,
    title: "Maintenance ticket updated",
    message: "Lab projector issue was assigned to the support team.",
    time: "35 min ago",
    type: "info",
    read: false,
  },
  {
    id: 3,
    title: "Resource status changed",
    message: "Meeting Room B205 is now available for bookings.",
    time: "2 hours ago",
    type: "success",
    read: true,
  },
];

const STUDENT_NOTIFICATIONS = [
  {
    id: 1,
    title: "Booking approved",
    message: "Your reservation for Lab A101 has been approved.",
    time: "12 min ago",
    type: "success",
    read: false,
  },
  {
    id: 2,
    title: "Ticket reply received",
    message: "Support replied to your projector issue ticket.",
    time: "1 hour ago",
    type: "info",
    read: false,
  },
  {
    id: 3,
    title: "Booking reminder",
    message: "Your meeting room booking starts at 2:00 PM.",
    time: "Today",
    type: "warning",
    read: true,
  },
];

function getNotificationIcon(type) {
  if (type === "success") {
    return <CheckCircle2 size={18} className="text-green-600" />;
  }

  if (type === "warning") {
    return <AlertTriangle size={18} className="text-amber-600" />;
  }

  return <Bell size={18} className="text-blue-600" />;
}

function NotificationsPage({ role = "admin" }) {
  const Layout = role === "student" ? StudentLayout : AdminLayout;
  const initialNotifications = role === "student" ? STUDENT_NOTIFICATIONS : ADMIN_NOTIFICATIONS;
  const [notifications, setNotifications] = useState(initialNotifications);
  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications]
  );

  const markAllRead = () => {
    setNotifications((current) =>
      current.map((notification) => ({ ...notification, read: true }))
    );
  };

  return (
    <Layout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
            <p className="mt-1 text-sm text-slate-500">
              {unreadCount} unread {unreadCount === 1 ? "message" : "messages"}
            </p>
          </div>

          <button
            type="button"
            onClick={markAllRead}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <MailOpen size={16} />
            Mark all read
          </button>
        </div>

        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`rounded-lg border bg-white p-4 shadow-sm ${
                notification.read ? "border-slate-200" : "border-blue-200"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                  {getNotificationIcon(notification.type)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                    <h2 className="text-sm font-semibold text-slate-900">
                      {notification.title}
                    </h2>
                    <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                      <Clock3 size={13} />
                      {notification.time}
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-slate-600">{notification.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}

export default NotificationsPage;
