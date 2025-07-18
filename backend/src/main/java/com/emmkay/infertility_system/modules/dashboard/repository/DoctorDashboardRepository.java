package com.emmkay.infertility_system.modules.dashboard.repository;

import com.emmkay.infertility_system.modules.dashboard.view.DoctorDashboardOverview;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DoctorDashboardRepository extends JpaRepository<DoctorDashboardOverview, String> {

}
