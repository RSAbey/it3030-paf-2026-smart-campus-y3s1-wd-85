import { useEffect, useState } from "react";
import AdminLayout from "../components/layout/AdminLayout";
import {
  createTicket,
  getAllTickets,
  updateTicketStatus,
} from "../services/ticketService";

const STATUS_OPTIONS = [
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
  "REJECTED",
];

function TicketPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [updatingTicketId, setUpdatingTicketId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    priority: "",
    location: "",
    preferredContact: "",
  });

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

  useEffect(() => {
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

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "",
      priority: "",
      location: "",
      preferredContact: "",
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError("");
      setSuccessMessage("");

      await createTicket({
        ...formData,
        userId: 1,
        status: "OPEN",
        assignedTechnician: "Nimal",
      });

      resetForm();
      setShowForm(false);
      setSuccessMessage("Ticket created successfully.");
      await loadTickets();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create ticket.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (ticketId, status) => {
    try {
      setUpdatingTicketId(ticketId);
      setError("");
      setSuccessMessage("");
      await updateTicketStatus(ticketId, status);
      setSuccessMessage("Ticket status updated successfully.");
      await loadTickets();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update ticket status.");
    } finally {
      setUpdatingTicketId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Tickets</h1>
        <button
          type="button"
          onClick={() => setShowForm((prev) => !prev)}
          className="border border-blue-600 text-blue-600 py-2 px-4 rounded-lg font-medium"
        >
          + Create Ticket
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white w-full max-w-2xl p-6 rounded-xl shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-semibold text-gray-800">Create Ticket</h2>
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
                className="text-gray-500 text-sm"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Title"
                className="border rounded-lg px-3 py-2 text-sm"
              />
              <input
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="Category"
                className="border rounded-lg px-3 py-2 text-sm"
              />
              <input
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                placeholder="Priority"
                className="border rounded-lg px-3 py-2 text-sm"
              />
              <input
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Location"
                className="border rounded-lg px-3 py-2 text-sm"
              />
              <input
                name="preferredContact"
                value={formData.preferredContact}
                onChange={handleChange}
                placeholder="Preferred Contact"
                className="border rounded-lg px-3 py-2 text-sm col-span-2"
              />
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Description"
                className="border rounded-lg px-3 py-2 text-sm col-span-2 min-h-[120px]"
              />
              <div className="col-span-2 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                  className="border border-gray-300 text-gray-600 py-2 px-4 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 text-white py-2 px-4 rounded-lg font-medium disabled:opacity-70"
                >
                  {submitting ? "Creating..." : "Create Ticket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white p-5 rounded-xl shadow">
        {!loading && !error && successMessage && (
          <div className="bg-green-50 text-green-600 px-4 py-3 rounded-lg text-sm mb-4">
            {successMessage}
          </div>
        )}

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
                  <th className="py-3 pr-4">Update Status</th>
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
                    <td className="py-3 pr-4">
                      <select
                        value={ticket.status || "OPEN"}
                        onChange={(event) =>
                          handleStatusChange(ticket.id, event.target.value)
                        }
                        disabled={updatingTicketId === ticket.id}
                        className="border rounded-lg px-3 py-2 text-xs text-gray-700 bg-white"
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
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
