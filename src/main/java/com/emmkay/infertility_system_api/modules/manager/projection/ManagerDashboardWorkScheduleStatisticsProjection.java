package com.emmkay.infertility_system_api.modules.manager.projection;



public interface ManagerDashboardWorkScheduleStatisticsProjection {
     Integer getTotalDoctorsToday();
     Integer getTotalPatientsToday();
     Integer getCompletedPatientsToday();
}
