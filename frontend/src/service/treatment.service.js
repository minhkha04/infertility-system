import { http } from "./config";

export const treatmentService = {
  getTreatmentRecordsByDoctor: async (doctorId, size = 1000) => {
    return await http.get(
      `v1/treatment-records?doctorId=${doctorId}&size=${size}`
    );
  },

  getTreatmentRecordById: async (id) => {
    return await http.get(`v1/treatment-records/${id}`);
  },

  calculateTreatmentProgress: (treatmentRecords) => {
    try {
      if (!treatmentRecords || !Array.isArray(treatmentRecords)) {
        return {
          totalPatients: 0,
          completedPatients: 0,
          inProgressPatients: 0,
          pendingPatients: 0,
          cancelledPatients: 0,
          completionRate: 0,
        };
      }

      const stats = treatmentRecords.reduce(
        (acc, record) => {
          acc.totalPatients++;

          switch (record.status) {
            case "Completed":
              acc.completedPatients++;
              break;
            case "InProgress":
              acc.inProgressPatients++;
              break;
            case "Pending":
              acc.pendingPatients++;
              break;
            case "Cancelled":
              acc.cancelledPatients++;
              break;
            default:
              break;
          }

          return acc;
        },
        {
          totalPatients: 0,
          completedPatients: 0,
          inProgressPatients: 0,
          pendingPatients: 0,
          cancelledPatients: 0,
        }
      );

      stats.completionRate =
        stats.totalPatients > 0
          ? Math.round((stats.completedPatients / stats.totalPatients) * 100)
          : 0;

      return stats;
    } catch (error) {
      console.error("Error calculating treatment progress:", error);
      return {
        totalPatients: 0,
        completedPatients: 0,
        inProgressPatients: 0,
        pendingPatients: 0,
        cancelledPatients: 0,
        completionRate: 0,
      };
    }
  },

  getDoctorPatientStats: (treatmentRecords, doctorName) => {
    try {
      if (!treatmentRecords || !Array.isArray(treatmentRecords)) {
        return {
          totalPatients: 0,
          completedPatients: 0,
          inProgressPatients: 0,
          pendingPatients: 0,
          cancelledPatients: 0,
          completionRate: 0,
        };
      }

      const doctorRecords = treatmentRecords.filter(
        (record) => record.doctorName === doctorName
      );

      const stats = doctorRecords.reduce(
        (acc, record) => {
          acc.totalPatients++;

          switch (record.status) {
            case "Completed":
              acc.completedPatients++;
              break;
            case "InProgress":
              acc.inProgressPatients++;
              break;
            case "Pending":
              acc.pendingPatients++;
              break;
            case "Cancelled":
              acc.cancelledPatients++;
              break;
            default:
              break;
          }

          return acc;
        },
        {
          totalPatients: 0,
          completedPatients: 0,
          inProgressPatients: 0,
          pendingPatients: 0,
          cancelledPatients: 0,
        }
      );

      stats.completionRate =
        stats.totalPatients > 0
          ? Math.round((stats.completedPatients / stats.totalPatients) * 100)
          : 0;

      return stats;
    } catch (error) {
      console.error("Error calculating doctor patient stats:", error);
      return {
        totalPatients: 0,
        completedPatients: 0,
        inProgressPatients: 0,
        pendingPatients: 0,
        cancelledPatients: 0,
        completionRate: 0,
      };
    }
  },

  getAppointmentBycustomer: (customerId, status, page, size) => {
    return http.get(`v1/appointments`, {
      params: {
        customerId,
        status,
        page,
        size,
      },
    });
  },

  getAppointmentBycustomerDetail: (appointmentId) => {
    return http.get(`v1/appointments/${appointmentId}`);
  },

  getDoctorAppointmentsByDate: async (doctorId, date) => {
    return await http.get(`v1/appointments?doctorId=${doctorId}&date=${date}`);
  },

  updateAppointmentStatus: async (appointmentId, status, note) => {
    // Sử dụng format giống như confirmAppointmentChange
    const response = await http.put(
      `v1/appointments/${appointmentId}/status`,
      {
        status: status,
        note: note,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );
    return response;
  },

  updateAppointmentStatusCustomer: (appointmentId, data) => {
    return http.put(`v1/appointments/${appointmentId}/status`, data);
  },

  updateTreatmentStep: async (id, data) => {
    try {
      // Luôn truyền đủ stageId, startDate, endDate, status, notes
      const params = {
        stageId: data.stageId,
        startDate: data.startDate,
        endDate: data.endDate,
        status: data.status,
        notes: data.notes,
      };
      const response = await http.put(`v1/treatment-steps/${id}`, null, {
        params,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      return response;
    } catch (error) {
      console.error("Error updating treatment step:", error);
      throw error;
    }
  },

  // API cập nhật trạng thái treatment step theo format mới
  updateTreatmentStepStatus: async (stepId, statusData) => {
    try {
      console.log("🔍 Updating treatment step status:", { stepId, statusData });

      const response = await http.put(
        `v1/treatment-steps/${stepId}`,
        statusData,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      return response;
    } catch (error) {}
  },

  createAppointment: (data) => {
    // Thử API mới trước
    return http.post("v1/appointments", data, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
  },

  getAppointmentsByStepId: async (stepId) => {
    return await http.get(`v1/appointments/get-by-step/${stepId}`);
  },

  updateTreatmentStatus: async (recordId, status, result) => {
    try {
      let url = `v1/treatment-records/${recordId}/status?status=${status}`;
      if (result) url += `&result=${result}`;
      const response = await http.put(url, null, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      return response;
    } catch (error) {
      console.warn(
        "❌ API updateTreatmentStatus error:",
        error?.response?.data
      );
      throw error;
    }
  },

  // Gửi yêu cầu đổi lịch hẹn (customer)
  requestChangeAppointment: async (appointmentId, data) => {
    console.log("first");
    const response = await http.put(
      `v1/appointments/${appointmentId}/customer-change`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );
    return response;
  },

  getDoctorChangeRequests: async (doctorId) => {
    const response = await http.get(
      `v1/appointments?doctorId=${doctorId}&status=PENDING_CHANGE`
    );
    return response;
  },

  // Xác nhận thay đổi lịch hẹn - API mới
  confirmAppointmentChange: async (appointmentId, data) => {
    const response = await http.put(
      `v1/appointments/${appointmentId}/status`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );
    console.log("✅ New API success:", response);
    return response;
  },

  // Lấy tất cả treatment records của một bác sĩ
  getAllTreatmentRecordsByDoctor: async (doctorId) => {
    const response = await http.get(
      `v1/treatment-records?doctorId=${doctorId}&size=1000`
    );
    return response;
  },

  // Lấy tất cả appointments của một bác sĩ
  getAllAppointmentsByDoctor: async (doctorId) => {
    const response = await http.get(
      `v1/appointments?doctorId=${doctorId}&size=1000`
    );
    return response;
  },

  // ===== API MỚI CHO CUSTOMER COMPONENTS =====

  // Đăng ký dịch vụ điều trị - API mới
  registerTreatmentService: async (data) => {
    try {
      const response = await http.post("v1/treatment-records/register", data);
      return response;
    } catch (error) {
      console.error("Error registering treatment service:", error);
      throw error;
    }
  },
  // hàm get của lâm
  getTreatmentRecords: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.customerId)
        queryParams.append("customerId", params.customerId);
      if (params.doctorId) queryParams.append("doctorId", params.doctorId);
      if (params.status) queryParams.append("status", params.status);
      if (params.page !== undefined) queryParams.append("page", params.page);
      if (params.size !== undefined) queryParams.append("size", params.size);
      // Thử API mới trước
      const url = `v1/treatment-records?${queryParams.toString()}`;
      try {
        const response = await http.get(url);
        return response;
      } catch (newApiError) {}
    } catch (error) {
      console.error("❌ Error fetching treatment records:", error);
      throw error;
    }
  },

  // Lấy danh sách treatment records - API mới
  getTreatmentRecordsPagination: async ({
    customerId,
    doctorId,
    page = 0,
    size = 10,
  }) => {
    const queryParams = new URLSearchParams();
    if (customerId) queryParams.append("customerId", customerId);
    if (doctorId) queryParams.append("doctorId", doctorId);
    queryParams.append("page", page);
    queryParams.append("size", size);

    const url = `v1/treatment-records/dashboard?${queryParams.toString()}`;
    return await http.get(url);
  },

  getTreatmentRecordsExpand: async ({
    customerId,
    doctorId,
    page = 0,
    size = 10,
  }) => {
    const params = new URLSearchParams();
    if (customerId) params.append("customerId", customerId);
    if (doctorId) params.append("doctorId", doctorId);
    params.append("page", page);
    params.append("size", size);

    const url = `v1/treatment-records?${params.toString()}`;
    return await http.get(url);
  },

  // Cập nhật ngày CD1 - API mới
  updateCd1Date: async (recordId, cd1Date) => {
    try {
      const response = await http.put(
        `v1/treatment-records/${recordId}/cd1?cd1=${cd1Date}`
      );
      return response;
    } catch (error) {}
  },

  // Hủy treatment record - API mới
  cancelTreatmentRecord: async (recordId, notes) => {
    try {
      const response = await http.delete(
        `v1/treatment-records/${recordId}/cancel`,
        {
          params: { notes },
        }
      );
      return response;
    } catch (error) {
      // Throw lại lỗi để phía trên bắt được và show message BE
      throw error;
    }
  },

  // Lấy chi tiết appointment theo ID - API mới
  getAppointmentById: async (appointmentId) => {
    try {
      const response = await http.get(`v1/appointments/${appointmentId}`);
      return response;
    } catch (error) {
      console.error("Error fetching appointment by id:", error);
      throw error;
    }
  },

  // Lấy appointments với các tham số lọc - API mới
  getAppointments: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.stepId) queryParams.append("stepId", params.stepId);
      if (params.customerId)
        queryParams.append("customerId", params.customerId);
      if (params.doctorId) queryParams.append("doctorId", params.doctorId);
      if (params.date) queryParams.append("date", params.date);
      if (params.status) queryParams.append("status", params.status);
      if (params.page !== undefined) queryParams.append("page", params.page);
      if (params.size !== undefined) queryParams.append("size", params.size);
      const url = `v1/appointments?${queryParams.toString()}`;
      const response = await http.get(url);
      return response;
    } catch (error) {
      console.error("Error fetching appointments:", error);
      throw error;
    }
  },

  // ===== API MỚI CHO DOCTOR =====

  // Tạo lịch hẹn cho treatment step - API mới
  createAppointmentForStep: async (data) => {
    try {
      const response = await http.post("v1/appointments", data, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      return response;
    } catch (error) {
      console.error("Error creating appointment for step:", error);
      throw error;
    }
  },

  // Lấy danh sách treatment services - API mới
  getTreatmentServices: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page !== undefined) queryParams.append("page", params.page);
      if (params.size !== undefined) queryParams.append("size", params.size);
      if (params.name) queryParams.append("name", params.name);
      if (params.typeId) queryParams.append("typeId", params.typeId);
      const url = `v1/treatment-services?${queryParams.toString()}`;
      const response = await http.get(url);
      return response;
    } catch (error) {
      console.error("Error fetching treatment services:", error);
      throw error;
    }
  },

  // Lấy danh sách treatment types - API mới
  getTreatmentTypes: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page !== undefined) queryParams.append("page", params.page);
      if (params.size !== undefined) queryParams.append("size", params.size);
      if (params.name) queryParams.append("name", params.name);
      const url = `v1/treatment-types?${queryParams.toString()}`;
      const response = await http.get(url);
      return response;
    } catch (error) {
      console.error("Error fetching treatment types:", error);
      throw error;
    }
  },

  // Lấy treatment stages theo type ID - API mới
  getTreatmentStagesByType: async (typeId) => {
    try {
      const response = await http.get(
        `v1/treatment-stages/${typeId}/find-by-type`
      );
      return response;
    } catch (error) {
      console.error("Error fetching treatment stages by type:", error);
      throw error;
    }
  },

  // Lấy chi tiết treatment service - API mới
  getTreatmentServiceById: async (serviceId) => {
    try {
      const response = await http.get(`v1/treatment-services/${serviceId}`);
      return response;
    } catch (error) {
      console.error("Error fetching treatment service by id:", error);
      throw error;
    }
  },

  // Lấy chi tiết treatment type - API mới
  getTreatmentTypeById: async (typeId) => {
    try {
      const response = await http.get(`v1/treatment-types/${typeId}`);
      return response;
    } catch (error) {
      console.error("Error fetching treatment type by id:", error);
      throw error;
    }
  },

  // Lấy danh sách doctors - API mới
  getDoctors: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();

      if (params.page !== undefined) queryParams.append("page", params.page);
      if (params.size !== undefined) queryParams.append("size", params.size);
      if (params.name) queryParams.append("name", params.name);
      if (params.specialization)
        queryParams.append("specialization", params.specialization);

      const url = `v1/doctors?${queryParams.toString()}`;
      const response = await http.get(url);
      return response;
    } catch (error) {
      console.error("Error fetching doctors:", error);
      throw error;
    }
  },

  // Lấy chi tiết doctor - API mới
  getDoctorById: async (doctorId) => {
    try {
      const response = await http.get(`v1/doctors/${doctorId}`);
      return response;
    } catch (error) {
      console.error("Error fetching doctor by id:", error);
      throw error;
    }
  },

  // Lấy lịch làm việc của bác sĩ - API mới
  getDoctorWorkSchedule: async (doctorId, date) => {
    try {
      const response = await http.get(
        `v1/doctors/${doctorId}/work-schedule?date=${date}`      );
      return response;
    } catch (error) {
      console.error("Error fetching doctor work schedule:", error);
      throw error;
    }
  },

  // Lấy thống kê tổng quan lịch làm việc của bác sĩ hôm nay (manager dashboard)
  getManagerWorkScheduleStatistics: async () => {
    try {
      const response = await http.get(
        "v1/dashboard/manager/work-schedules/statistics"
      );
      return response;
    } catch (error) {
      console.error("Error fetching manager work schedule statistics:", error);
      throw error;
    }
  },

  // Lấy danh sách bác sĩ làm việc hôm nay (manager dashboard)
  getManagerDoctorsToday: async () => {
    try {
      const response = await http.get(
        "v1/dashboard/manager/work-schedules/doctor-today"
      );
      return response;
    } catch (error) {
      console.error("Error fetching manager doctors today:", error);
      throw error;
    }
  },
  getAppointmentsV1: async (params) => {
    // params: { doctorId, date, page, size, ... }
    try {
      const response = await http.get("v1/appointments", { params });
      return response;
    } catch (error) {
      console.error("Error fetching appointments v1:", error);
      throw error;
    }
  },

  // Lấy danh sách dịch vụ điều trị cho select (API mới)
  getAllServicesForSelect: async () => {
    try {
      const response = await http.get("v1/treatment-services/select");
      return response;
    } catch (error) {
      console.error("Error fetching all services for select:", error);
      throw error;
    }
  },

  // Đổi dịch vụ điều trị cho treatment record (API mới)
  updateTreatmentRecordService: async (recordId, serviceId) => {
    try {
      const response = await http.put(`v1/treatment-records/${recordId}`, {
        serviceId,
      });
      return response;
    } catch (error) {
      console.error("Error updating treatment record service:", error);
      throw error;
    }
  },

  // Lấy danh sách stage theo serviceId (API mới)
  getStagesByServiceId: async (serviceId) => {
    try {
      const response = await http.get(
        `v1/treatment-stages/${serviceId}/find-by-service`
      );
      return response;
    } catch (error) {
      console.error("Error fetching stages by serviceId:", error);
      throw error;
    }
  },

  // Tạo bước điều trị mới (API mới)
  createTreatmentStep: async (data) => {
    try {
      const response = await http.post("v1/treatment-steps", data);
      return response;
    } catch (error) {
      console.error("Error creating treatment step:", error);
      throw error;
    }
  },

  // Lấy danh sách stage cho select khi tạo bước điều trị
  getSelectableStagesByServiceId: async (serviceId) => {
    try {
      const response = await http.get(
        `v1/treatment-stages/${serviceId}/select`
      );
      return response;
    } catch (error) {
      console.error("Error fetching selectable stages by serviceId:", error);
      throw error;
    }
  },

  // Lấy chi tiết step theo id (lấy treatmentStageId)
  getTreatmentStepById: async (stepId) => {
    try {
      const response = await http.get(`v1/treatment-steps/${stepId}`);
      return response;
    } catch (error) {
      console.error("Error fetching treatment step details:", error);
      throw error;
    }
  },

  // ===== LAB TEST APIs =====
  
  // Lấy danh sách lab tests của một treatment step
  getLabTestsByStepId: async (stepId) => {
    try {
      const response = await http.get(`v1/treatment-test-labs/${stepId}`);
      return response;
    } catch (error) {
      console.error("Error fetching lab tests by stepId:", error);
      throw error;
    }
  },

  // Tạo lab test mới
  createLabTest: async (data) => {
    try {
      const response = await http.post("v1/treatment-test-labs", data, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      return response;
    } catch (error) {
      console.error("Error creating lab test:", error);
      throw error;
    }
  },

  // Cập nhật lab test
  updateLabTest: async (labTestId, data) => {
    try {
      const response = await http.put(`v1/treatment-test-labs/${labTestId}`, data, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      return response;
    } catch (error) {
      console.error("Error updating lab test:", error);
      throw error;
    }
  },

  // Xóa lab test
  deleteLabTest: async (labTestId) => {
    try {
      const response = await http.delete(`v1/treatment-test-labs/${labTestId}`);
      return response;
    } catch (error) {
      console.error("Error deleting lab test:", error);
      throw error;
    }
  },

  // Lấy danh sách loại xét nghiệm có sẵn (để bác sĩ chọn)
  getLabTestTypes: async () => {
    try {
      const response = await http.get("v1/treatment-test-labs/lab-tests");
      return response;
    } catch (error) {
      console.error("Error fetching lab test types:", error);
      throw error;
    }
  },
};

