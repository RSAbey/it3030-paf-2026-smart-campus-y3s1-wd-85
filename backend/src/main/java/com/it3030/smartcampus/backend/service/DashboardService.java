package com.it3030.smartcampus.backend.service;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.it3030.smartcampus.backend.dto.DashboardStats;
import com.it3030.smartcampus.backend.repository.BookingRepository;
import com.it3030.smartcampus.backend.repository.ResourceRepository;
import com.it3030.smartcampus.backend.repository.TicketRepository;
import com.it3030.smartcampus.backend.repository.UserRepository;


@Service
public class DashboardService {

    private final BookingRepository bookingRepo;
    private final TicketRepository ticketRepo;
    private final ResourceRepository resourceRepo;
    private final UserRepository userRepo;

    public DashboardService(
            BookingRepository bookingRepo,
            TicketRepository ticketRepo,
            ResourceRepository resourceRepo,
            UserRepository userRepo
    ) {
        this.bookingRepo = bookingRepo;
        this.ticketRepo = ticketRepo;
        this.resourceRepo = resourceRepo;
        this.userRepo = userRepo;
    }

    public DashboardStats getStats() {
        long totalBookings = 0; //Temporary, later filter by date
        long activeTickets = ticketRepo.count(); // later filter OPEN
        long totalResources = resourceRepo.count();
        long activeUsers = userRepo.count();

        return new DashboardStats(
                totalBookings,
                activeTickets,
                totalResources,
                activeUsers
        );
    }

    public List<Map<String, Object>> getWeeklyBookings() {
        return bookingRepo.getWeeklyBookings(); // custom query
    }

    public List<Map<String, Object>> getResourceDistribution() {
        return resourceRepo.getResourceDistribution();
    }

}
