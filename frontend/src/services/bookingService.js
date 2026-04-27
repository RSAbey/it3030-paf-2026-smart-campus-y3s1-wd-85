import axios from "./api";

export const getResources = async () => {
  const res = await axios.get("/resources");
  return res.data;
};

export const createBooking = async (data) => {
  const res = await axios.post("/booking", data);
  return res.data;
};

export const getBookings = async (userId) => {
  const res = await axios.get(`/booking/my-bookings/${userId}`);
  return res.data;
};

export const getAllBookings = async () => {
  const res = await axios.get("/booking");
  return res.data;
};

export const checkConflict = async (data) => {
  const res = await axios.post("/booking/check", data);
  return res.data;
};

export const cancelBooking = async (id) => {
  console.log("cancelBooking service ID:", id);

  if (id === undefined || id === null || typeof id === "object") {
    throw new Error("Invalid booking ID for cancel");
  }

  const res = await axios.delete(`/booking/${id}`);
  return res.data;
};

export const updateBooking = async (id, data) => {
  const res = await axios.put(`/booking/${id}`, data);
  return res.data;
};

export const approveBooking = async (id) => {
  const res = await axios.put(`/booking/${id}/approve`);
  return res.data;
};

export const rejectBooking = async (id, reason) => {
  const res = await axios.put(`/booking/${id}/reject`, { reason });
  return res.data;
};

export const getBookingByQrCode = async (qrCode) => {
  const encodedQrCode = encodeURIComponent(qrCode);
  const res = await axios.get(`/booking/qr/code/${encodedQrCode}`);
  return res.data;
};

export const validateQrCode = async (qrCode) => {
  const res = await axios.put(`/booking/qr/validate/${qrCode}`);
  return res.data;
};

export const deleteBooking = async (id) => {
  const res = await axios.delete(`/booking/${id}`);
  return res.data;
};
