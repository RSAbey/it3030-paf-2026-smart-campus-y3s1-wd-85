function Navbar() {
  return (
    <div className="flex justify-between items-center bg-white px-6 py-3 shadow">
      <h1 className="text-lg font-semibold">Smart Campus</h1>

      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500">Admin User</span>
        <div className="w-8 h-8 bg-blue-500 text-white flex items-center justify-center rounded-full">
          AU
        </div>
      </div>
    </div>
  );
}

export default Navbar;