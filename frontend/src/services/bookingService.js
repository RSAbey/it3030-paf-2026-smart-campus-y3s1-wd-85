import axios from "./api";

export const createBooking = async (data) => {
  const res = await axios.post("/booking", data);
  return res.data;
};

export const getBookings = async (userId) => {
  const res = await axios.get(`/booking/user/${userId}`);
  return res.data;
};

export const checkConflict = async (data) => {
  const res = await axios.post("/booking/check", data);
  return res.data;
};

export const cancelBooking = async (id) => {
  const res = await axios.put(`/booking/${id}/cancel`);
  return res.data;
};

export const updateBooking = async (id, data) => {
  const res = await axios.put(`/booking/${id}`, data);
  return res.data;
};

export const deleteBooking = async (id) => {
  const res = await axios.delete(`/booking/${id}`);
  return res.data;
};
