package com.emmkay.infertility_system_api.modules.dashboard.repository;

import com.emmkay.infertility_system_api.modules.dashboard.view.DoctorDashboardOverview;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DoctorDashboardRepository extends JpaRepository<DoctorDashboardOverview, String> {

}
