import api from "./api";

export const NOTIFICATION_CATEGORIES = [
  "Academic",
  "Maintenance",
  "Emergency",
  "Booking",
  "Tickets",
  "General",
];

export const NOTIFICATION_PRIORITIES = ["Low", "Medium", "High", "Critical"];
export const NOTIFICATION_STATUSES = ["Draft", "Published"];
export const NOTIFICATION_VISIBILITIES = ["Public", "Private"];

function authConfig() {
  return {
    headers: {
      "X-User-Email": localStorage.getItem("userEmail") || "",
    },
  };
}

export function getAdminNotifications() {
  return api.get("/admin/notifications", authConfig());
}

export function createNotification(payload) {
  return api.post("/admin/notifications", payload, authConfig());
}

export function updateNotification(id, payload) {
  return api.put(`/admin/notifications/${id}`, payload, authConfig());
}

export function deleteNotification(id) {
  return api.delete(`/admin/notifications/${id}`, authConfig());
}

export function publishNotification(id, published) {
  return api.patch(`/admin/notifications/${id}/publish`, { published }, authConfig());
}

export function updateNotificationVisibility(id, payload) {
  return api.patch(`/admin/notifications/${id}/visibility`, payload, authConfig());
}

export function getStudentNotifications() {
  return api.get("/student/notifications", authConfig());
}

export function markNotificationRead(id) {
  return api.patch(`/student/notifications/${id}/read`, {}, authConfig());
}

export function markNotificationUnread(id) {
  return api.patch(`/student/notifications/${id}/unread`, {}, authConfig());
}

export function getNotificationSettings() {
  return api.get("/student/notifications/settings", authConfig());
}

export function saveNotificationSettings(payload) {
  return api.put("/student/notifications/settings", payload, authConfig());
}
