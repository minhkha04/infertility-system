import { http } from "./config";

export const customerService = {
  createFeedback: (data) => {
    return http.post("/v1/feedbacks", data);
  },

  getAllFeedback: (customerId, page, size) => {
    return http.get("v1/feedbacks", {
      params: {
        customerId,
        page,
        size,
      },
    });
  },

  getFeedbackById: (id) => {
    return http.get(`v1/feedbacks/${id}`);
  },

  getFeedbackInfoToCreate: (treatmentRecordId) => {
    return http.get(`v1/feedbacks/${treatmentRecordId}/get-info-to-feedback`);
  },

  checkIsValid: (recordId) => {
    return http.get(`/feedback/isValidToFeedback/${recordId}`);
  },

  updateFeedback: (id, data) => {
    return http.put(`v1/feedbacks/${id}`, data);
  },

  uploadImg: (payload) => {
    return http.put(`/blogs/update/img`, payload, {
      "Content-Type": "multipart/form-data",
    });
  },

  getPaymentInfo: (page, size) => {
    return http.get(`v1/payments/info`, {
      params: {
        page,
        size,
      },
    });
  },

  paymentForCustomer: (recordId) => {
    return http.post(`v1/payments/momo/create/${recordId}`);
  },

  paymentNotificationForCustomer: (recordId) => {
    return http.get(`v1/payments/result/${recordId}`);
  },

  paymentVnpayForCustomer: (recordId) => {
    return http.post(`v1/payments/vnpay/create/${recordId}`);
  },

  paymentReloadForCustomer: (recordId) => {
    return http.post(`v1/payments/momo/reload/${recordId}`);
  },

  paymentCancelForCustomer: (recordId) => {
    return http.delete(`v1/payments/cancelled/${recordId}`);
  },
};
