package com.it3030.smartcampus.backend.service;

import com.it3030.smartcampus.backend.entity.TicketAttachment;
import com.it3030.smartcampus.backend.repository.TicketAttachmentRepository;
import com.it3030.smartcampus.backend.repository.TicketRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TicketAttachmentService {

    private final TicketAttachmentRepository ticketAttachmentRepository;
    private final TicketRepository ticketRepository;

    public TicketAttachmentService(TicketAttachmentRepository ticketAttachmentRepository, TicketRepository ticketRepository) {
        this.ticketAttachmentRepository = ticketAttachmentRepository;
        this.ticketRepository = ticketRepository;
    }

    public TicketAttachment addAttachment(Long ticketId, String imageUrl) {
        validateTicketExists(ticketId);

        if (imageUrl == null || imageUrl.isBlank()) {
            throw new RuntimeException("Image URL is required");
        }

        if (ticketAttachmentRepository.countByTicketId(ticketId) >= 3) {
            throw new RuntimeException("Maximum 3 attachments allowed per ticket");
        }

        TicketAttachment attachment = new TicketAttachment();
        attachment.setTicketId(ticketId);
        attachment.setImageUrl(imageUrl);
        attachment.setUploadedAt(LocalDateTime.now());

        return ticketAttachmentRepository.save(attachment);
    }

    public List<TicketAttachment> getAttachmentsByTicket(Long ticketId) {
        validateTicketExists(ticketId);
        return ticketAttachmentRepository.findByTicketId(ticketId);
    }

    private void validateTicketExists(Long ticketId) {
        if (!ticketRepository.existsById(ticketId)) {
            throw new RuntimeException("Ticket not found with id: " + ticketId);
        }
    }
}
