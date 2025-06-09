package com.emmkay.infertility_system_api.dto.projection;



public interface ManagerDashboardWorkScheduleStatisticsProjection {
     Integer getTotalDoctorsToday();
     Integer getTotalPatientsToday();
     Integer getCompletedPatientsToday();
}
