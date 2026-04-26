package com.it3030.smartcampus.backend.service;

import com.it3030.smartcampus.backend.entity.TicketComment;
import com.it3030.smartcampus.backend.repository.TicketCommentRepository;
import com.it3030.smartcampus.backend.repository.TicketRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TicketCommentService {

    private final TicketCommentRepository ticketCommentRepository;
    private final TicketRepository ticketRepository;

    public TicketCommentService(TicketCommentRepository ticketCommentRepository, TicketRepository ticketRepository) {
        this.ticketCommentRepository = ticketCommentRepository;
        this.ticketRepository = ticketRepository;
    }

    public TicketComment addComment(Long ticketId, TicketComment comment) {
        validateTicketExists(ticketId);

        if (comment.getCommentText() == null || comment.getCommentText().isBlank()) {
            throw new RuntimeException("Comment text is required");
        }

        comment.setTicketId(ticketId);
        comment.setCreatedAt(LocalDateTime.now());

        return ticketCommentRepository.save(comment);
    }

    public List<TicketComment> getCommentsByTicket(Long ticketId) {
        validateTicketExists(ticketId);
        return ticketCommentRepository.findByTicketIdOrderByCreatedAtDesc(ticketId);
    }

    private void validateTicketExists(Long ticketId) {
        if (!ticketRepository.existsById(ticketId)) {
            throw new RuntimeException("Ticket not found with id: " + ticketId);
        }
    }
}
