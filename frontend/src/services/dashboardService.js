import axios from "axios";

const BASE_URL = "http://localhost:8080/api/dashboard";

export const getStudentDashboard = () => {
  const stored = localStorage.getItem("smart-campus-auth");
  const auth = stored ? JSON.parse(stored) : null;

  return axios.get(`${BASE_URL}/student`, {
    headers: auth?.token
      ? {
          Authorization: `Bearer ${auth.token}`,
        }
      : {},
  });
};
