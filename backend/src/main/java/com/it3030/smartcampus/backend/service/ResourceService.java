package com.it3030.smartcampus.backend.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.it3030.smartcampus.backend.dto.AvailabilitySlotResponse;
import com.it3030.smartcampus.backend.dto.ResourceAvailabilityResponse;
import com.it3030.smartcampus.backend.dto.ResourceRequest;
import com.it3030.smartcampus.backend.dto.ResourceResponse;
import com.it3030.smartcampus.backend.entity.Booking;
import com.it3030.smartcampus.backend.entity.Resource;
import com.it3030.smartcampus.backend.entity.ResourceStatus;
import com.it3030.smartcampus.backend.exception.InvalidResourceException;
import com.it3030.smartcampus.backend.exception.ResourceInUseException;
import com.it3030.smartcampus.backend.exception.ResourceNotFoundException;
import com.it3030.smartcampus.backend.repository.ResourceBookingRepository;
import com.it3030.smartcampus.backend.repository.ResourceRepository;

@Service
public class ResourceService {
    private static final LocalTime DAY_START = LocalTime.of(8, 0);
    private static final LocalTime DAY_END = LocalTime.of(18, 0);
    private static final DateTimeFormatter SLOT_TIME_FORMAT = DateTimeFormatter.ofPattern("HH:mm");
    private static final List<DateTimeFormatter> BOOKING_TIME_FORMATS = List.of(
            DateTimeFormatter.ofPattern("H:mm"),
            DateTimeFormatter.ofPattern("HH:mm"),
            DateTimeFormatter.ofPattern("H:mm:ss"),
            DateTimeFormatter.ofPattern("HH:mm:ss"));
    private static final Set<String> IGNORED_BOOKING_STATUSES = Set.of("REJECTED", "CANCELLED", "CANCELED");

    private final ResourceRepository resourceRepository;
    private final ResourceBookingRepository bookingRepository;

    public ResourceService(ResourceRepository resourceRepository, ResourceBookingRepository bookingRepository) {
        this.resourceRepository = resourceRepository;
        this.bookingRepository = bookingRepository;
    }

