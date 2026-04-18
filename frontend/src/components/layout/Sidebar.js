import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <div className="w-64 h-screen bg-gray-100 p-4">
      <h2 className="text-xl font-bold mb-6">SC</h2>

      <ul className="space-y-3">
        <li><Link to="/admin/dashboard">Dashboard</Link></li>
        <li><Link to="/admin/resources">Resources</Link></li>
        <li><Link to="/admin/bookings">Bookings</Link></li>
        <li><Link to="/admin/tickets">Tickets</Link></li>
        <li><Link to="/admin/notifications">Notifications</Link></li>
        <li><Link to="/admin/settings">Settings</Link></li>
      </ul>
    </div>
  );
}

export default Sidebar;