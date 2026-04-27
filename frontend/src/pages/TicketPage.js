import { useEffect, useState } from "react";
import AdminLayout from "../components/layout/AdminLayout";
import StudentLayout from "../components/layout/StudentLayout";
import {
  addTicketReply,
  createTicket,
  deleteTicket,
  deleteTicketReply,
  getAllTickets,
  getTicketReplies,
  getTicketsByUserId,
  updateTicket,
  updateTicketStatus,
  updateTicketReply,
} from "../services/ticketService";

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

const STATUS_FILTER_OPTIONS = [
  { value: "ALL", label: "All Status" },
  { value: "OPEN", label: "Open" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "CLOSED", label: "Closed" },
];

const CURRENT_USER_ID = 1;
const PROGRESS_STEPS = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];

function TicketPage({ role = "student" }) {
  const isStudent = role === "student";
  const isAdmin = role === "admin";
  const Layout = isStudent ? StudentLayout : AdminLayout;
  const [allTickets, setAllTickets] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [updatingTicketId, setUpdatingTicketId] = useState(null);
  const [editingTicket, setEditingTicket] = useState(null);
  const [deletingTicketId, setDeletingTicketId] = useState(null);
  const [expandedRepliesByTicket, setExpandedRepliesByTicket] = useState({});
  const [replyingTicketId, setReplyingTicketId] = useState(null);
  const [sendingReplyTicketId, setSendingReplyTicketId] = useState(null);
  const [editingReplyId, setEditingReplyId] = useState(null);
  const [editingReplyMessage, setEditingReplyMessage] = useState("");
  const [savingReplyId, setSavingReplyId] = useState(null);
  const [deletingReplyId, setDeletingReplyId] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [replyMessage, setReplyMessage] = useState("");
  const [repliesByTicket, setRepliesByTicket] = useState({});
  const [images, setImages] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    priority: "",
    preferredContact: "",
  });

  const sortTicketsByNewest = (ticketList) =>
    [...ticketList].sort(
      (firstTicket, secondTicket) =>
        new Date(secondTicket.createdAt || 0) - new Date(firstTicket.createdAt || 0)
    );

  const matchesCurrentFilters = (ticket) => {
    const trimmedKeyword = searchKeyword.trim();
    const loweredKeyword = trimmedKeyword.toLowerCase();

    const matchesKeyword =
      !trimmedKeyword ||
      [
        ticket.title,
        ticket.description,
        ticket.category,
        ticket.status,
        ticket.priority,
      ].some((value) => value && value.toLowerCase().includes(loweredKeyword));

    const matchesStatus =
      statusFilter === "ALL" || ticket.status === statusFilter;

    return matchesKeyword && matchesStatus;
  };

  const loadTickets = async () => {
    try {
      setLoading(true);
      setError("");
      const response = isStudent
        ? await getTicketsByUserId(CURRENT_USER_ID)
        : await getAllTickets();

      setAllTickets(sortTicketsByNewest(response.data));
    } catch (err) {
      console.error("Failed to load tickets", err.response?.data || err);
      console.error(err);
      setError(err.response?.data?.error || "Failed to load tickets.");
    } finally {
      setLoading(false);
    }
  };

  const loadReplies = async (visibleTickets) => {
    if (!visibleTickets.length) {
      setRepliesByTicket({});
      return;
    }

    try {
      const repliesEntries = await Promise.all(
        visibleTickets.map(async (ticket) => {
          const response = await getTicketReplies(ticket.id);
          return [ticket.id, response.data];
        })
      );

      setRepliesByTicket(Object.fromEntries(repliesEntries));
    } catch (err) {
      console.error("Failed to load ticket replies", err.response?.data || err);
      console.error(err);
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
      console.error("Failed to update ticket status", err.response?.data || err);
      console.error(err);
      setError(err.response?.data?.error || "Failed to update ticket status.");
    } finally {
      setUpdatingTicketId(null);
    }
  };

  useEffect(() => {
    loadTickets();

    const intervalId = setInterval(() => {
      loadTickets();
    }, 60000);

    return () => clearInterval(intervalId);
  }, [role]);

  useEffect(() => {
    const filteredTickets = sortTicketsByNewest(
      allTickets.filter((ticket) => matchesCurrentFilters(ticket))
    );

    setTickets(filteredTickets);
    loadReplies(filteredTickets);
  }, [allTickets, searchKeyword, statusFilter]);

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

  const getTicketCardClass = (status) => {
    switch (status) {
      case "OPEN":
        return "bg-blue-50";
      case "IN_PROGRESS":
        return "bg-yellow-100";
      case "RESOLVED":
        return "bg-green-100";
      case "CLOSED":
        return "bg-gray-200";
      case "REJECTED":
        return "bg-red-100";
      default:
        return "bg-white";
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

  const toggleReplies = (ticketId) => {
    setExpandedRepliesByTicket((current) => ({
      ...current,
      [ticketId]: !current[ticketId],
    }));
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
    setImages([]);
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

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) {
      return;
    }

    const hasInvalidType = files.some(
      (file) => !["image/jpeg", "image/png", "image/jpg"].includes(file.type)
    );

    if (hasInvalidType) {
      setError("Only JPG, JPEG, and PNG images are allowed.");
      event.target.value = "";
      return;
    }

    if (images.length + files.length > 3) {
      setError("Maximum 3 images allowed.");
      event.target.value = "";
      return;
    }

    setError("");
    setImages((currentImages) => [...currentImages, ...files]);
    event.target.value = "";
  };

  const removeImage = (indexToRemove) => {
    setImages((currentImages) =>
      currentImages.filter((_, index) => index !== indexToRemove)
    );
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
        closeForm();
        await loadTickets();
      } else {
        // Image upload preview only for now; backend file upload can be added later.
        const response = await createTicket(payload);
        const newTicket = response.data;
        setAllTickets((currentTickets) =>
          sortTicketsByNewest([
            newTicket,
            ...currentTickets.filter((ticket) => ticket.id !== newTicket.id),
          ])
        );
        setRepliesByTicket((currentReplies) => ({
          ...currentReplies,
          [newTicket.id]: [],
        }));
        setSuccessMessage("Ticket created successfully.");
        closeForm();
      }
    } catch (err) {
      console.error("Create ticket failed", err.response?.data || err);
      console.error(err);
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
      console.error(err);
      setError(err.response?.data?.error || "Failed to delete ticket.");
    } finally {
      setDeletingTicketId(null);
    }
  };

  const updateLocalTicketStatus = (ticketId, status) => {
    setAllTickets((currentTickets) =>
      currentTickets.map((ticket) =>
        ticket.id === ticketId ? { ...ticket, status } : ticket
      )
    );
  };

  const handleOpenReplyForm = async (ticket) => {
    if (ticket.status === "CLOSED" || ticket.status === "REJECTED") {
      setError("Replies are not allowed for closed or rejected tickets.");
      return;
    }

    try {
      setError("");
      setSuccessMessage("");

      if (ticket.status === "OPEN") {
        await updateTicketStatus(ticket.id, "IN_PROGRESS");
        updateLocalTicketStatus(ticket.id, "IN_PROGRESS");
      }

      setReplyingTicketId(ticket.id);
    } catch (err) {
      console.error("Failed to update status before reply", err.response?.data || err);
      console.error(err);
      setError(err.response?.data?.error || "Failed to open reply workflow.");
    }
  };

  const handleReplySubmit = async (ticket) => {
    if (!replyMessage.trim()) {
      setError("Reply message is required.");
      return;
    }

    try {
      setSendingReplyTicketId(ticket.id);
      setError("");
      setSuccessMessage("");

      await addTicketReply(ticket.id, replyMessage.trim());

      if (ticket.status !== "CLOSED" && ticket.status !== "REJECTED" && ticket.status !== "RESOLVED") {
        await updateTicketStatus(ticket.id, "RESOLVED");
        updateLocalTicketStatus(ticket.id, "RESOLVED");
      }

      setReplyMessage("");
      setReplyingTicketId(null);
      setSuccessMessage("Reply sent successfully.");
      await loadTickets();
    } catch (err) {
      console.error("Failed to send reply", err.response?.data || err);
      console.error(err);
      setError(err.response?.data?.error || "Failed to send reply.");
    } finally {
      setSendingReplyTicketId(null);
    }
  };

  const handleEditReply = (replyId, message) => {
    setEditingReplyId(replyId);
    setEditingReplyMessage(message);
  };

  const handleUpdateReply = async (replyId, message) => {
    if (!replyId) {
      console.error("Update reply error: replyId is undefined");
      setError("Failed to update reply");
      return;
    }

    if (!message.trim()) {
      setError("Reply message is required.");
      return;
    }

    try {
      const payload = { message: message.trim() };
      console.log("Updating reply:", {
        replyId,
        message: payload.message,
        url: `http://localhost:8080/api/tickets/replies/${replyId}`
      });

      setSavingReplyId(replyId);
      setError("");
      setSuccessMessage("");
      await updateTicketReply(replyId, payload.message);
      setEditingReplyId(null);
      setEditingReplyMessage("");
      setSuccessMessage("Reply updated successfully.");
      await loadTickets();
    } catch (err) {
      console.error("Reply update failed:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      console.error(err);
      setError("Failed to update reply");
    } finally {
      setSavingReplyId(null);
    }
  };

  const handleDeleteReply = async (replyId) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this reply?"
    );

    if (!isConfirmed) {
      return;
    }

    try {
      setDeletingReplyId(replyId);
      setError("");
      setSuccessMessage("");
      await deleteTicketReply(replyId);
      setSuccessMessage("Reply deleted successfully.");
      await loadTickets();
    } catch (err) {
      console.error("Failed to delete reply", err.response?.data || err);
      console.error(err);
      setError(err.response?.data?.error || "Failed to delete reply.");
    } finally {
      setDeletingReplyId(null);
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

      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="text"
            value={searchKeyword}
            onChange={(event) => setSearchKeyword(event.target.value)}
            placeholder="Search tickets by title or description"
            className="flex-1 border rounded-lg px-3 py-2 text-sm"
          />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="border rounded-lg px-3 py-2 text-sm bg-white"
          >
            {STATUS_FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {searchKeyword && (
            <button
              type="button"
              onClick={() => setSearchKeyword("")}
              className="border border-gray-300 text-gray-600 py-2 px-4 rounded-lg text-sm font-medium"
            >
              Clear
            </button>
          )}
        </div>
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
              {!editingTicket && (
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Attach Images
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={handleImageUpload}
                    className="block w-full border rounded-lg px-3 py-2 text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Upload up to 3 JPG or PNG images.
                  </p>

                  {images.length > 0 && (
                    <div className="flex flex-wrap gap-3 mt-3">
                      {images.map((image, index) => (
                        <div
                          key={`${image.name}-${index}`}
                          className="border border-gray-200 rounded-lg p-2 bg-gray-50"
                        >
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Ticket attachment preview ${index + 1}`}
                            className="w-20 h-20 object-cover rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="mt-2 text-xs text-red-600 font-medium"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
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
              const replies = repliesByTicket[ticket.id] || [];
              const isRepliesExpanded = expandedRepliesByTicket[ticket.id];

              return (
                <div
                  key={ticket.id}
                  className={`${getTicketCardClass(
                    ticket.status
                  )} border border-gray-200 rounded-xl p-5 shadow-sm transition-all duration-200`}
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

                      <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            {replies.length ? (
                              <h4 className="text-sm font-semibold text-gray-800">
                                Admin Replies ({replies.length})
                              </h4>
                            ) : (
                              <p className="text-sm text-gray-500">
                                No admin replies yet.
                              </p>
                            )}
                          </div>

                          {replies.length > 0 && (
                            <button
                              type="button"
                              onClick={() => toggleReplies(ticket.id)}
                              className="text-sm font-medium text-blue-600 whitespace-nowrap"
                            >
                              {isRepliesExpanded ? "Hide replies" : "View replies"}
                            </button>
                          )}
                        </div>

                        {isRepliesExpanded && replies.length > 0 && (
                          <div className="space-y-3 mt-3">
                            {replies.map((reply) => (
                              <div
                                key={reply.id}
                                className="bg-gray-200 border border-gray-300 border-l-4 border-l-blue-500 rounded-lg p-3"
                              >
                                <div className="flex items-center justify-between gap-3 mb-2">
                                  <span className="text-xs font-semibold text-gray-700">
                                    Admin
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {formatCreatedAt(reply.createdAt)}
                                  </span>
                                </div>
                                {isAdmin && editingReplyId === reply.id ? (
                                  <div>
                                    <textarea
                                      value={editingReplyMessage}
                                      onChange={(event) =>
                                        setEditingReplyMessage(event.target.value)
                                      }
                                      className="w-full border rounded-lg px-3 py-2 text-sm min-h-[90px] bg-white"
                                    />
                                    <div className="flex gap-2 mt-3">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleUpdateReply(
                                            editingReplyId,
                                            editingReplyMessage
                                          )
                                        }
                                        disabled={savingReplyId === reply.id}
                                        className="bg-blue-600 text-white py-1 px-3 rounded-lg text-xs font-medium disabled:opacity-70"
                                      >
                                        {savingReplyId === reply.id ? "Saving..." : "Save"}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingReplyId(null);
                                          setEditingReplyMessage("");
                                        }}
                                        className="border border-gray-300 text-gray-600 py-1 px-3 rounded-lg text-xs font-medium"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-700">
                                    {reply.message}
                                  </p>
                                )}
                                {isAdmin && (
                                  <div className="flex gap-2 mt-3">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleEditReply(reply.id, reply.message)
                                      }
                                      disabled={editingReplyId === reply.id}
                                      className="border border-gray-300 text-gray-600 py-1 px-3 rounded-lg text-xs font-medium"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteReply(reply.id)}
                                      disabled={deletingReplyId === reply.id}
                                      className="border border-red-200 text-red-600 py-1 px-3 rounded-lg text-xs font-medium disabled:opacity-70"
                                    >
                                      {deletingReplyId === reply.id ? "Deleting..." : "Delete"}
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

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
                        {isAdmin &&
                          replies.length === 0 &&
                          (ticket.status === "OPEN" || ticket.status === "IN_PROGRESS") && (
                          <button
                            type="button"
                            onClick={() => handleOpenReplyForm(ticket)}
                            className="border border-blue-200 text-blue-600 py-2 px-4 rounded-lg text-sm font-medium"
                          >
                            Reply
                          </button>
                          )}
                        {!isAdmin && (
                          <>
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
                          </>
                        )}
                      </div>

                      {isAdmin && replyingTicketId === ticket.id && (
                        <div className="mt-4 bg-gray-50 rounded-lg p-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Add Reply
                          </label>
                          <textarea
                            value={replyMessage}
                            onChange={(event) => setReplyMessage(event.target.value)}
                            placeholder="Type your reply here"
                            className="w-full border rounded-lg px-3 py-2 text-sm min-h-[100px]"
                          />
                          <div className="flex justify-end gap-3 mt-3">
                            <button
                              type="button"
                              onClick={() => {
                                setReplyMessage("");
                                setReplyingTicketId(null);
                              }}
                              className="border border-gray-300 text-gray-600 py-2 px-4 rounded-lg text-sm font-medium"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReplySubmit(ticket)}
                              disabled={sendingReplyTicketId === ticket.id}
                              className="bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium disabled:opacity-70"
                            >
                              {sendingReplyTicketId === ticket.id ? "Sending..." : "Send"}
                            </button>
                          </div>
                        </div>
                      )}
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
