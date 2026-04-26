import api from "./api";

export const getAllTickets = () => {
  return api.get("/tickets");
};

export const getTicketsByUserId = (userId) => {
  return api.get(`/tickets/user/${userId}`);
};

export const createTicket = (ticket) => {
  return api.post("/tickets", ticket);
};

export const updateTicketStatus = (id, status) => {
  return api.put(`/tickets/${id}/status`, { status });
};

export const updateTicket = (id, ticket) => {
  return api.put(`/tickets/${id}`, ticket);
};

export const deleteTicket = (id) => {
  return api.delete(`/tickets/${id}`);
};
