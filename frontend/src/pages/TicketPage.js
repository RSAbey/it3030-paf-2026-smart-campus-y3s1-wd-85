import { useEffect, useState } from "react";
import AdminLayout from "../components/layout/AdminLayout";
import StudentLayout from "../components/layout/StudentLayout";
import {
  createTicket,
  deleteTicket,
  getAllTickets,
  getTicketsByUserId,
  updateTicket,
  updateTicketStatus,
} from "../services/ticketService";

const STATUS_OPTIONS = [
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
  "REJECTED",
];

const CATEGORY_OPTIONS = [
  "Facilities",
  "Equipment",
  "Network",
  "Emergency",
  "Other",
];

const PRIORITY_OPTIONS = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
];

const CURRENT_USER_ID = 1;
const PROGRESS_STEPS = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];

function TicketPage({ role = "student" }) {
  const isStudent = role === "student";
  const isAdmin = role === "admin";
  const Layout = isStudent ? StudentLayout : AdminLayout;
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [updatingTicketId, setUpdatingTicketId] = useState(null);
  const [editingTicket, setEditingTicket] = useState(null);
  const [deletingTicketId, setDeletingTicketId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    priority: "",
    preferredContact: "",
  });

  const loadTickets = async () => {
    try {
      setLoading(true);
      setError("");
      const response = isStudent
        ? await getTicketsByUserId(CURRENT_USER_ID)
        : await getAllTickets();
      setTickets(response.data);
    } catch (err) {
      console.error("Failed to load tickets", err.response?.data || err);
      setError(err.response?.data?.error || "Failed to load tickets.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (ticketId, status) => {
    if (!status) {
      return;
    }

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

  useEffect(() => {
    loadTickets();

    const intervalId = setInterval(() => {
      loadTickets();
    }, 5000);

    return () => clearInterval(intervalId);
  }, [role]);

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

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case "CRITICAL":
        return "bg-red-100 text-red-700";
      case "HIGH":
        return "bg-orange-100 text-orange-700";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-700";
      case "LOW":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "OPEN":
        return "bg-blue-100 text-blue-700";
      case "IN_PROGRESS":
        return "bg-yellow-100 text-yellow-700";
      case "RESOLVED":
        return "bg-green-100 text-green-700";
      case "CLOSED":
        return "bg-gray-200 text-gray-700";
      case "REJECTED":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getActiveStepCount = (status) => {
    switch (status) {
      case "OPEN":
        return 1;
      case "IN_PROGRESS":
        return 2;
      case "RESOLVED":
        return 3;
      case "CLOSED":
        return 4;
      default:
        return 0;
    }
  };

  const getNextStatusOptions = (currentStatus) => {
    switch (currentStatus) {
      case "OPEN":
        return ["IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"];
      case "IN_PROGRESS":
        return ["RESOLVED", "CLOSED", "REJECTED"];
      case "RESOLVED":
        return ["CLOSED"];
      case "CLOSED":
      case "REJECTED":
        return [];
      default:
        return [];
    }
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
      preferredContact: "",
    });
  };

  const closeForm = () => {
    resetForm();
    setEditingTicket(null);
    setShowForm(false);
  };

  const openCreateForm = () => {
    resetForm();
    setEditingTicket(null);
    setShowForm(true);
  };

  const openEditForm = (ticket) => {
    setFormData({
      title: ticket.title || "",
      description: ticket.description || "",
      category: ticket.category || "",
      priority: ticket.priority || "",
      preferredContact: ticket.preferredContact || "",
    });
    setEditingTicket(ticket);
    setShowForm(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError("");
      setSuccessMessage("");

      const payload = {
        ...formData,
        location: "Campus",
        userId: editingTicket?.userId || CURRENT_USER_ID,
        status: editingTicket?.status || "OPEN",
        assignedTechnician: editingTicket?.assignedTechnician || "Nimal",
        resolutionNotes: editingTicket?.resolutionNotes || "",
      };

      console.log("Create ticket payload", payload);

      if (editingTicket) {
        await updateTicket(editingTicket.id, payload);
        setSuccessMessage("Ticket updated successfully.");
      } else {
        await createTicket(payload);
        setSuccessMessage("Ticket created successfully.");
      }

      closeForm();
      await loadTickets();
    } catch (err) {
      console.error("Create ticket failed", err.response?.data || err);
      setError(
        err.response?.data?.error ||
          (editingTicket ? "Failed to update ticket." : "Failed to create ticket.")
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this ticket?"
    );

    if (!isConfirmed) {
      return;
    }

    try {
      setDeletingTicketId(ticketId);
      setError("");
      setSuccessMessage("");
      await deleteTicket(ticketId);
      setSuccessMessage("Ticket deleted successfully.");
      await loadTickets();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete ticket.");
    } finally {
      setDeletingTicketId(null);
    }
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Tickets</h1>
        <button
          type="button"
          onClick={openCreateForm}
          className="border border-blue-600 text-blue-600 py-2 px-4 rounded-lg font-medium"
        >
          + Create Ticket
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white w-full max-w-2xl p-6 rounded-xl shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingTicket ? "Edit Ticket" : "Create Ticket"}
              </h2>
              <button
                type="button"
                onClick={closeForm}
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
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="border rounded-lg px-3 py-2 text-sm"
              >
                <option value="">Select Category</option>
                {CATEGORY_OPTIONS.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="border rounded-lg px-3 py-2 text-sm"
              >
                <option value="">Select Priority</option>
                {PRIORITY_OPTIONS.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
              <input
                name="preferredContact"
                value={formData.preferredContact}
                onChange={handleChange}
                placeholder="Preferred Contact"
                className="border rounded-lg px-3 py-2 text-sm"
              />
              <div />
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
                  onClick={closeForm}
                  className="border border-gray-300 text-gray-600 py-2 px-4 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 text-white py-2 px-4 rounded-lg font-medium disabled:opacity-70"
                >
                  {submitting
                    ? editingTicket
                      ? "Saving..."
                      : "Creating..."
                    : editingTicket
                      ? "Save Changes"
                      : "Create Ticket"}
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
          <div className="space-y-4">
            {tickets.map((ticket) => {
              const activeStepCount = getActiveStepCount(ticket.status);
              const nextStatusOptions = getNextStatusOptions(ticket.status);
              const isStatusLocked = nextStatusOptions.length === 0;

              return (
                <div
                  key={ticket.id}
                  className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {ticket.title || "Untitled Ticket"}
                        </h3>
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getPriorityBadgeClass(
                            ticket.priority
                          )}`}
                        >
                          {ticket.priority || "No Priority"}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 mb-4">
                        {ticket.description || "No description provided."}
                      </p>

                      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500 mb-4">
                        <span>Ticket ID: #{ticket.id}</span>
                        <span>Category: {ticket.category || "-"}</span>
                        <span>Created: {formatCreatedAt(ticket.createdAt)}</span>
                        <span>Location: {ticket.location || "-"}</span>
                        <span>
                          Assigned: {ticket.assignedTechnician || "Unassigned"}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {PROGRESS_STEPS.map((step, index) => {
                          const isActive = index < activeStepCount;

                          return (
                            <div key={step} className="flex flex-col gap-2">
                              <span className="text-xs font-medium text-gray-500">
                                {step === "IN_PROGRESS"
                                  ? "In Progress"
                                  : step.charAt(0) + step.slice(1).toLowerCase()}
                              </span>
                              <div
                                className={`h-2 rounded-full ${
                                  isActive ? "bg-blue-500" : "bg-gray-200"
                                }`}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="w-full lg:w-56 flex-shrink-0">
                      <div className="flex flex-wrap justify-start lg:justify-end gap-2 mb-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeClass(
                            ticket.status
                          )}`}
                        >
                          {ticket.status || "-"}
                        </span>
                        {ticket.slaDuration && (
                          <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                            SLA: {ticket.slaDuration}
                          </span>
                        )}
                      </div>

                      {isAdmin && (
                        <div className="mb-4">
                          <label className="block text-xs font-medium text-gray-500 mb-2">
                            Update Status
                          </label>
                          <select
                            value=""
                            onChange={(event) =>
                              handleStatusChange(ticket.id, event.target.value)
                            }
                            disabled={
                              updatingTicketId === ticket.id || isStatusLocked
                            }
                            className="w-full border rounded-lg px-3 py-2 text-sm text-gray-700 bg-white"
                          >
                            <option value="">
                              {isStatusLocked
                                ? "No further status changes"
                                : "Select next status"}
                            </option>
                            {nextStatusOptions.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2 lg:justify-end">
                        <button
                          type="button"
                          onClick={() => openEditForm(ticket)}
                          className="border border-gray-300 text-gray-600 py-2 px-4 rounded-lg text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTicket(ticket.id)}
                          disabled={deletingTicketId === ticket.id}
                          className="border border-red-200 text-red-600 py-2 px-4 rounded-lg text-sm font-medium disabled:opacity-70"
                        >
                          {deletingTicketId === ticket.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default TicketPage;
