function StatCard({ title, value, icon, color }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow flex justify-between items-center">
      
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <h2 className="text-2xl font-bold mt-1">{value}</h2>
      </div>

      <div className={`w-12 h-12 flex items-center justify-center rounded-lg ${color}`}>
        {icon}
      </div>

    </div>
  );
}

export default StatCard;