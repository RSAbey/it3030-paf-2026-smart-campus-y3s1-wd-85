import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || "http://localhost:8080/api",
});

api.interceptors.request.use((config) => {
  console.log("API CALL TEST");
  console.log("API Request:", `${config.baseURL}${config.url}`);
  return config;
});

const cleanParams = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== "" && value !== null && value !== undefined
    )
  );

export const getResources = (filters = {}) =>
  api.get("/resources", { params: cleanParams(filters) });

export const getResourceById = (id) => api.get(`/resources/${id}`);

export const createResource = (data) => api.post("/resources", data);

export const updateResource = (id, data) => api.put(`/resources/${id}`, data);

export const deleteResource = (id) => api.delete(`/resources/${id}`);

export const getResourceAvailability = (id, date) =>
  api.get(`/resources/${id}/availability`, { params: { date } });

export default api;
