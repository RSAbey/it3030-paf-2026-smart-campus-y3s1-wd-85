package com.it3030.smartcampus.backend.service;

import com.it3030.smartcampus.backend.entity.Ticket;
import com.it3030.smartcampus.backend.repository.TicketRepository;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;

    public TicketService(TicketRepository ticketRepository) {
        this.ticketRepository = ticketRepository;
    }

    public Ticket createTicket(Ticket ticket) {
        validateTicket(ticket);
        ticket.setCreatedAt(LocalDateTime.now());
        ticket.setUpdatedAt(LocalDateTime.now());

        if (ticket.getStatus() == null) {
            ticket.setStatus("OPEN");
        }

        return ticketRepository.save(ticket);
    }

    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    public List<Ticket> getRecentTickets() {
        return ticketRepository.findTop10ByOrderByIdDesc();
    }

    public Map<String, Long> getTicketSummary() {
        return Map.of(
                "totalTickets", ticketRepository.count(),
                "openTickets", ticketRepository.countByStatus("OPEN"),
                "inProgressTickets", ticketRepository.countByStatus("IN_PROGRESS"),
                "resolvedTickets", ticketRepository.countByStatus("RESOLVED"),
                "closedTickets", ticketRepository.countByStatus("CLOSED"),
                "rejectedTickets", ticketRepository.countByStatus("REJECTED"),
                "highPriorityTickets", ticketRepository.countByPriority("HIGH"),
                "criticalPriorityTickets", ticketRepository.countByPriority("CRITICAL")
        );
    }

    public List<Ticket> getTicketsByStatus(String status) {
        if (status == null || status.isBlank()) {
            throw new RuntimeException("Status is required");
        }

        return ticketRepository.findByStatus(status);
    }

    public List<Ticket> getTicketsByPriority(String priority) {
        if (priority == null || priority.isBlank()) {
            throw new RuntimeException("Priority is required");
        }

        return ticketRepository.findByPriority(priority);
    }

    public List<Ticket> searchTickets(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            throw new RuntimeException("Search keyword is required");
        }

        return ticketRepository.findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(keyword, keyword);
    }

    public Ticket getTicketById(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + id));
    }

    public Ticket updateTicket(Long id, Ticket updatedTicket) {
        validateTicket(updatedTicket);
        Ticket existingTicket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + id));

        existingTicket.setTitle(updatedTicket.getTitle());
        existingTicket.setDescription(updatedTicket.getDescription());
        existingTicket.setCategory(updatedTicket.getCategory());
        existingTicket.setPriority(updatedTicket.getPriority());
        existingTicket.setStatus(updatedTicket.getStatus());
        existingTicket.setLocation(updatedTicket.getLocation());
        existingTicket.setPreferredContact(updatedTicket.getPreferredContact());
        existingTicket.setAssignedTechnician(updatedTicket.getAssignedTechnician());
        existingTicket.setResolutionNotes(updatedTicket.getResolutionNotes());
        existingTicket.setUpdatedAt(LocalDateTime.now());

        return ticketRepository.save(existingTicket);
    }

    public void deleteTicket(Long id) {
        if (!ticketRepository.existsById(id)) {
            throw new RuntimeException("Ticket not found with id: " + id);
        }

        ticketRepository.deleteById(id);
    }

    public Ticket updateTicketStatus(Long id, String status) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + id));

        List<String> allowedStatuses = Arrays.asList(
                "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"
        );

        if (!allowedStatuses.contains(status)) {
            throw new RuntimeException("Invalid ticket status: " + status);
        }

        ticket.setStatus(status);
        ticket.setUpdatedAt(LocalDateTime.now());

        return ticketRepository.save(ticket);
    }

    public Ticket assignTechnician(Long id, String assignedTechnician) {
        if (assignedTechnician == null || assignedTechnician.isBlank()) {
            throw new RuntimeException("Technician name is required");
        }

        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + id));

        ticket.setAssignedTechnician(assignedTechnician);
        ticket.setUpdatedAt(LocalDateTime.now());

        return ticketRepository.save(ticket);
    }

    public String getTicketSlaDuration(Long id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + id));

        LocalDateTime startTime = ticket.getCreatedAt();
        LocalDateTime endTime;

        if ("RESOLVED".equals(ticket.getStatus()) || "CLOSED".equals(ticket.getStatus())) {
            endTime = ticket.getUpdatedAt();
        } else {
            endTime = LocalDateTime.now();
        }

        Duration duration = Duration.between(startTime, endTime);
        long hours = duration.toHours();
        long minutes = duration.toMinutesPart();

        return hours + " hours " + minutes + " minutes";
    }

    private void validateTicket(Ticket ticket) {
        if (ticket.getTitle() == null || ticket.getTitle().isBlank()) {
            throw new RuntimeException("Title is required");
        }

        if (ticket.getDescription() == null || ticket.getDescription().isBlank()) {
            throw new RuntimeException("Description is required");
        }

        if (ticket.getCategory() == null || ticket.getCategory().isBlank()) {
            throw new RuntimeException("Category is required");
        }

        if (ticket.getPriority() == null || ticket.getPriority().isBlank()) {
            throw new RuntimeException("Priority is required");
        }

        List<String> allowedPriorities = Arrays.asList("LOW", "MEDIUM", "HIGH", "CRITICAL");
        if (!allowedPriorities.contains(ticket.getPriority())) {
            throw new RuntimeException("Invalid ticket priority: " + ticket.getPriority());
        }

        if (ticket.getLocation() == null || ticket.getLocation().isBlank()) {
            throw new RuntimeException("Location is required");
        }

        if (ticket.getPreferredContact() == null || ticket.getPreferredContact().isBlank()) {
            throw new RuntimeException("Preferred contact is required");
        }

        if (ticket.getStatus() != null && !ticket.getStatus().isBlank()) {
            List<String> allowedStatuses = Arrays.asList(
                    "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"
            );

            if (!allowedStatuses.contains(ticket.getStatus())) {
                throw new RuntimeException("Invalid ticket status: " + ticket.getStatus());
            }
        }
    }
}
