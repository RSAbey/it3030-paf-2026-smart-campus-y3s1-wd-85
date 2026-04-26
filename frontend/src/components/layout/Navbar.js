import { Bell } from "lucide-react";
import { useEffect, useState } from "react";

function Navbar() {
  const [userName, setUserName] = useState("User");
  const [userEmail, setUserEmail] = useState("user@email.com");
  const [avatarInitials, setAvatarInitials] = useState("U");

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
        <div className="relative">
          <Bell className="text-gray-600" />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1 rounded-full">
            3
          </span>
        </div>

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