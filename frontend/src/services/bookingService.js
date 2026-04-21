import axios from "axios";

const API = "http://localhost:8080/api/booking";

export const createBooking = (data) => axios.post(API, data);

export const getBookings = () => axios.get(API);