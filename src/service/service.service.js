import { http } from "./config";
import { getLocgetlStorage } from "../utils/util";

export const serviceService = {
  // Lấy danh sách tất cả dịch vụ
  getAllServices: async () => {
    try {
      const response = await http.get("treatment-service");
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  // Lấy danh sách dịch vụ chưa bị xóa
  getAllNonRemovedServices: async () => {
    try {
      const response = await http.get("treatment-service/not-removed");
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  // Lấy chi tiết dịch vụ theo ID
  getServiceById: async (serviceId) => {
    try {
      const response = await http.get(`treatment-service/${serviceId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  // Lấy danh sách loại điều trị
  getAllTreatmentTypes: async () => {
    try {
      const response = await http.get("treatment-type");
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  // Tìm loại điều trị theo tên
  getTreatmentTypeByName: async (name) => {
    try {
      const response = await http.get(`treatment-type/find-by-name/${name}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  // Lấy danh sách các giai đoạn điều trị
  getAllTreatmentStages: async () => {
    try {
      const response = await http.get("treatment-stages");
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  // Lấy giai đoạn điều trị theo loại
  getTreatmentStagesByTypeId: async (typeId) => {
    try {
      const response = await http.get(`treatment-stages/find-by-type/${typeId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Tạo dịch vụ mới (yêu cầu xác thực)
  createTreatmentService: async (data) => {
    try {
      const token = getLocgetlStorage("token");
      const response = await http.post("treatment-service", data, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Cập nhật dịch vụ (yêu cầu xác thực)
  updateTreatmentService: async (serviceId, data) => {
    try {
      const token = getLocgetlStorage("token");
      const response = await http.put(`treatment-service/${serviceId}`, data, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Xóa dịch vụ (yêu cầu xác thực)
  deleteTreatmentService: async (serviceId) => {
    try {
      const token = getLocgetlStorage("token");
      const response = await http.delete(`treatment-service/${serviceId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Lấy danh sách dịch vụ public (API mới)
  getPublicServices: async ({ page = 0, size = 10, name = '' } = {}) => {
    try {
      const url = "v1/public/services";
      const params = { page, size, name };
      const response = await http.get(url, { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Lấy chi tiết dịch vụ public theo id (API mới)
  getPublicServiceById: async (id) => {
    try {
      const url = `v1/public/services/${id}`;
      const response = await http.get(url);
      return response;
    } catch (error) {
      throw error;
    }
  }
}; 