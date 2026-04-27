import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

function AdminLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="fixed left-0 top-0 z-20 h-full w-64 border-r bg-white">
        <Sidebar />
      </aside>

      <div className="ml-64 flex h-screen flex-1 flex-col overflow-hidden">
        <header className="fixed left-64 right-0 top-0 z-10 flex h-16 items-center border-b bg-white px-6">
          <Navbar role="admin" />
        </header>

        <main className="mt-16 flex-1 overflow-y-auto bg-gray-100 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
