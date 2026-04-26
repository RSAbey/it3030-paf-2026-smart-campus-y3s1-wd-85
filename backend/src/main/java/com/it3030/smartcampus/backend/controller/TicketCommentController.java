package com.it3030.smartcampus.backend.controller;

import com.it3030.smartcampus.backend.entity.TicketComment;
import com.it3030.smartcampus.backend.service.TicketCommentService;
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

@RestController
@RequestMapping("/api/tickets/{ticketId}/comments")
@CrossOrigin(origins = "http://localhost:3000")
public class TicketCommentController {

    private final TicketCommentService ticketCommentService;

    public TicketCommentController(TicketCommentService ticketCommentService) {
        this.ticketCommentService = ticketCommentService;
    }

    @PostMapping
    public ResponseEntity<TicketComment> addComment(@PathVariable Long ticketId, @RequestBody TicketComment comment) {
        TicketComment savedComment = ticketCommentService.addComment(ticketId, comment);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedComment);
    }

    @GetMapping
    public ResponseEntity<List<TicketComment>> getCommentsByTicket(@PathVariable Long ticketId) {
        return ResponseEntity.ok(ticketCommentService.getCommentsByTicket(ticketId));
    }
}
