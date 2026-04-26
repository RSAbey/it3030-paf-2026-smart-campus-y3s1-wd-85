package com.it3030.smartcampus.backend.service;

import com.it3030.smartcampus.backend.entity.Ticket;
import com.it3030.smartcampus.backend.repository.TicketRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;

    public TicketService(TicketRepository ticketRepository) {
        this.ticketRepository = ticketRepository;
    }

    public Ticket createTicket(Ticket ticket) {
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

    public Ticket getTicketById(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + id));
    }

    public Ticket updateTicket(Long id, Ticket updatedTicket) {
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
}
