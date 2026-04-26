import { useEffect, useState } from "react";
import AdminLayout from "../components/layout/AdminLayout";
import { getAllTickets } from "../services/ticketService";

function TicketPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadTickets = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getAllTickets();
        setTickets(response.data);
      } catch (err) {
        setError("Failed to load tickets.");
      } finally {
        setLoading(false);
      }
    };

    loadTickets();
  }, []);

  const formatCreatedAt = (createdAt) => {
    if (!createdAt) {
      return "-";
    }

    const date = new Date(createdAt);
    if (Number.isNaN(date.getTime())) {
      return createdAt;
    }

    return date.toLocaleString();
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Tickets</h1>

      <div className="bg-white p-5 rounded-xl shadow">
        {loading && <p className="text-sm text-gray-500">Loading tickets...</p>}

        {!loading && error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {!loading && !error && tickets.length === 0 && (
          <p className="text-sm text-gray-500">No tickets found.</p>
        )}

        {!loading && !error && tickets.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-3 pr-4">ID</th>
                  <th className="py-3 pr-4">Title</th>
                  <th className="py-3 pr-4">Category</th>
                  <th className="py-3 pr-4">Priority</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3 pr-4">Created</th>
                  <th className="py-3 pr-4">Location</th>
                  <th className="py-3 pr-4">Assigned</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="border-b last:border-b-0">
                    <td className="py-3 pr-4 text-gray-600">#{ticket.id}</td>
                    <td className="py-3 pr-4 font-medium text-gray-800">
                      <div>{ticket.title || "Untitled Ticket"}</div>
                      <div className="text-xs font-normal text-gray-500 mt-1">
                        {ticket.description || "No description provided."}
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-gray-600">{ticket.category || "-"}</td>
                    <td className="py-3 pr-4 text-gray-600">{ticket.priority || "-"}</td>
                    <td className="py-3 pr-4">
                      <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                        {ticket.status || "-"}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-gray-600">
                      {formatCreatedAt(ticket.createdAt)}
                    </td>
                    <td className="py-3 pr-4 text-gray-600">{ticket.location || "-"}</td>
                    <td className="py-3 pr-4 text-gray-600">
                      {ticket.assignedTechnician || "Unassigned"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default TicketPage;
