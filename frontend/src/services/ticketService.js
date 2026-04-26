import api from "./api";

export const getAllTickets = () => {
  return api.get("/tickets");
};
