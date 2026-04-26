import api from "./api";

export const getAllTickets = () => {
  return api.get("/tickets");
};

export const createTicket = (ticket) => {
  return api.post("/tickets", ticket);
};
