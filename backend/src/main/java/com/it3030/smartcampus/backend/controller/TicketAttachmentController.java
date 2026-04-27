package com.it3030.smartcampus.backend.controller;

import com.it3030.smartcampus.backend.entity.TicketAttachment;
import com.it3030.smartcampus.backend.service.TicketAttachmentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets/{ticketId}/attachments")
@CrossOrigin(origins = "http://localhost:3000")
public class TicketAttachmentController {

    private final TicketAttachmentService ticketAttachmentService;

    public TicketAttachmentController(TicketAttachmentService ticketAttachmentService) {
        this.ticketAttachmentService = ticketAttachmentService;
    }

    @PostMapping
    public ResponseEntity<TicketAttachment> addAttachment(@PathVariable Long ticketId, @RequestBody Map<String, String> request) {
        TicketAttachment attachment = ticketAttachmentService.addAttachment(ticketId, request.get("imageUrl"));
        return ResponseEntity.status(HttpStatus.CREATED).body(attachment);
    }

    @GetMapping
    public ResponseEntity<List<TicketAttachment>> getAttachmentsByTicket(@PathVariable Long ticketId) {
        return ResponseEntity.ok(ticketAttachmentService.getAttachmentsByTicket(ticketId));
    }
}
