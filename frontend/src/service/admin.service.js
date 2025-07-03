import { http } from "./config";

export const adminService = {
  getUsers: (isRemoved = false, page, size) => {
    return http.get("v1/admin/users", {
      params: {
        isRemoved,
        page,
        size,
      },
    });
  },

  getUserId: (id) => {
    return http.get(`v1/admin/users/${id}`);
  },

  deleteUser: (data) => {
    return http.delete(`v1/admin/users/${data}`);
  },
  restoreUser: (data) => {
    return http.put(`v1/admin/users/${data}/restore-user`, null);
  },

  updatePasswordUser: (id, password) => {
    return http.put(`v1/admin/users/${id}/password`, { password });
  },

  updateUserById: (id, data) => {
    return http.put(`v1/admin/users/${id}`, data);
  },

  createUser: (data) => {
    return http.post("v1/admin/users", data);
  },

  adminStatisticsStatus: () => {
    return http.get("v1/dashboard/admin/users-by-status");
  },

  adminStatisticsRole: () => {
    return http.get("v1/dashboard/admin/users-by-role");
  },
};
