import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

function StudentLayout({ children }) {
  return (
    <div className="flex">
      <Sidebar role="student" />

      <div className="flex-1">
        <Navbar role="student" />

        <div className="p-6 bg-gray-100 min-h-screen">
          {children}
        </div>
      </div>
    </div>
  );
}

export default StudentLayout;