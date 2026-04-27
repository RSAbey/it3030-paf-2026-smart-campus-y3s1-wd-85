import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Box,
  Calendar,
  CheckCircle,
  Edit,
  Filter,
  MapPin,
  Plus,
  RefreshCw,
  Save,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";
import AdminLayout from "../components/layout/AdminLayout";
import StatCard from "../components/dashboard/StatCard";
import {
  createResource,
  deleteResource,
  getResourceAvailability,
  getResources,
  updateResource,
} from "../services/api";

const RESOURCE_TYPES = [
  "LECTURE_HALL",
  "LAB",
  "MEETING_ROOM",
  "EQUIPMENT",
  "PROJECTOR",
  "CAMERA",
];

const STATUS_OPTIONS = ["ACTIVE", "OUT_OF_SERVICE"];

const DEFAULT_FORM = {
  name: "",
  type: "",
  capacity: "",
  location: "",
  status: "ACTIVE",
};

const DEFAULT_FILTERS = {
  keyword: "",
  type: "",
  status: "",
  location: "",
  minCapacity: "",
};

function getTodayValue() {
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
}

function getResourceList(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.content)) {
    return data.content;
  }

  if (Array.isArray(data?.resources)) {
    return data.resources;
  }

  return [];
}

function formatLabel(value) {
  if (!value) {
    return "Unknown";
  }

  return String(value)
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function normalizeStatus(value) {
  return String(value || "").toUpperCase();
}

function isActiveResourceStatus(value) {
  const normalized = normalizeStatus(value);
  return normalized === "ACTIVE" || normalized === "AVAILABLE" || normalized === "SUCCESS";
}

function isOutOfServiceStatus(value) {
  const normalized = normalizeStatus(value);
  return normalized === "OUT_OF_SERVICE" || normalized === "ERROR" || normalized === "UNAVAILABLE";
}

function getErrorMessage(error, fallback) {
  return error?.response?.data?.message || error?.message || fallback;
}

function coerceSlot(slot, fallbackStatus) {
  if (typeof slot === "string") {
    return {
      label: slot,
      status: fallbackStatus,
    };
  }

  const start = slot?.startTime || slot?.start || slot?.from || slot?.timeStart;
  const end = slot?.endTime || slot?.end || slot?.to || slot?.timeEnd;
  const label = slot?.label || slot?.time || (start && end ? `${start} - ${end}` : start || end);
  const status =
    slot?.status ||
    slot?.availabilityStatus ||
    slot?.state ||
    (slot?.available === true ? "AVAILABLE" : "") ||
    (slot?.available === false ? "BOOKED" : "") ||
    fallbackStatus;

  return {
    ...slot,
    label: label || "Time slot",
    status,
  };
}

function normalizeSlots(data) {
  if (Array.isArray(data)) {
    return data.map((slot) => coerceSlot(slot, slot?.status || "AVAILABLE"));
  }

  if (Array.isArray(data?.slots)) {
    return data.slots.map((slot) => coerceSlot(slot, slot?.status || "AVAILABLE"));
  }

  if (Array.isArray(data?.availability)) {
    return data.availability.map((slot) => coerceSlot(slot, slot?.status || "AVAILABLE"));
  }

  const slots = [];

  if (Array.isArray(data?.availableSlots)) {
    slots.push(...data.availableSlots.map((slot) => coerceSlot(slot, "AVAILABLE")));
  }

  if (Array.isArray(data?.bookedSlots)) {
    slots.push(...data.bookedSlots.map((slot) => coerceSlot(slot, "BOOKED")));
  }

  return slots;
}

function getSlotClass(status) {
  const normalized = normalizeStatus(status);

  if (normalized.includes("AVAILABLE") || normalized === "FREE") {
    return "border-green-200 bg-green-50 text-green-700";
  }

  if (normalized.includes("BOOKED") || normalized.includes("UNAVAILABLE")) {
    return "border-red-200 bg-red-50 text-red-700";
  }

  return "border-yellow-200 bg-yellow-50 text-yellow-700";
}

function ResourcePage() {
  const [resources, setResources] = useState([]);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [availabilityResourceId, setAvailabilityResourceId] = useState("");
  const [availabilityDate, setAvailabilityDate] = useState(getTodayValue());
  const [availabilitySlots, setAvailabilitySlots] = useState([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState("");

  const loadResources = async ({ clearMessage = false } = {}) => {
    setLoading(true);

    if (clearMessage) {
      setMessage(null);
    }

    try {
      const response = await getResources();
      const resourceList = getResourceList(response.data);
      setResources(resourceList);

      if (!availabilityResourceId && resourceList.length > 0) {
        setAvailabilityResourceId(String(resourceList[0].id));
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: getErrorMessage(error, "Could not connect to the resource API. Please check the backend server."),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      const keyword = filters.keyword.trim().toLowerCase();
      const location = filters.location.trim().toLowerCase();
      const type = normalizeStatus(resource.type);
      const status = normalizeStatus(resource.status);
      const capacity = Number(resource.capacity || 0);

      const matchesKeyword =
        !keyword ||
        String(resource.name || "").toLowerCase().includes(keyword) ||
        String(resource.id || "").toLowerCase().includes(keyword);
      const matchesType = !filters.type || type === filters.type;
      const matchesStatus = !filters.status || status === filters.status;
      const matchesLocation =
        !location || String(resource.location || "").toLowerCase().includes(location);
      const matchesCapacity =
        !filters.minCapacity || capacity >= Number(filters.minCapacity);

      return matchesKeyword && matchesType && matchesStatus && matchesLocation && matchesCapacity;
    });
  }, [filters, resources]);

  const summary = useMemo(() => {
    return {
      total: resources.length,
      active: resources.filter((resource) => isActiveResourceStatus(resource.status)).length,
      outOfService: resources.filter((resource) => isOutOfServiceStatus(resource.status)).length,
      totalCapacity: resources.reduce((sum, resource) => sum + Number(resource.capacity || 0), 0),
    };
  }, [resources]);

  const typeOptions = useMemo(() => {
    const returnedTypes = resources.map((resource) => resource.type).filter(Boolean);
    return Array.from(new Set([...RESOURCE_TYPES, ...returnedTypes]));
  }, [resources]);

  const selectedAvailabilityResource = resources.find(
    (resource) => String(resource.id) === String(availabilityResourceId)
  );

  const openAddModal = () => {
    setEditingResource(null);
    setFormData(DEFAULT_FORM);
    setFormErrors({});
    setModalOpen(true);
  };

  const openEditModal = (resource) => {
    setEditingResource(resource);
    setFormData({
      name: resource.name || "",
      type: resource.type || "",
      capacity: resource.capacity || "",
      location: resource.location || "",
      status: normalizeStatus(resource.status) || "ACTIVE",
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const closeModal = () => {
    if (!saving) {
      setModalOpen(false);
      setEditingResource(null);
      setFormData(DEFAULT_FORM);
      setFormErrors({});
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = "Resource name is required.";
    }

    if (!formData.type) {
      errors.type = "Resource type is required.";
    }

    if (!formData.capacity || Number(formData.capacity) <= 0) {
      errors.capacity = "Capacity must be greater than 0.";
    }

    if (!formData.location.trim()) {
      errors.location = "Location is required.";
    }

    if (!formData.status) {
      errors.status = "Status is required.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const submitResource = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSaving(true);
    setMessage(null);

    const payload = {
      name: formData.name.trim(),
      type: formData.type,
      capacity: Number(formData.capacity),
      location: formData.location.trim(),
      status: formData.status,
    };

    try {
      if (editingResource) {
        await updateResource(editingResource.id, payload);
      } else {
        await createResource(payload);
      }

      setModalOpen(false);
      setEditingResource(null);
      setFormData(DEFAULT_FORM);
      await loadResources();
      setMessage({
        type: "success",
        text: editingResource ? "Resource updated successfully." : "Resource created successfully.",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: getErrorMessage(error, "Could not save the resource. Please try again."),
      });
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    setDeleting(true);
    setMessage(null);

    try {
      await deleteResource(deleteTarget.id);
      setDeleteTarget(null);
      await loadResources();
      setMessage({ type: "success", text: "Resource deleted successfully." });

      if (String(availabilityResourceId) === String(deleteTarget.id)) {
        setAvailabilityResourceId("");
        setAvailabilitySlots([]);
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: getErrorMessage(error, "Could not delete the resource. Please try again."),
      });
    } finally {
      setDeleting(false);
    }
  };

  const loadAvailability = async (resourceId = availabilityResourceId, date = availabilityDate) => {
    if (!resourceId || !date) {
      setAvailabilityError("Select a resource and date before loading availability.");
      return;
    }

    setAvailabilityLoading(true);
    setAvailabilityError("");
    setAvailabilitySlots([]);

    try {
      const response = await getResourceAvailability(resourceId, date);
      setAvailabilitySlots(normalizeSlots(response.data));
    } catch (error) {
      setAvailabilityError(
        getErrorMessage(
          error,
          "Could not load availability. Confirm the backend endpoint is running."
        )
      );
    } finally {
      setAvailabilityLoading(false);
    }
  };

  const checkAvailabilityForResource = (resource) => {
    setAvailabilityResourceId(String(resource.id));
    document.getElementById("resource-availability")?.scrollIntoView({ behavior: "smooth" });
    loadAvailability(resource.id, availabilityDate);
  };

  return (
    <AdminLayout>
      <div className="space-y-6 text-gray-800" style={{ fontFamily: "Inter, Poppins, sans-serif" }}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">Facilities Admin</p>
            <h1 className="text-2xl font-bold text-gray-800">
              Facilities & Resource Management
            </h1>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-blue-700"
          >
            <Plus size={18} />
            Add Resource
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Resources"
            value={summary.total}
            icon={<Box className="text-white" />}
            color="bg-blue-500"
          />
          <StatCard
            title="Active Resources"
            value={summary.active}
            icon={<CheckCircle className="text-white" />}
            color="bg-green-500"
          />
          <StatCard
            title="Out of Service"
            value={summary.outOfService}
            icon={<AlertTriangle className="text-white" />}
            color="bg-red-500"
          />
          <StatCard
            title="Total Capacity"
            value={summary.totalCapacity}
            icon={<Users className="text-white" />}
            color="bg-yellow-500"
          />
        </div>

        {message && (
          <div
            className={`rounded-lg border px-4 py-3 text-sm ${
              message.type === "success"
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="rounded-xl bg-white p-5 shadow">
          <div className="mb-4 flex items-center gap-2">
            <Filter size={18} className="text-blue-600" />
            <h2 className="font-semibold text-gray-800">Search & Filter Resources</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
            <label className="space-y-1 xl:col-span-2">
              <span className="text-xs font-medium text-gray-500">Keyword / Name</span>
              <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 focus-within:border-blue-500">
                <Search size={16} className="text-gray-400" />
                <input
                  type="text"
                  name="keyword"
                  value={filters.keyword}
                  onChange={handleFilterChange}
                  placeholder="Search resource name or ID"
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>
            </label>

            <label className="space-y-1">
              <span className="text-xs font-medium text-gray-500">Type</span>
              <select
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
              >
                <option value="">All types</option>
                {typeOptions.map((type) => (
                  <option key={type} value={type}>
                    {formatLabel(type)}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-xs font-medium text-gray-500">Status</span>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
              >
                <option value="">All statuses</option>
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {formatLabel(status)}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-xs font-medium text-gray-500">Location</span>
              <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 focus-within:border-blue-500">
                <MapPin size={16} className="text-gray-400" />
                <input
                  type="text"
                  name="location"
                  value={filters.location}
                  onChange={handleFilterChange}
                  placeholder="Building or floor"
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>
            </label>

            <label className="space-y-1">
              <span className="text-xs font-medium text-gray-500">Min Capacity</span>
              <input
                type="number"
                min="1"
                name="minCapacity"
                value={filters.minCapacity}
                onChange={handleFilterChange}
                placeholder="0"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
            </label>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-500">
              Showing {filteredResources.length} of {resources.length} resources
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
            >
              <X size={16} />
              Clear Filters
            </button>
          </div>
        </div>

        <div className="rounded-xl bg-white shadow">
          <div className="flex flex-col gap-3 border-b px-5 py-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-semibold text-gray-800">Resource Inventory</h2>
              <p className="text-sm text-gray-500">Manage facilities, rooms, and equipment.</p>
            </div>

            <button
              type="button"
              onClick={() => loadResources({ clearMessage: true })}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-5 py-3">ID</th>
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Capacity</th>
                  <th className="px-5 py-3">Location</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-5 py-10 text-center text-gray-500">
                      Loading resources...
                    </td>
                  </tr>
                ) : filteredResources.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-5 py-10 text-center text-gray-500">
                      No resources found. Adjust filters or add a new resource.
                    </td>
                  </tr>
                ) : (
                  filteredResources.map((resource) => (
                    <tr key={resource.id} className="hover:bg-gray-50">
                      <td className="px-5 py-4 font-medium text-gray-700">#{resource.id}</td>
                      <td className="px-5 py-4">
                        <div className="font-semibold text-gray-800">{resource.name}</div>
                      </td>
                      <td className="px-5 py-4 text-gray-600">{formatLabel(resource.type)}</td>
                      <td className="px-5 py-4 text-gray-600">{resource.capacity}</td>
                      <td className="px-5 py-4 text-gray-600">{resource.location}</td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            isActiveResourceStatus(resource.status)
                              ? "bg-green-100 text-green-700"
                              : isOutOfServiceStatus(resource.status)
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {formatLabel(resource.status)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(resource)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-blue-100 text-blue-600 transition hover:bg-blue-50"
                            title="Edit resource"
                            aria-label={`Edit ${resource.name}`}
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(resource)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-100 text-red-600 transition hover:bg-red-50"
                            title="Delete resource"
                            aria-label={`Delete ${resource.name}`}
                          >
                            <Trash2 size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => checkAvailabilityForResource(resource)}
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-green-100 px-3 py-2 text-xs font-semibold text-green-700 transition hover:bg-green-50"
                          >
                            <Calendar size={15} />
                            Check Availability
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div id="resource-availability" className="rounded-xl bg-white p-5 shadow">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-semibold text-gray-800">Smart Availability Calendar</h2>
              <p className="text-sm text-gray-500">
                Check available and booked time slots for a selected resource.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_220px_auto]">
            <label className="space-y-1">
              <span className="text-xs font-medium text-gray-500">Resource</span>
              <select
                value={availabilityResourceId}
                onChange={(event) => setAvailabilityResourceId(event.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
              >
                <option value="">Select resource</option>
                {resources.map((resource) => (
                  <option key={resource.id} value={resource.id}>
                    {resource.name} - {formatLabel(resource.type)}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-xs font-medium text-gray-500">Date</span>
              <input
                type="date"
                value={availabilityDate}
                onChange={(event) => setAvailabilityDate(event.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
            </label>

            <div className="flex items-end">
              <button
                type="button"
                onClick={() => loadAvailability()}
                disabled={availabilityLoading || !availabilityResourceId || !availabilityDate}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
              >
                <Calendar size={16} />
                {availabilityLoading ? "Loading..." : "Load Availability"}
              </button>
            </div>
          </div>

          {selectedAvailabilityResource && (
            <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
              Selected: {selectedAvailabilityResource.name} on {availabilityDate}
            </div>
          )}

          {availabilityError && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {availabilityError}
            </div>
          )}

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {availabilityLoading ? (
              <div className="col-span-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
                Loading availability slots...
              </div>
            ) : availabilitySlots.length === 0 ? (
              <div className="col-span-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
                No availability slots returned for this date.
              </div>
            ) : (
              availabilitySlots.map((slot, index) => (
                <div
                  key={`${slot.label}-${index}`}
                  className={`rounded-lg border px-4 py-3 ${getSlotClass(slot.status)}`}
                >
                  <div className="font-semibold">{slot.label}</div>
                  <div className="mt-1 text-xs uppercase tracking-wide">
                    {formatLabel(slot.status)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4 py-6">
          <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div>
                <h2 className="font-semibold text-gray-800">
                  {editingResource ? "Edit Resource" : "Add New Resource"}
                </h2>
                <p className="text-sm text-gray-500">Enter facility or equipment details.</p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100"
                aria-label="Close form"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={submitResource} className="space-y-4 p-5">
              <label className="block space-y-1">
                <span className="text-sm font-medium text-gray-700">Name</span>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                  placeholder="Lecture Hall A"
                />
                {formErrors.name && <p className="text-xs text-red-600">{formErrors.name}</p>}
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block space-y-1">
                  <span className="text-sm font-medium text-gray-700">Type</span>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleFormChange}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                  >
                    <option value="">Select type</option>
                    {typeOptions.map((type) => (
                      <option key={type} value={type}>
                        {formatLabel(type)}
                      </option>
                    ))}
                  </select>
                  {formErrors.type && <p className="text-xs text-red-600">{formErrors.type}</p>}
                </label>

                <label className="block space-y-1">
                  <span className="text-sm font-medium text-gray-700">Capacity</span>
                  <input
                    type="number"
                    min="1"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleFormChange}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                    placeholder="120"
                  />
                  {formErrors.capacity && (
                    <p className="text-xs text-red-600">{formErrors.capacity}</p>
                  )}
                </label>
              </div>

              <label className="block space-y-1">
                <span className="text-sm font-medium text-gray-700">Location</span>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleFormChange}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                  placeholder="Building 1 - Floor 2"
                />
                {formErrors.location && (
                  <p className="text-xs text-red-600">{formErrors.location}</p>
                )}
              </label>

              <label className="block space-y-1">
                <span className="text-sm font-medium text-gray-700">Status</span>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleFormChange}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {formatLabel(status)}
                    </option>
                  ))}
                </select>
                {formErrors.status && <p className="text-xs text-red-600">{formErrors.status}</p>}
              </label>

              <div className="flex flex-col-reverse gap-3 border-t pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="inline-flex items-center justify-center rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save size={16} />
                  {saving ? "Saving..." : "Save Resource"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4 py-6">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-red-600">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h2 className="font-semibold text-gray-800">Delete Resource</h2>
                <p className="text-sm text-gray-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-sm text-gray-600">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-800">{deleteTarget.name}</span>?
            </p>

            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Trash2 size={16} />
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default ResourcePage;
