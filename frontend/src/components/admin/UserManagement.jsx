import React, { useContext, useEffect, useMemo, useState } from "react";
import { Button, Space, Typography, Popconfirm } from "antd";
import { UserOutlined, DeleteOutlined, CloseOutlined } from "@ant-design/icons";
import { adminService } from "../../service/admin.service";
import { useSelector } from "react-redux";
import Modal from "react-modal";
import { NotificationContext } from "../../App";
import InputCustom from "../Input/InputCustom";
import EditUserFormAdmin from "./EditUserFormAdmin";

const { Title } = Typography;

const UserManagement = () => {
  // ===== REDUX & CONTEXT =====
  const token = useSelector((state) => state.authSlice);                 // Token từ Redux store
  const { showNotification } = useContext(NotificationContext);          // Context hiển thị thông báo

  // ===== STATE MANAGEMENT =====
  // State quản lý dữ liệu user và filter
  const [users, setUsers] = useState([]);                               // Danh sách users
  const [searchText, setSearchText] = useState("");                     // Text tìm kiếm
  const [showRemoved, setShowRemoved] = useState(false);                // Hiển thị user đã xóa hay active
  
  // State quản lý modal chi tiết user
  const [isDetailModalOpen, setDetailModalOpen] = useState(false);      // Modal chi tiết user
  const [userDetail, setUserDetail] = useState(null);                   // Chi tiết user được chọn
  
  // State quản lý pagination
  const [currentPage, setCurrentPage] = useState(0);                    // Trang hiện tại (0-based)
  const [totalPages, setTotalPages] = useState(1);                      // Tổng số trang
  const [isFetched, setIsFetched] = useState(false);                    // Đã fetch data chưa
  
  // State quản lý modal cập nhật password
  const [isEditModalOpen, setEditModalOpen] = useState(false);          // Modal cập nhật password
  const [selectedUser, setSelectedUser] = useState(null);               // User được chọn để update password
  const [newPassword, setNewPassword] = useState("");                   // Password mới

  // ===== UTILITY FUNCTIONS =====
  
  // Hàm dịch role từ English sang Tiếng Việt
  const translateRole = (role) => {
    switch (role) {
      case "CUSTOMER":
        return "Khách hàng";
      case "ADMIN":
        return "Người quản trị";
      case "DOCTOR":
        return "Bác Sĩ";
      case "MANAGER":
        return "Người quản lý";
      default:
        return "Khách";
    }
  };

  // Hàm lấy màu CSS cho từng role
  const getRoleColor = (role) => {
    switch (role) {
      case "CUSTOMER":
        return "bg-yellow-100 text-yellow-700";    // Màu vàng cho customer
      case "DOCTOR":
        return "bg-green-100 text-green-700";      // Màu xanh lá cho doctor
      case "MANAGER":
        return "bg-blue-100 text-blue-700";        // Màu xanh dương cho manager
      default:
        return "bg-teal-100 text-gray-600";        // Màu xám cho admin
    }
  };

  // ===== API FUNCTIONS =====
  
  // Hàm gọi API lấy danh sách users với pagination
  const fetchUsers = async (isRemove, page = 0) => {
    if (!token) return;  // Cần token để authenticate

    try {
      // Gọi API với params: removed status, page, size
      const res = await adminService.getUsers(isRemove, page, 9);
      setUsers(res.data.result.content);                              // Set danh sách users
      setTotalPages(res.data.result.totalPages);                      // Set tổng số trang

      setCurrentPage(page);                                           // Set trang hiện tại
      setShowRemoved(isRemove);                                       // Set trạng thái hiển thị (active/removed)
      setIsFetched(true);                                             // Đánh dấu đã fetch
    } catch (err) {
      console.log(err);
      showNotification(err.response?.data?.message, "error");
    }
  };

  // ===== SEARCH & FILTER =====
  // Memo để filter users theo search text
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const q = searchText.toLowerCase();
      return (
        (user.username || "").toLowerCase().includes(q) ||           // Tìm theo username
        (user.email || "").toLowerCase().includes(q) ||             // Tìm theo email
        translateRole(user.roleName || "")                           // Tìm theo role name (tiếng Việt)
          .toLowerCase()
          .includes(q)
      );
    });
  }, [users, searchText]);

  // ===== USEEFFECT: INITIAL DATA LOAD =====
  // useEffect để load users khi component mount
  useEffect(() => {
    fetchUsers(false);  // Load active users mặc định
  }, [token]);

  // ===== USER ACTIONS HANDLERS =====
  
  // Hàm xử lý xóa (disable) user
  const handleDelete = (id) => {
    adminService
      .deleteUser(id)                                               // Gọi API disable user
      .then(() => {
        showNotification("Đã tắt tài khoản này thành công", "success");
        setTimeout(() => {
          fetchUsers(showRemoved);                                  // Refresh data sau 200ms
        }, 200);
      })
      .catch((err) => {
        showNotification(err.response.data.message, "error");
      });
  };

  // Hàm xử lý khôi phục user đã bị xóa
  const handleRestore = (id) => {
    adminService
      .restoreUser(id, token.token)                                 // Gọi API restore user
      .then(() => {
        showNotification("Đã khôi phục tài khoản này thành công", "success");
        setTimeout(() => {
          fetchUsers(showRemoved);                                  // Refresh data sau 200ms
        }, 200);
      })
      .catch((err) => {
        showNotification(err.response.data.message, "error");
      });
  };

  // ===== MODAL HANDLERS =====
  
  // Hàm mở modal cập nhật password
  const openEditModal = (user) => {
    setSelectedUser(user);       // Set user được chọn
    setNewPassword("");          // Reset password field
    setEditModalOpen(true);      // Mở modal
  };

  // Hàm xử lý cập nhật password
  const handleUpdatePassword = async () => {
    if (!selectedUser || !newPassword) {
      showNotification("Vui lòng nhập mật khẩu mới", "warning");
      return;
    }

    try {
      await adminService.updatePasswordUser(
        selectedUser.id,           // ID user
        newPassword,               // Password mới
        token.token                // Token admin
      );
      setEditModalOpen(false);     // Đóng modal
      setNewPassword("");          // Reset password
      showNotification("Cập nhật mật khẩu thành công", "success");
      fetchUsers(showRemoved);     // Refresh data
    } catch (err) {
      showNotification(err.response.data.message, "error");
      console.log(err);
    }
  };

  // Hàm mở modal chi tiết user
  const openDetailModal = async (user) => {
    try {
      // Gọi API lấy chi tiết user theo ID
      const res = await adminService.getUserId(user.id, token.token);
      setUserDetail(res.data.result);  // Set chi tiết user
      setDetailModalOpen(true);        // Mở modal
    } catch (err) {
      showNotification(err.response.data.message, "error");
    }
  };

  // ===== RENDER MAIN COMPONENT =====
  return (
    <div className="px-6 py-6">
      {/* ===== HEADER SECTION ===== */}
      {/* Header với title và buttons toggle active/removed users */}
      <div className="flex justify-between items-center mb-6">
        <Title level={3}>Quản Lý User</Title>
        <Space>
          {/* Button hiển thị user hoạt động */}
          <Button
            type="default"
            className={!showRemoved ? "border-green-500 text-green-600" : ""}
            icon={<UserOutlined />}
            onClick={() => fetchUsers(false)}                     // Load active users
          >
            User hoạt động
          </Button>
          {/* Button hiển thị user đã xóa */}
          <Button
            type="default"
            className={showRemoved ? "border-red-500 text-red-600" : ""}
            icon={<DeleteOutlined />}
            onClick={() => fetchUsers(true)}                      // Load removed users
          >
            User đã bị xoá
          </Button>
        </Space>
      </div>

      {/* ===== USERS TABLE ===== */}
      {/* Bảng hiển thị danh sách users với các thông tin cơ bản */}
      <table className="w-full border text-sm bg-white shadow-md rounded">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2">Tên Đăng Nhập</th>
            <th className="p-2">Họ Tên</th>
            <th className="p-2">Email</th>
            <th className="p-2">Vai Trò</th>
            <th className="p-2">Trạng Thái</th>
            <th className="p-2">Hành Động</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => (
            <tr key={user.id} className="border-t">
              {/* Username column */}
              <td className="p-2">{user.username}</td>
              
              {/* Full name column */}
              <td className="p-2">{user.fullName}</td>
              
              {/* Email column */}
              <td className="p-2">{user.email}</td>
              
              {/* Role column với badge màu */}
              <td className="p-2">
                <span
                  className={`px-2 py-1 text-xs rounded ${getRoleColor(
                    user.roleName
                  )}`}
                >
                  {translateRole(user.roleName)}
                </span>
              </td>
              
              {/* Status column */}
              <td className="p-2">
                <span
                  className={`px-2 py-1 text-xs rounded ${
                    user.removed
                      ? "bg-red-100 text-red-600"         // Màu đỏ cho removed
                      : "bg-green-100 text-green-600"     // Màu xanh cho active
                  }`}
                >
                  {user.removed ? "Không hoạt động" : "Hoạt động"}
                </span>
              </td>
              
              {/* Actions column */}
              <td className="p-2 space-x-2">
                {/* Button Chi tiết - chỉ hiển thị cho active users */}
                {!showRemoved && (
                  <>
                    <button
                      className="text-white bg-blue-500 px-3 py-1 rounded hover:bg-blue-600"
                      onClick={() => openDetailModal(user)}
                    >
                      Chi tiết
                    </button>
                  </>
                )}

                {/* Conditional render buttons theo trạng thái user */}
                {showRemoved ? (
                  // Button Khôi phục cho removed users
                  <Popconfirm
                    title="Bạn có chắc muốn khôi phục user này không?"
                    onConfirm={() => handleRestore(user.id)}
                    okText="Khôi phục"
                    cancelText="Huỷ"
                  >
                    <button className="text-white bg-green-500 px-3 py-1 rounded hover:bg-green-600">
                      Khôi phục
                    </button>
                  </Popconfirm>
                ) : (
                  // Button Tắt cho active users
                  <Popconfirm
                    title="Bạn có chắc muốn tắt user này không?"
                    onConfirm={() => handleDelete(user.id)}
                    okText="tắt"
                    cancelText="Huỷ"
                  >
                    <button className="text-white bg-red-500 px-3 py-1 rounded hover:bg-red-600">
                      Tắt
                    </button>
                  </Popconfirm>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ===== PAGINATION CONTROLS ===== */}
      {/* Custom pagination chỉ hiển thị sau khi đã fetch data */}
      {isFetched && (
        <div className="flex justify-end mt-4">
          <Button
            disabled={currentPage === 0}                          // Disable nếu ở trang đầu
            onClick={() => fetchUsers(showRemoved, currentPage - 1)}
            className="mr-2"
          >
            Trang trước
          </Button>
          <span className="px-4 py-1 bg-gray-100 rounded text-sm">
            Trang {currentPage + 1} / {totalPages}
          </span>
          <Button
            disabled={currentPage + 1 >= totalPages}              // Disable nếu ở trang cuối
            onClick={() => fetchUsers(showRemoved, currentPage + 1)}
            className="ml-2"
          >
            Trang tiếp
          </Button>
        </div>
      )}

      {/* ===== MODAL CHI TIẾT USER ===== */}
      {/* Modal hiển thị và chỉnh sửa thông tin chi tiết user */}
      <Modal
        isOpen={isDetailModalOpen}
        onRequestClose={() => setDetailModalOpen(false)}
        contentLabel="Chi tiết user"
        className="relative bg-white p-8 rounded-xl shadow-2xl w-full max-w-4xl mx-auto outline-none max-h-[90vh] overflow-y-auto"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
      >
        {/* Nút đóng modal ở góc phải */}
        <button
          onClick={() => setDetailModalOpen(false)}
          className="absolute top-4 right-4 text-gray-500 hover:text-red-500 text-2xl font-bold"
          aria-label="Đóng"
        >
          <CloseOutlined />
        </button>
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">
          Chi tiết User
        </h2>
        {!userDetail ? (
          // Loading state
          <p className="text-gray-400">Đang tải dữ liệu người dùng...</p>
        ) : (
          <>
            {/* Form component chỉnh sửa user */}
            <EditUserFormAdmin
              userDetail={userDetail}
              token={token.token}
              onClose={() => {
                setUserDetail(null);
                setDetailModalOpen(false);
              }}
              onUpdated={() => fetchUsers(showRemoved)}          // Refresh data sau khi update
            />
            {/* Action buttons */}
            <div className="py-2 flex justify-end space-x-2">
              <button
                className="text-white bg-red-500 px-3 py-1 rounded hover:bg-red-600"
                onClick={() => openEditModal(userDetail)}       // Mở modal cập nhật password
              >
                Cập nhật password
              </button>
              <button
                type="submit"
                form="edit-user-form"                           // Submit form EditUserFormAdmin
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                Cập nhật
              </button>
            </div>
          </>
        )}
      </Modal>

      {/* ===== MODAL CẬP NHẬT PASSWORD ===== */}
      {/* Modal đơn giản để cập nhật password cho user */}
      <Modal
        isOpen={isEditModalOpen}
        onRequestClose={() => setEditModalOpen(false)}
        contentLabel="Cập nhật mật khẩu"
        className="bg-white p-6 rounded-md shadow-lg max-w-md mx-auto mt-20 outline-none"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start"
      >
        <h2 className="text-xl font-semibold mb-4">Cập nhật mật khẩu</h2>
        <label className="block mb-2 font-medium">Mật khẩu mới:</label>
        
        {/* Input password mới */}
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Nhập mật khẩu mới"
          className="w-full border px-3 py-2 rounded mb-4"
        />
        
        {/* Action buttons */}
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => setEditModalOpen(false)}              // Đóng modal
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Huỷ
          </button>
          <button
            onClick={handleUpdatePassword}                       // Submit update password
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Cập nhật
          </button>
        </div>
      </Modal>
    </div>
  );
};

// ===== EXPORT COMPONENT =====
export default UserManagement;
