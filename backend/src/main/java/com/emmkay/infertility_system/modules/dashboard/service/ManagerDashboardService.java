package com.emmkay.infertility_system.modules.dashboard.service;

import com.emmkay.infertility_system.modules.dashboard.projection.ManageRevenueServiceProjection;
import com.emmkay.infertility_system.modules.dashboard.projection.ManagerRevenueChartProjection;
import com.emmkay.infertility_system.modules.dashboard.projection.ManagerWorkScheduleDoctorTodayProjection;
import com.emmkay.infertility_system.modules.dashboard.repository.ManagerRevenueRepository;
import com.emmkay.infertility_system.modules.dashboard.repository.ManagerWorkStatisticsTodayRepository;
import com.emmkay.infertility_system.modules.dashboard.view.ManagerWorkStatisticsTodayView;
import com.emmkay.infertility_system.modules.dashboard.view.ManagerRevenueOverview;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ManagerDashboardService {

    ManagerWorkStatisticsTodayRepository managerWorkStatisticsTodayRepository;
    ManagerRevenueRepository managerRevenueRepository;

    public ManagerWorkStatisticsTodayView getWorkStatisticsToday() {
        return managerWorkStatisticsTodayRepository.findAll().getFirst();
    }

    public List<ManagerWorkScheduleDoctorTodayProjection> getWorkSchedulesForManagerDashboard() {
        return managerWorkStatisticsTodayRepository.getDoctorScheduleToday();
    }

    public ManagerRevenueOverview getRevenueOverview() {
        return managerRevenueRepository.findAll().getFirst();
    }

    public List<ManageRevenueServiceProjection> getManagerDashboardService() {
        return managerRevenueRepository.getManagerRevenueService();

    }

    public List<ManagerRevenueChartProjection> getManagerRevenueChart() {
        LocalDate now = LocalDate.now();
        LocalDateTime fromDate = now.minusMonths(5).withDayOfMonth(1).atStartOfDay();
        LocalDateTime toDate = now.plusMonths(1).withDayOfMonth(1).atStartOfDay();
        return managerRevenueRepository.getManagerDashboardChartProject(fromDate, toDate);
    }
}
