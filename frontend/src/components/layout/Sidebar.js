import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Box,
  Calendar,
  Ticket,
  Bell,
  Settings,
} from "lucide-react";

function Sidebar({ role = "admin" }) {
  const location = useLocation();
  const navigate = useNavigate();

  const isActiveRoute = (itemPath) => {
    if (itemPath === "/student/bookings") {
      return location.pathname.includes("/student/bookings");
    }

    return location.pathname === itemPath;
  };

  const adminMenu = [
    { name: "Dashboard", path: "/admin/dashboard", icon: <LayoutDashboard size={18} /> },
    { name: "Resources", path: "/admin/resources", icon: <Box size={18} /> },
    { name: "Bookings", path: "/admin/bookings", icon: <Calendar size={18} /> },
    { name: "Tickets", path: "/admin/tickets", icon: <Ticket size={18} /> },
    { name: "Notifications", path: "/admin/notifications", icon: <Bell size={18} /> },
    { name: "Settings", path: "/admin/settings", icon: <Settings size={18} /> },
  ];

  const studentMenu = [
    { name: "Dashboard", path: "/student/dashboard", icon: <LayoutDashboard size={18} /> },
    { name: "Resources", path: "/student/resources", icon: <Box size={18} /> },
    { name: "My Bookings", path: "/student/bookings", icon: <Calendar size={18} /> },
    { name: "Tickets", path: "/tickets", icon: <Ticket size={18} /> },
    { name: "Notifications", path: "/student/notifications", icon: <Bell size={18} /> },
    { name: "Settings", path: "/student/settings", icon: <Settings size={18} /> },
  ];

  const menu = role === "student" ? studentMenu : adminMenu;

  const handleLogout = () => {
    const confirmed = window.confirm("Are you sure you want to logout?");

    if (!confirmed) {
      return;
    }

    localStorage.clear();
    sessionStorage.clear();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex h-screen w-64 flex-col justify-between border-r bg-white">
      <div>
        <div className="flex items-center gap-2 p-5">
          <div className="rounded bg-blue-500 px-2 py-1 font-bold text-white">SC</div>
          <div>
            <h2 className="text-sm font-semibold">Smart Campus</h2>
            <p className="text-xs text-gray-500">Operations Hub</p>
          </div>
        </div>

        <ul className="space-y-2 px-3">
          {menu.map((item) => (
            <li key={item.name}>
              <Link
                to={item.path}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                  isActiveRoute(item.path)
                    ? "bg-blue-500 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Bottom */}
      <button
        type="button"
        onClick={handleLogout}
        className="p-4 text-left text-sm text-red-500 cursor-pointer hover:text-red-600"
      >
        Logout
      </button>

    </div>
  );
}

export default Sidebar;
