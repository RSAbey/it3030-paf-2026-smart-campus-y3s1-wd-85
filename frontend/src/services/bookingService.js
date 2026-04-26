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
  const res = await axios.get(`/booking/user/${userId}`);
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

  const res = await axios.put(`/booking/${id}/cancel`);
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

export const rejectBooking = async (id) => {
  const res = await axios.put(`/booking/${id}/reject`);
  return res.data;
};

export const deleteBooking = async (id) => {
  const res = await axios.delete(`/booking/${id}`);
  return res.data;
};
