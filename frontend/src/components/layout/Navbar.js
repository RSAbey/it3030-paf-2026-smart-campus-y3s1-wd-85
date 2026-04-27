import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getNotificationSettings,
  getStudentNotifications,
} from "../../services/notificationService";

function generateInitials(name) {
  if (!name || typeof name !== "string") return "U";
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

function getNameFromEmail(email) {
  if (!email) {
    return "User";
  }

  return email
    .split("@")[0]
    .split(".")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function Navbar({ role }) {
  const [userName, setUserName] = useState("User");
  const [userEmail, setUserEmail] = useState("user@email.com");
  const [avatarInitials, setAvatarInitials] = useState("U");
  const [unreadCount, setUnreadCount] = useState(0);
  const effectiveRole = (role || localStorage.getItem("role") || "").toLowerCase();
  const profilePath = effectiveRole === "admin" ? "/admin/profile" : "/student/profile";

  useEffect(() => {
    const loadUserSummary = () => {
      // TODO: Replace localStorage profile data with backend/Firebase user data when available.
      const storedEmail = localStorage.getItem("userEmail") || localStorage.getItem("authEmail") || "user@email.com";
      const storedUserName = localStorage.getItem("userName") || getNameFromEmail(storedEmail);

      setUserEmail(storedEmail);
      setUserName(storedUserName);
      setAvatarInitials(generateInitials(storedUserName));
    };

    loadUserSummary();
    window.addEventListener("profile-updated", loadUserSummary);

    return () => {
      window.removeEventListener("profile-updated", loadUserSummary);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    if (effectiveRole !== "student") {
      setUnreadCount(0);
      return undefined;
    }

    const loadUnreadCount = () => {
      Promise.all([getStudentNotifications(), getNotificationSettings()])
        .then(([notificationsResponse, settingsResponse]) => {
          if (!isMounted) {
            return;
          }

          const notifications = Array.isArray(notificationsResponse.data)
            ? notificationsResponse.data
            : [];
          const settings = settingsResponse.data || {};
          const enabledCategories = Array.isArray(settings.categories)
            ? settings.categories
            : [];
          const notificationsEnabled = settings.enabled !== false;
          const highPriorityEnabled = settings.highPriorityAlerts !== false;

          const count = notifications.filter((notification) => {
            const matchesSettings =
              notificationsEnabled &&
              enabledCategories.includes(notification.category) &&
              (highPriorityEnabled ||
                !["High", "Critical"].includes(notification.priority));

            return matchesSettings && !notification.isRead;
          }).length;

          setUnreadCount(count);
        })
        .catch(() => {
          if (isMounted) {
            setUnreadCount(0);
          }
        });
    };

    loadUnreadCount();
    window.addEventListener("notifications-updated", loadUnreadCount);

    return () => {
      isMounted = false;
      window.removeEventListener("notifications-updated", loadUnreadCount);
    };
  }, [effectiveRole]);

  return (
    <div className="flex justify-between items-center bg-white px-6 py-3 border-b">

      {/* Title */}
      <div>
        {/* <h1 className="text-lg font-semibold">Smart Campus</h1> */}
        {/* <p className="text-xs text-gray-500">Operations Hub</p> */}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-5">

        {/* Notification */}
        <Link
          to={effectiveRole === "admin" ? "/admin/notifications" : "/student/notifications"}
          className="relative"
          aria-label="Notifications"
        >
          <Bell className="text-gray-600" />
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 min-w-5 rounded-full bg-red-500 px-1 text-center text-xs text-white">
              {unreadCount}
            </span>
          )}
        </Link>

        {/* User */}
        <Link
          to={profilePath}
          className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 transition hover:bg-gray-100"
          aria-label="Open profile"
        >
          <div className="text-right">
            <p className="text-sm font-medium">{userName}</p>
            <p className="text-xs text-gray-500">{userEmail}</p>
          </div>

          <div className="w-9 h-9 bg-blue-500 text-white flex items-center justify-center rounded-full text-xs font-semibold">
            {avatarInitials}
          </div>
        </Link>

      </div>
    </div>
  );
}

export default Navbar;
