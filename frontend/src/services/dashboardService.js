import axios from "axios";

const BASE_URL = "http://localhost:8080/api/dashboard";

export const getStudentDashboard = (userId) => {
  return axios.get(`${BASE_URL}/student/${userId}`);
};