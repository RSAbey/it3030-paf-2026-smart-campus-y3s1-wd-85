package com.it3030.smartcampus.backend.service;

import com.it3030.smartcampus.backend.entity.Ticket;
import com.it3030.smartcampus.backend.entity.TicketAttachment;
import com.it3030.smartcampus.backend.repository.TicketAttachmentRepository;
import com.it3030.smartcampus.backend.repository.TicketRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final TicketAttachmentRepository ticketAttachmentRepository;

    @Value("${ticket.upload.dir:uploads/tickets}")
    private String ticketUploadDir;

    public TicketService(TicketRepository ticketRepository, TicketAttachmentRepository ticketAttachmentRepository) {
        this.ticketRepository = ticketRepository;
        this.ticketAttachmentRepository = ticketAttachmentRepository;
    }

    public Ticket createTicket(Ticket ticket) {
        return createTicket(ticket, Collections.emptyList());
    }

    public Ticket createTicket(Ticket ticket, List<MultipartFile> images) {
        validateTicket(ticket);
        List<MultipartFile> validImages = filterUploadedImages(images);
        validateImages(validImages);

        LocalDateTime now = LocalDateTime.now();
        ticket.setCreatedAt(now);
        ticket.setUpdatedAt(now);
        if (ticket.getStatus() == null) {
            ticket.setStatus("OPEN");
        }

        Ticket savedTicket = ticketRepository.save(ticket);
        saveAttachments(savedTicket.getId(), validImages, now);

        return savedTicket;
    }

    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    public List<Ticket> getTicketsByUserId(Long userId) {
        return ticketRepository.findByUserId(userId);
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

        List<String> allowedStatuses = Arrays.asList("OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED");
        if (status == null || !allowedStatuses.contains(status)) {
            throw new RuntimeException("Invalid ticket status: " + status);
        }

        String currentStatus = ticket.getStatus();
        List<String> allowedTransitions;

        switch (currentStatus) {
            case "OPEN":
                allowedTransitions = Arrays.asList("IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED");
                break;
            case "IN_PROGRESS":
                allowedTransitions = Arrays.asList("RESOLVED", "CLOSED", "REJECTED");
                break;
            case "RESOLVED":
                allowedTransitions = Arrays.asList("CLOSED");
                break;
            case "CLOSED":
            case "REJECTED":
                allowedTransitions = List.of();
                break;
            default:
                throw new RuntimeException("Invalid status transition from " + currentStatus + " to " + status);
        }

        if (!allowedTransitions.contains(status)) {
            throw new RuntimeException("Invalid status transition from " + currentStatus + " to " + status);
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

    private List<MultipartFile> filterUploadedImages(List<MultipartFile> images) {
        if (images == null) {
            return Collections.emptyList();
        }

        return images.stream()
                .filter(image -> image != null && !image.isEmpty())
                .collect(Collectors.toList());
    }

    private void validateImages(List<MultipartFile> images) {
        if (images.size() > 3) {
            throw new RuntimeException("Maximum 3 images allowed");
        }

        for (MultipartFile image : images) {
            String contentType = image.getContentType();
            if (!"image/jpeg".equalsIgnoreCase(contentType)
                    && !"image/jpg".equalsIgnoreCase(contentType)
                    && !"image/png".equalsIgnoreCase(contentType)) {
                throw new RuntimeException("Only JPG, JPEG, and PNG images are allowed");
            }
        }
    }

    private void saveAttachments(Long ticketId, List<MultipartFile> images, LocalDateTime uploadedAt) {
        if (images.isEmpty()) {
            return;
        }

        try {
            Path uploadDirectory = Paths.get(ticketUploadDir);
            Files.createDirectories(uploadDirectory);

            for (MultipartFile image : images) {
                String originalFileName = image.getOriginalFilename() == null
                        ? "image"
                        : Paths.get(image.getOriginalFilename()).getFileName().toString();
                String storedFileName = UUID.randomUUID() + "-" + originalFileName;
                Path targetPath = uploadDirectory.resolve(storedFileName);

                Files.copy(image.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

                TicketAttachment attachment = new TicketAttachment();
                attachment.setTicketId(ticketId);
                attachment.setImageUrl(ticketUploadDir.replace("\\", "/") + "/" + storedFileName);
                attachment.setUploadedAt(uploadedAt);

                ticketAttachmentRepository.save(attachment);
            }
        } catch (IOException exception) {
            throw new RuntimeException("Failed to save ticket images");
        }
    }
}
