package com.emmkay.infertility_system_api.dto.projection;



public interface ManagerDashboardWorkScheduleStatisticsProjection {
     int getTotalDoctorsToday();
     Integer getTotalPatientsToday();
     Integer getCompletedPatientsToday();
}
