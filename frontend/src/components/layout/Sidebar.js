import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Box,
  Calendar,
  Ticket,
  Bell,
  Settings
} from "lucide-react";

function Sidebar({ role = "admin" }) {
  const location = useLocation();

  // 🟦 Admin Menu
  const adminMenu = [
    { name: "Dashboard", path: "/admin/dashboard", icon: <LayoutDashboard size={18} /> },
    { name: "Resources", path: "/admin/resources", icon: <Box size={18} /> },
    { name: "Bookings", path: "/admin/bookings", icon: <Calendar size={18} /> },
    { name: "Tickets", path: "/admin/tickets", icon: <Ticket size={18} /> },
    { name: "Notifications", path: "/admin/notifications", icon: <Bell size={18} /> },
    { name: "Settings", path: "/admin/settings", icon: <Settings size={18} /> },
  ];

  // 🟩 Student Menu
  const studentMenu = [
    { name: "Dashboard", path: "/student/dashboard", icon: <LayoutDashboard size={18} /> },
    { name: "Resources", path: "/student/resources", icon: <Box size={18} /> },
    { name: "My Bookings", path: "/student/bookings", icon: <Calendar size={18} /> },
    { name: "Tickets", path: "/tickets", icon: <Ticket size={18} /> },
    { name: "Notifications", path: "/student/notifications", icon: <Bell size={18} /> },
    { name: "Settings", path: "/student/settings", icon: <Settings size={18} /> },
  ];

  // 🎯 Select menu based on role
  const menu = role === "student" ? studentMenu : adminMenu;

  return (
    <div className="w-64 h-screen bg-white border-r flex flex-col justify-between">
      
      {/* Top */}
      <div>
        <div className="p-5 flex items-center gap-2">
          <div className="bg-blue-500 text-white px-2 py-1 rounded font-bold">
            SC
          </div>
          <div>
            <h2 className="font-semibold text-sm">Smart Campus</h2>
            <p className="text-xs text-gray-500">Operations Hub</p>
          </div>
        </div>

        {/* Menu */}
        <ul className="px-3 space-y-2">
          {menu.map((item) => (
            <li key={item.name}>
              <Link
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition
                  ${
                    location.pathname === item.path
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
      <div className="p-4 text-red-500 text-sm cursor-pointer">
        Logout
      </div>

    </div>
  );
}

export default Sidebar;
