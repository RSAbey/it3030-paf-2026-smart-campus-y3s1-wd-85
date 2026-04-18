import { Bell } from "lucide-react";

function Navbar() {
  return (
    <div className="flex justify-between items-center bg-white px-6 py-3 border-b">
      
      {/* Title */}
      <div>
        <h1 className="text-lg font-semibold">Smart Campus</h1>
        <p className="text-xs text-gray-500">Operations Hub</p>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-5">
        
        {/* Notification */}
        <div className="relative">
          <Bell className="text-gray-600" />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1 rounded-full">
            3
          </span>
        </div>

        {/* User */}
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-sm font-medium">Admin User</p>
            <p className="text-xs text-gray-500">admin@campus.edu</p>
          </div>

          <div className="w-9 h-9 bg-blue-500 text-white flex items-center justify-center rounded-full">
            AU
          </div>
        </div>

      </div>
    </div>
  );
}

export default Navbar;