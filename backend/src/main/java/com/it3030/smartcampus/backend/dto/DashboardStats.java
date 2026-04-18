package com.it3030.smartcampus.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor; 

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DashboardStats {
    private long totalBookings;
    private long activeTickets;
    private long totalResources;
    private long activeUsers;

}
