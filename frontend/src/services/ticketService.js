import api from "./api";

export const getAllTickets = () => {
  return api.get("/tickets");
};

export const getTicketsByUserId = (userId) => {
  return api.get(`/tickets/user/${userId}`);
};

export const searchTickets = (keyword) => {
  return api.get(`/tickets/search?keyword=${encodeURIComponent(keyword)}`);
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

export const addTicketReply = (id, message) => {
  return api.post(`/tickets/${id}/replies`, { message });
};

export const getTicketReplies = (id) => {
  return api.get(`/tickets/${id}/replies`);
};

export const updateTicketReply = (replyId, message) => {
  return api.put(`/tickets/replies/${replyId}`, { message });
};

export const deleteTicketReply = (replyId) => {
  return api.delete(`/tickets/replies/${replyId}`);
};
