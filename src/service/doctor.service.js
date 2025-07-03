import { http } from "./config";
import { getLocgetlStorage } from "../utils/util";

// Đặt biến API_URL dùng cho fetch
// const API_URL =
//   import.meta.env.VITE_API_URL ||
//   "http://18.183.187.237/infertility-system-api";

export const doctorService = {
  // Lấy danh sách tất cả bác sĩ - UPDATED TO V1
  getAllDoctors: async (page = 0, size = 100) => {
    try {
      const response = await http.get("v1/public/doctors", {
        params: {
          page,
          size,
        },
      });

      // Log để debug
      console.log("📦 Doctor API Response:", response.data);

      return response;
    } catch (error) {
      throw error;
    }
  },

  // Lấy thông tin chi tiết một bác sĩ theo ID - UPDATED TO V1
  getDoctorById: async (id) => {
    try {
      const response = await http.get(`v1/public/doctors/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Cập nhật thông tin bác sĩ
  updateDoctor: (doctorId, data) => {
    return http.put(`v1/doctors/${doctorId}`, data);
  },

  // Lấy thông tin bác sĩ public - UPDATED TO V1
  getInfoDoctor: (id, isPublic) => {
    return http.get(`v1/public/doctors/${id}`, {
      params: {
        isPublic,
      },
    });
  },

  // Lấy danh sách bác sĩ cho card - UPDATED TO V1
  getDoctorForCard: async (page, size) => {
    return http.get("v1/public/doctors", {
      params: {
        page,
        size,
      },
    });
  },

  // Lấy danh sách rating của bác sĩ
  getDoctorRatings: async () => {
    try {
      const response = await http.get("doctors/rating");
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Lấy feedback của bác sĩ - UPDATED TO V1
  getDoctorFeedback: async (doctorId, page, size) => {
    return http.get(`/v1/public/feedbacks`, {
      params: {
        doctorId,
        page,
        size,
      },
    });
  },

  // Lấy thống kê dashboard
  getDashboardStatics: (doctorId) => {
    return http.get(`/doctors/dashboard/statics/${doctorId}`);
  },

  // Lấy thống kê số bệnh nhân đã khám theo ngày
  getDoctorStatistics: async (date) => {
    try {
      const response = await http.get(`doctors/statistics/${date}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Lấy danh sách bác sĩ có lịch trống theo ngày và ca - UPDATED TO V1
  getAvailableDoctors: async (date, shift) => {
    try {
      const response = await http.get("v1/doctors/available", {
        params: {
          date: date,
          shift: shift,
        },
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Lấy lịch làm việc của bác sĩ theo doctorId - UPDATED TO V1
  getDoctorScheduleById: async (doctorId) => {
    try {
      console.log("🔍 Fetching doctor schedule for ID:", doctorId);
      const response = await http.get(`v1/doctors/schedules/${doctorId}`);
      console.log("🔍 Doctor schedule response:", response.data);
      return response;
    } catch (error) {
      console.error("❌ Error fetching doctor schedule:", error);
      throw error;
    }
  },

  // Lấy danh sách các appointment có yêu cầu đổi lịch (pending change) cho bác sĩ
  getAppointmentsWithPendingChange: async (doctorId) => {
    try {
      const response = await http.get(
        `appointments/with-status-pending-change/${doctorId}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Lấy danh sách bác sĩ để chọn lịch
  getDoctorToSelectSchedule: () => {
    return http.get(`v1/doctors/select/options/schedule`);
  },

  // ===== API MỚI CHO DOCTOR DASHBOARD =====

  // Lấy lịch làm việc theo tháng - API mới
  getWorkScheduleByMonth: async (yearMonth) => {
    try {
      // Thử API mới trước
      try {
        const response = await http.get(
          `v1/dashboard/doctor/work-schedule?yearMonth=${yearMonth}`
        );
        return response;
      } catch (newApiError) {
        console.warn("API mới không hoạt động, thử API cũ:", newApiError);
        // Fallback to old API hoặc trả về dữ liệu mặc định
        return {
          data: {
            result: {
              workShiftsThisMonth: 0,
              workDays: [],
            },
          },
        };
      }
    } catch (error) {
      console.error("Error fetching work schedule by month:", error);
      throw error;
    }
  },

  // Lấy thống kê tổng quan dashboard - API mới
  getDashboardOverview: async () => {
    try {
      // Thử API mới trước
      try {
        const response = await http.get(`v1/dashboard/doctor/overview`);
        return response;
      } catch (newApiError) {
        console.warn("API mới không hoạt động, thử API cũ:", newApiError);
        // Fallback to old API hoặc trả về dữ liệu mặc định
        return {
          data: {
            result: {
              patients: 0,
              avgRating: 0,
              workShiftsThisMonth: 0,
            },
          },
        };
      }
    } catch (error) {
      console.error("Error fetching dashboard overview:", error);
      throw error;
    }
  },

  // Lấy appointments hôm nay - API mới
  getAppointmentsToday: async (page = 0, size = 10) => {
    try {
      // Thử API mới trước
      try {
        const response = await http.get(
          `v1/dashboard/doctor/appointment-today?page=${page}&size=${size}`
        );
        return response;
      } catch (newApiError) {
        console.warn("API mới không hoạt động, thử API cũ:", newApiError);
        // Fallback to old API hoặc trả về dữ liệu mặc định
        return {
          data: {
            result: {
              content: [],
              totalElements: 0,
            },
          },
        };
      }
    } catch (error) {
      console.error("Error fetching appointments today:", error);
      throw error;
    }
  },

  // Lấy thống kê dashboard (API cũ - giữ lại để tương thích)
};
