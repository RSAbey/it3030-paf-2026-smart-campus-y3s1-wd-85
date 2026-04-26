package com.it3030.smartcampus.backend.controller;

import com.it3030.smartcampus.backend.entity.TicketReply;
import com.it3030.smartcampus.backend.service.TicketReplyService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = "http://localhost:3000")
public class TicketReplyController {

    private final TicketReplyService ticketReplyService;

    public TicketReplyController(TicketReplyService ticketReplyService) {
        this.ticketReplyService = ticketReplyService;
    }

    @PostMapping("/{ticketId}/replies")
    public ResponseEntity<TicketReply> addReply(@PathVariable Long ticketId, @RequestBody Map<String, String> request) {
        String message = request.get("message");
        TicketReply reply = ticketReplyService.addReply(ticketId, message);
        return ResponseEntity.status(HttpStatus.CREATED).body(reply);
    }

    @GetMapping("/{ticketId}/replies")
    public ResponseEntity<List<TicketReply>> getRepliesByTicket(@PathVariable Long ticketId) {
        return ResponseEntity.ok(ticketReplyService.getRepliesByTicket(ticketId));
    }

    @PutMapping("/replies/{replyId}")
    public ResponseEntity<?> updateReply(@PathVariable Long replyId, @RequestBody Map<String, String> request) {
        String message = request.get("message");

        if (message == null || message.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Reply message is required"));
        }

        TicketReply reply = ticketReplyService.updateReply(replyId, message);
        return ResponseEntity.ok(reply);
    }

    @DeleteMapping("/replies/{replyId}")
    public ResponseEntity<Void> deleteReply(@PathVariable Long replyId) {
        ticketReplyService.deleteReply(replyId);
        return ResponseEntity.noContent().build();
    }
}
