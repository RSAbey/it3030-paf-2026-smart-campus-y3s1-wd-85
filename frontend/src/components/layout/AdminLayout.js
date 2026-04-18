import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

function AdminLayout({ children }) {
  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1">
        <Navbar />

        <div className="p-6 bg-gray-100 min-h-screen">
          {children}
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;