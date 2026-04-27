import { Bell } from "lucide-react";
import { Link } from "react-router-dom";

function Navbar({ role = "admin" }) {
  const isStudent = role === "student";
  const userName = isStudent ? "John Doe" : "Admin User";
  const userEmail = isStudent ? "student@campus.edu" : "admin@campus.edu";
  const userInitials = isStudent ? "JD" : "AU";

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
          to={isStudent ? "/student/notifications" : "/admin/notifications"}
          className="relative"
          aria-label="Notifications"
        >
          <Bell className="text-gray-600" />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1 rounded-full">
            3
          </span>
        </Link>

        {/* User */}
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-sm font-medium">{userName}</p>
            <p className="text-xs text-gray-500">{userEmail}</p>
          </div>

          <div className="w-9 h-9 bg-blue-500 text-white flex items-center justify-center rounded-full">
            {userInitials}
          </div>
        </div>

      </div>
    </div>
  );
}

export default Navbar;
