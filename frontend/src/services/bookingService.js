import axios from "./api";

const api = axios;
const API = "http://localhost:8080/api/booking";

export const createBooking = async (data) => {
  const res = await axios.post("/booking", data);
  return res.data;
};

export const getBookings = async () => {
  const res = await axios.get(API);
  return res.data;
};

export const checkConflict = async (data) => {
  const res = await api.post("/booking/check", data);
  return res.data;
};