    @Transactional(readOnly = true)
    public List<ResourceResponse> getAllResources(
            String type,
            String location,
            String status,
            Integer minCapacity,
            String keyword) {

        validateMinCapacity(minCapacity);
        ResourceStatus resourceStatus = parseStatusFilter(status);

        return resourceRepository.searchResources(
                        cleanOptional(type),
                        cleanOptional(location),
                        resourceStatus,
                        minCapacity,
                        cleanOptional(keyword))
                .stream()
                .map(ResourceResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public ResourceResponse getResourceById(Long id) {
        return ResourceResponse.fromEntity(findResource(id));
    }

    @Transactional
    public ResourceResponse createResource(ResourceRequest request) {
        Resource resource = new Resource();
        applyRequest(resource, request);
        return ResourceResponse.fromEntity(resourceRepository.save(resource));
    }

    @Transactional
    public ResourceResponse updateResource(Long id, ResourceRequest request) {
        Resource resource = findResource(id);
        applyRequest(resource, request);
        return ResourceResponse.fromEntity(resourceRepository.save(resource));
    }

    @Transactional
    public void deleteResource(Long id) {
        Resource resource = findResource(id);

        try {
            resourceRepository.delete(resource);
            resourceRepository.flush();
        } catch (DataIntegrityViolationException ex) {
            throw new ResourceInUseException(id);
        }
    }

    @Transactional(readOnly = true)
    public ResourceAvailabilityResponse getResourceAvailability(Long id, String date) {
        Resource resource = findResource(id);
        LocalDate requestedDate = parseDate(date);
        List<Booking> bookings = bookingRepository.findByResourceIdAndDate(id, requestedDate.toString());

        List<AvailabilitySlotResponse> slots = new ArrayList<>();
        for (LocalTime slotStart = DAY_START; slotStart.isBefore(DAY_END); slotStart = slotStart.plusHours(1)) {
            LocalTime slotEnd = slotStart.plusHours(1);
            Booking booking = findOverlappingBooking(bookings, slotStart, slotEnd);

            if (booking != null) {
                slots.add(new AvailabilitySlotResponse(
                        formatTime(slotStart),
                        formatTime(slotEnd),
                        "BOOKED",
                        booking.getId()));
            } else if (resource.getStatus() == ResourceStatus.OUT_OF_SERVICE) {
                slots.add(new AvailabilitySlotResponse(
                        formatTime(slotStart),
                        formatTime(slotEnd),
                        "OUT_OF_SERVICE",
                        null));
            } else {
                slots.add(new AvailabilitySlotResponse(
                        formatTime(slotStart),
                        formatTime(slotEnd),
                        "AVAILABLE",
                        null));
            }
        }

        return new ResourceAvailabilityResponse(
                resource.getId(),
                resource.getName(),
                requestedDate.toString(),
                slots);
    }

    private Resource findResource(Long id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(id));
    }

    private void applyRequest(Resource resource, ResourceRequest request) {
        ResourceStatus status = validateRequest(request);

        resource.setName(cleanRequired(request.getName()));
        resource.setType(cleanRequired(request.getType()));
        resource.setCapacity(request.getCapacity());
        resource.setLocation(cleanRequired(request.getLocation()));
        resource.setStatus(status);
    }

    private ResourceStatus validateRequest(ResourceRequest request) {
        Map<String, String> errors = new LinkedHashMap<>();

        if (request == null) {
            errors.put("request", "Request body is required.");
            throw new InvalidResourceException(errors);
        }

        if (isBlank(request.getName())) {
            errors.put("name", "Name is required.");
        }

        if (isBlank(request.getType())) {
            errors.put("type", "Type is required.");
        }

        if (request.getCapacity() == null) {
            errors.put("capacity", "Capacity is required.");
        } else if (request.getCapacity() <= 0) {
            errors.put("capacity", "Capacity must be greater than 0.");
        }

        if (isBlank(request.getLocation())) {
            errors.put("location", "Location is required.");
        }

        ResourceStatus status = parseStatus(request.getStatus(), errors);

        if (!errors.isEmpty()) {
            throw new InvalidResourceException(errors);
        }

        return status;
    }

    private ResourceStatus parseStatusFilter(String status) {
        if (isBlank(status)) {
            return null;
        }

        Map<String, String> errors = new LinkedHashMap<>();
        ResourceStatus resourceStatus = parseStatus(status, errors);
        if (!errors.isEmpty()) {
            throw new InvalidResourceException(errors);
        }
        return resourceStatus;
    }

    private ResourceStatus parseStatus(String value, Map<String, String> errors) {
        if (isBlank(value)) {
            errors.put("status", "Status is required and must be ACTIVE or OUT_OF_SERVICE.");
            return null;
        }

        try {
            String normalized = value.trim()
                    .toUpperCase(Locale.ROOT)
                    .replace('-', '_')
                    .replace(' ', '_');
            return ResourceStatus.valueOf(normalized);
        } catch (IllegalArgumentException ex) {
            errors.put("status", "Status must be ACTIVE or OUT_OF_SERVICE.");
            return null;
        }
    }

    private void validateMinCapacity(Integer minCapacity) {
        if (minCapacity != null && minCapacity <= 0) {
            throw new InvalidResourceException("minCapacity", "Minimum capacity must be greater than 0.");
        }
    }

    private LocalDate parseDate(String value) {
        if (isBlank(value)) {
            throw new InvalidResourceException("date", "Date is required in YYYY-MM-DD format.");
        }

        try {
            return LocalDate.parse(value.trim());
        } catch (DateTimeParseException ex) {
            throw new InvalidResourceException("date", "Date must use YYYY-MM-DD format.");
        }
    }

    private Booking findOverlappingBooking(List<Booking> bookings, LocalTime slotStart, LocalTime slotEnd) {
        for (Booking booking : bookings) {
            if (!isBookingBlocking(booking)) {
                continue;
            }

            LocalTime bookingStart = parseBookingTime(booking.getStartTime());
            LocalTime bookingEnd = parseBookingTime(booking.getEndTime());
            if (bookingStart == null || bookingEnd == null) {
                continue;
            }

            if (bookingStart.isBefore(slotEnd) && bookingEnd.isAfter(slotStart)) {
                return booking;
            }
        }

        return null;
    }

    private boolean isBookingBlocking(Booking booking) {
        if (isBlank(booking.getStatus())) {
            return true;
        }

        String normalizedStatus = booking.getStatus().trim().toUpperCase(Locale.ROOT);
        return !IGNORED_BOOKING_STATUSES.contains(normalizedStatus);
    }

    private LocalTime parseBookingTime(String value) {
        if (isBlank(value)) {
            return null;
        }

        String cleanedValue = value.trim();
        for (DateTimeFormatter formatter : BOOKING_TIME_FORMATS) {
            try {
                return LocalTime.parse(cleanedValue, formatter);
            } catch (DateTimeParseException ex) {
                // Try the next common database time format.
            }
        }

        return null;
    }

    private String formatTime(LocalTime time) {
        return time.format(SLOT_TIME_FORMAT);
    }

    private String cleanRequired(String value) {
        return value.trim();
    }

    private String cleanOptional(String value) {
        if (isBlank(value)) {
            return null;
        }
        return value.trim();
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
