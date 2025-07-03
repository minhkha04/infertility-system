import { http } from "./config";

export const blogService = {
  // Lấy danh sách blogs với phân trang và filter
  getAllBlogs: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.status) queryParams.append('status', params.status);
      if (params.keyword) queryParams.append('keyword', params.keyword);
      if (params.page !== undefined) queryParams.append('page', params.page);
      if (params.size !== undefined) queryParams.append('size', params.size);

      const url = `v1/blogs?${queryParams.toString()}`;
      const response = await http.get(url);
      return response;
    } catch (error) {
      console.error("Error fetching blogs:", error);
      throw error;
    }
  },

  // Lấy chi tiết blog theo ID
  getBlogById: async (id) => {
    try {
      const response = await http.get(`v1/blogs/${id}`);
      return response;
    } catch (error) {
      console.error("Error fetching blog by id:", error);
      throw error;
    }
  },

  // Lấy blog theo status (trang public)
  getBlogsByStatus: (status) => {
    return http.get(`v1/blogs/status/${status}`);
  },

  // Lấy blog theo author
  getBlogsByAuthor: async (authorId) => {
    try {
      const response = await http.get(`v1/blogs/author/${authorId}`);
      return response;
    } catch (error) {
      console.error("Error in getBlogsByAuthor:", error);
      throw error;
    }
  },

  // Tạo blog mới
  createBlog: async (data) => {
    try {
      const response = await http.post("v1/blogs", data, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      return response;
    } catch (error) {
      console.error("Error creating blog:", error);
      throw error;
    }
  },

  // Cập nhật blog
  updateBlog: async (id, data) => {
    try {
      const response = await http.put(`v1/blogs/${id}`, data, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      return response;
    } catch (error) {
      console.error("Error updating blog:", error);
      throw error;
    }
  },

  // Upload ảnh cho blog
  uploadBlogImage: async (id, file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await http.put(`v1/blogs/${id}/image`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Accept: "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
        withCredentials: false, // Tắt credentials để tránh CORS
      });
      return response;
    } catch (error) {
      console.error("Error uploading blog image:", error);
      throw error;
    }
  },

  // Cập nhật trạng thái blog
  updateBlogStatus: async (id, data) => {
    try {
      const response = await http.put(`v1/blogs/${id}/updateStatus`, data, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      return response;
    } catch (error) {
      console.error("Error updating blog status:", error);
      throw error;
    }
  },

  // Submit blog để review
  submitBlog: async (id, data) => {
    try {
      const response = await http.post(`v1/blogs/${id}/submit`, data, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      return response;
    } catch (error) {
      console.error("Error submitting blog:", error);
      throw error;
    }
  },

  // Duyệt blog (approve/reject)
  approveBlog: async (id, userId, token, data) => {
    try {
      const response = await http.post(`v1/blogs/${id}/approve`, data, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      return response;
    } catch (error) {
      console.error("Error approving blog:", error);
      throw error;
    }
  },

  // Ẩn blog
  hideBlog: async (id) => {
    try {
      const response = await http.put(`v1/blogs/${id}/hidden`);
      return response;
    } catch (error) {
      console.error("Error hiding blog:", error);
      throw error;
    }
  },

  // Xóa blog
  deleteBlog: async (id) => {
    try {
      const response = await http.delete(`v1/blogs/${id}`);
      return response;
    } catch (error) {
      console.error("Error deleting blog:", error);
      throw error;
    }
  },

  getBlogPublic: (keyWord, page, size) => {
    return http.get(`v1/public/blogs`, {
      params: {
        keyWord,
        page,
        size,
      },
    });
  },
};
