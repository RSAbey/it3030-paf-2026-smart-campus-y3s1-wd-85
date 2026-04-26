package com.it3030.smartcampus.backend.service;

import com.it3030.smartcampus.backend.entity.TicketReply;
import com.it3030.smartcampus.backend.repository.TicketReplyRepository;
import com.it3030.smartcampus.backend.repository.TicketRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TicketReplyService {

    private final TicketReplyRepository ticketReplyRepository;
    private final TicketRepository ticketRepository;

    public TicketReplyService(TicketReplyRepository ticketReplyRepository, TicketRepository ticketRepository) {
        this.ticketReplyRepository = ticketReplyRepository;
        this.ticketRepository = ticketRepository;
    }

    public TicketReply addReply(Long ticketId, String message) {
        if (!ticketRepository.existsById(ticketId)) {
            throw new RuntimeException("Ticket not found with id: " + ticketId);
        }

        if (message == null || message.isBlank()) {
            throw new RuntimeException("Reply message is required");
        }

        TicketReply reply = new TicketReply();
        reply.setTicketId(ticketId);
        reply.setMessage(message);
        reply.setCreatedAt(LocalDateTime.now());

        return ticketReplyRepository.save(reply);
    }

    public List<TicketReply> getRepliesByTicket(Long ticketId) {
        if (!ticketRepository.existsById(ticketId)) {
            throw new RuntimeException("Ticket not found with id: " + ticketId);
        }

        return ticketReplyRepository.findByTicketIdOrderByCreatedAtAsc(ticketId);
    }

    public TicketReply updateReply(Long replyId, String message) {
        TicketReply reply = ticketReplyRepository.findById(replyId)
                .orElseThrow(() -> new RuntimeException("Reply not found with id: " + replyId));

        if (message == null || message.isBlank()) {
            throw new RuntimeException("Reply message is required");
        }

        reply.setMessage(message.trim());
        return ticketReplyRepository.save(reply);
    }

    public void deleteReply(Long replyId) {
        if (!ticketReplyRepository.existsById(replyId)) {
            throw new RuntimeException("Reply not found with id: " + replyId);
        }

        ticketReplyRepository.deleteById(replyId);
    }
}
