import axios from "./api";

const API = "http://localhost:8080/api/booking";

export const createBooking = async (data) => {
  const res = await axios.post("/booking", data);
  return res.data;
};

export const getBookings = async () => {
  const res = await axios.get(API);
  return res.data;
};