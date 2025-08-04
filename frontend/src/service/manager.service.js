import { http } from "./config";

export const managerService = {
  getWorkScheduleMonth: (id) => {
    return http.get(`work-schedule/this-month/${id}`);
  },

  getWorkScheduleYear: (yearMonth, doctorId) => {
    return http.get(`v1/work-schedules/${yearMonth}/${doctorId}`);
  },

  getTreatmentTypePagination: (page, size) => {
    return http.get(`v1/treatment-types`, {
      params: {
        page,
        size,
      },
    });
  },

  getAllTreatmentType: () => {
    return http.get(`v1/treatment-types`);
  },

  getTreatmentService: (page, size) => {
    return http.get("v1/treatment-services", {
      params: {
        page,
        size,
      },
    });
  },

  getTreatmentStages: (serviceId) => {
    return http.get(`v1/treatment-stages/${serviceId}/find-by-service`);
  },

  updateTreatmentStage(id, data) {
    return http.put(`v1/treatment-stages/${id}`, data);
  },

  getTreatmentServiceDetail: (id) => {
    return http.get(`v1/treatment-services/${id}`);
  },

  getAllFeedback: (page, size) => {
    return http.get("v1/feedbacks", {
      params: {
        page,
        size,
      },
    });
  },

  getFeedbackDetail: (id) => {
    return http.get(`v1/feedbacks/${id}`);
  },

  createWorkScheduleBulk: (payload) => {
    return http.post("v1/work-schedules/bulk-create", payload);
  },

  createWorkScheduleByDay: (data) => {
    return http.post("v1/work-schedules", data);
  },

  // createTreatType: (data) => {
  //   return http.post("v1/treatment-types", data);
  // },

  createTreatService: (data) => {
    return http.post("v1/treatment-services", data);
  },

  deleteWorkSchedule: (date, doctorId) => {
    return http.delete(`v1/work-schedules/${date}/${doctorId}`);
  },

  updateWorkSchedule: (doctorId, data) => {
    return http.put(`v1/work-schedules/${doctorId}`, data);
  },

  updateTreatmentService: (id, data) => {
    return http.put(`v1/treatment-services/${id}`, data);
  },

  updateTreatmentType: (id, data) => {
    return http.put(`v1/treatment-types/${id}`, data);
  },

  deleteTreatmentService: (id) => {
    return http.delete(`v1/treatment-services/${id}`);
  },

  restoreTreatmentService: (id) => {
    return http.put(`v1/treatment-services/${id}/restore`, null);
  },

  getManagerStatistic: () => {
    return http.get("v1/dashboard/manager/revenue/overview");
  },

  getManagerChart: () => {
    return http.get("v1/dashboard/manager/revenue/chart");
  },

  getManagerDashboardService: () => {
    return http.get("v1/dashboard/manager/revenue/service");
  },

  confirmFeedback: (id, data) => {
    return http.put(`v1/feedbacks/${id}/status`, data);
  },

  updateManager: (id, data) => {
    return http.put(`v1/managers/${id}`, data);
  },

  uploadImgService: (id, formData) => {
    return http.post(`/v1/treatment-services/${id}/upload-image`, formData);
  },
};
