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
  const token = useSelector((state) => state.authSlice);

  const [users, setUsers] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [showRemoved, setShowRemoved] = useState(false);
  const { showNotification } = useContext(NotificationContext);
  const [isDetailModalOpen, setDetailModalOpen] = useState(false);
  const [userDetail, setUserDetail] = useState(null);
  const [currentPage, setCurrentPage] = useState(0); // backend page = 0-based
  const [totalPages, setTotalPages] = useState(1);
  const [isFetched, setIsFetched] = useState(false);

  // thực hiện chức năng gọi danh sách User
  const fetchUsers = async (isRemove, page = 0) => {
    if (!token) return;

    try {
      const res = await adminService.getUsers(isRemove, page, 5);
      setUsers(res.data.result.content);
      setTotalPages(res.data.result.totalPages);

      setCurrentPage(page);

      setShowRemoved(isRemove); // để biết đang ở "tắt" hay "hoạt động"
      setIsFetched(true);
    } catch (err) {
      console.log(err);
      showNotification(err.response?.data?.message, "error");
    }
  };
  // lọc user theo từng username và id
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const q = searchText.toLowerCase();
      return (
        (user.username || "").toLowerCase().includes(q) ||
        (user.email || "").toLowerCase().includes(q) ||
        (user.roleName || "").toLowerCase().includes(q)
      );
    });
  }, [users, searchText]);

  useEffect(() => {
    fetchUsers(false);
  }, [token]);

  // thực hiện chức năng style với từng role khác nhau
  const getRoleColor = (role) => {
    switch (role) {
      case "CUSTOMER":
        return "bg-yellow-100 text-yellow-700";
      case "DOCTOR":
        return "bg-green-100 text-green-700";
      case "MANAGER":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-teal-100 text-gray-600";
    }
  };

  // thực hiện chức năng delete
  const handleDelete = (id) => {
    adminService
      .deleteUser(id)
      .then((res) => {
        showNotification("Đã tắt tài khoản này thành công", "success");
        setTimeout(() => {
          fetchUsers(showRemoved);
        }, 200);
      })
      .catch((err) => {
        showNotification(err.response.data.message, "error");
      });
  };

  // thực hiện chức năng restore
  const handleRestore = (id) => {
    adminService
      .restoreUser(id, token.token)
      .then((res) => {
        showNotification("Đã khôi phục tài khoản này thành công", "success");

        setTimeout(() => {
          fetchUsers(showRemoved);
        }, 200);
      })
      .catch((err) => {
        showNotification(err.response.data.message, "error");
      });
  };

  // chỉnh sửa cho chức năng update password
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");

  const openEditModal = (user) => {
    setSelectedUser(user);
    setNewPassword("");
    setEditModalOpen(true);
  };
  // update password cho user hoat dong

  const handleUpdatePassword = async () => {
    if (!selectedUser || !newPassword) {
      showNotification("Vui lòng nhập mật khẩu mới", "warning");
      return;
    }

    try {
      await adminService.updatePasswordUser(
        selectedUser.id,
        newPassword,
        token.token
      );
      setEditModalOpen(false);
      setNewPassword("");
      showNotification("Cập nhật mật khẩu thành công", "success");
      fetchUsers(showRemoved);
    } catch (err) {
      showNotification(err.response.data.message, "error");
      console.log(err);
    }
  };

  // detail user
  const openDetailModal = async (user) => {
    try {
      const res = await adminService.getUserId(user.id, token.token);
      setUserDetail(res.data.result);
      setDetailModalOpen(true);
    } catch (err) {
      showNotification(err.response.data.message, "error");
    }
  };

  return (
    <div
      className="min-h-screen px-6 py-6"
      style={{
        background: "linear-gradient(135deg, #f0f4f8, #e8f0ff)",
      }}
    >
      <div className="flex justify-between items-center mb-6">
        <Title level={3}>Quản Lý User</Title>
        <Space>
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="border border-gray-300 px-4 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition w-80"
          />
          <Button
            type="default"
            className={!showRemoved ? "border-green-500 text-green-600" : ""}
            icon={<UserOutlined />}
            onClick={() => fetchUsers(false)}
          >
            User hoạt động
          </Button>
          <Button
            type="default"
            className={showRemoved ? "border-red-500 text-red-600" : ""}
            icon={<DeleteOutlined />}
            onClick={() => fetchUsers(true)}
          >
            User đã bị xoá
          </Button>
        </Space>
      </div>
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
              <td className="p-2">{user.username}</td>
              <td className="p-2">{user.fullName}</td>
              <td className="p-2">{user.email}</td>
              <td className="p-2">
                <span
                  className={`px-2 py-1 text-xs rounded ${getRoleColor(
                    user.roleName
                  )}`}
                >
                  {user.roleName}
                </span>
              </td>
              <td className="p-2">
                <span
                  className={`px-2 py-1 text-xs rounded ${
                    user.removed
                      ? "bg-red-100 text-red-600"
                      : "bg-green-100 text-green-600"
                  }`}
                >
                  {user.removed ? "Không hoạt động" : "Hoạt động"}
                </span>
              </td>
              <td className="p-2 space-x-2">
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

                {showRemoved ? (
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

      {isFetched && (
        <div className="flex justify-end mt-4">
          <Button
            disabled={currentPage === 0}
            onClick={() => fetchUsers(showRemoved, currentPage - 1)}
            className="mr-2"
          >
            Trang trước
          </Button>
          <span className="px-4 py-1 bg-gray-100 rounded text-sm">
            Trang {currentPage + 1} / {totalPages}
          </span>
          <Button
            disabled={currentPage + 1 >= totalPages}
            onClick={() => fetchUsers(showRemoved, currentPage + 1)}
            className="ml-2"
          >
            Trang tiếp
          </Button>
        </div>
      )}

      {/* Modal chi tiết user */}
      <Modal
        isOpen={isDetailModalOpen}
        onRequestClose={() => setDetailModalOpen(false)}
        contentLabel="Chi tiết user"
        className="relative bg-white p-8 rounded-xl shadow-2xl w-full max-w-4xl mx-auto outline-none max-h-[90vh] overflow-y-auto"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
      >
        {/* Nút đóng ở góc phải */}
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
          <p className="text-gray-400">Đang tải dữ liệu người dùng...</p>
        ) : (
          <>
            <EditUserFormAdmin
              userDetail={userDetail}
              token={token.token}
              onClose={() => {
                setUserDetail(null);
                setDetailModalOpen(false);
              }}
              onUpdated={() => fetchUsers(showRemoved)}
            />
            <div className="py-2 flex justify-end space-x-2">
              <button
                className="text-white bg-red-500 px-3 py-1 rounded hover:bg-red-600"
                onClick={() => openEditModal(userDetail)}
              >
                Cập nhật password
              </button>
              <button
                type="submit"
                form="edit-user-form"
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                Cập nhật
              </button>
            </div>
          </>
        )}
      </Modal>
      {/* Modal cập nhật mật khẩu */}
      <Modal
        isOpen={isEditModalOpen}
        onRequestClose={() => setEditModalOpen(false)}
        contentLabel="Cập nhật mật khẩu"
        className="bg-white p-6 rounded-md shadow-lg max-w-md mx-auto mt-20 outline-none"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start"
      >
        <h2 className="text-xl font-semibold mb-4">Cập nhật mật khẩu</h2>
        <label className="block mb-2 font-medium">Mật khẩu mới:</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Nhập mật khẩu mới"
          className="w-full border px-3 py-2 rounded mb-4"
        />
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => setEditModalOpen(false)}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Huỷ
          </button>
          <button
            onClick={handleUpdatePassword}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Cập nhật
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default UserManagement;
