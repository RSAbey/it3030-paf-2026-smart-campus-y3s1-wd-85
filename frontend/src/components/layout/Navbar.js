import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getNotificationSettings,
  getStudentNotifications,
} from "../../services/notificationService";

function Navbar({ role }) {
  const [userName, setUserName] = useState("User");
  const [userEmail, setUserEmail] = useState("user@email.com");
  const [avatarInitials, setAvatarInitials] = useState("U");
  const [unreadCount, setUnreadCount] = useState(0);
  const effectiveRole = (role || localStorage.getItem("role") || "").toLowerCase();

  useEffect(() => {
    // Get user data from localStorage
    // TODO: Replace mock user data with real backend/Firebase user data if not already connected
    const storedEmail = localStorage.getItem("userEmail");
    const storedUserName = localStorage.getItem("userName");

    // Set email
    if (storedEmail) {
      setUserEmail(storedEmail);
    }

    // Set user name and generate initials
    if (storedUserName) {
      setUserName(storedUserName);
      setAvatarInitials(generateInitials(storedUserName));
    } else if (storedEmail) {
      // Generate name from email if userName not available
      const nameFromEmail = storedEmail.split("@")[0];
      const formattedName = nameFromEmail
        .split(".")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      setUserName(formattedName);
      setAvatarInitials(generateInitials(formattedName));
    } else {
      // Use fallback
      setAvatarInitials(generateInitials("User"));
    }
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

  const generateInitials = (name) => {
    if (!name || typeof name !== "string") return "U";
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

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
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-sm font-medium">{userName}</p>
            <p className="text-xs text-gray-500">{userEmail}</p>
          </div>

          <div className="w-9 h-9 bg-blue-500 text-white flex items-center justify-center rounded-full text-xs font-semibold">
            {avatarInitials}
          </div>
        </div>

      </div>
    </div>
  );
}

export default Navbar;
