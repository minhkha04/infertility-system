import React, { useEffect, useState } from "react";
import { Avatar, Button, Layout, Menu } from "antd";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { path } from "../../common/path";
import {
  BarChartOutlined,
  CalendarOutlined,
  ScheduleOutlined,
  UserOutlined,
  ClockCircleOutlined,
  MessageOutlined,
  AppstoreOutlined,
  EditOutlined,
  DashboardOutlined,
  HomeOutlined,
  FormOutlined,
  LogoutOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { useSelector } from "react-redux";
import { authService } from "../../service/auth.service";

const { Sider } = Layout;

const ManagerSidebar = ({
  collapsed,        // Trạng thái thu gọn sidebar
  onCollapse,       // Handler để toggle collapse
  selectedMenu,     // Menu item hiện tại được chọn
  onMenuSelect,     // Handler khi click menu item (unused trong file này)
}) => {
  // ===== MENU CONFIGURATION =====
  // Cấu hình tất cả menu items cho manager với icons, labels, paths
  const menuItems = [
    {
      key: "report",
      icon: <BarChartOutlined />,
      label: "Báo Cáo Doanh Thu",
      path: path.managerDashboard,                             // Dashboard và báo cáo
    },
    {
      key: "schedule",
      icon: <CalendarOutlined />,
      label: "Xếp Lịch Làm Việc",
      path: "/manager/schedule",                               // Xếp lịch làm việc cho doctors
    },
    {
      key: "appointments",
      icon: <ScheduleOutlined />,
      label: "Quản Lý Lịch Hẹn",
      path: path.managerAppointments,                          // Quản lý appointments
    },
    {
      key: "treatment-records",
      icon: <FileTextOutlined />,
      label: "Quản Lý Hồ Sơ Điều Trị",
      path: "/manager/treatment-records",                      // Quản lý treatment records
    },
    {
      key: "doctor-schedule",
      icon: <UserOutlined />,
      label: "Lịch Khám Bác Sĩ Hôm Nay",
      path: "/manager/doctor-schedule",                        // Xem lịch bác sĩ hôm nay
    },
    {
      key: "feedback",
      icon: <MessageOutlined />,
      label: "Quản Lý Feedback",
      path: "/manager/feedback",                               // Quản lý feedback từ customers
    },
    {
      key: "services",
      icon: <AppstoreOutlined />,
      label: "Quản Lý Dịch Vụ",
      path: path.managerServices,                              // Quản lý các dịch vụ điều trị
    },
    {
      key: "blog",
      icon: <EditOutlined />,
      label: "Quản Lý Blog",
      path: "/manager/blog-management",                        // Quản lý blog posts
    },
    {
      key: "profile",
      icon: <FormOutlined />,
      label: "Hồ Sơ",
      path: path.managerProfile,                               // Profile manager
    },
  ];

  // ===== REDUX & NAVIGATION =====
  const token = useSelector((state) => state.authSlice);        // Token từ Redux store
  const navigate = useNavigate();                               // Hook điều hướng

  // ===== STATE MANAGEMENT =====
  const [infoUser, setInfoUser] = useState();                  // Thông tin manager user hiện tại

  // ===== USEEFFECT: TẢI THÔNG TIN USER =====
  // useEffect này chạy khi có token để lấy thông tin manager hiện tại
  useEffect(() => {
    if (!token) return;  // Nếu không có token thì return
    
    authService
      .getMyInfo(token.token)                                   // Gọi API lấy thông tin user
      .then((res) => {
        setInfoUser(res.data.result);                          // Set thông tin user vào state
      })
      .catch((err) => {});                                     // Silent catch lỗi
  }, [token]);

  // ===== LOGOUT HANDLER =====
  // Hàm xử lý đăng xuất và clear token
  const handleLogout = () => {
    // Clear token and redirect to home page
    localStorage.removeItem("token");
    navigate("/");
  };

  // ===== USER INFO RENDER FUNCTION =====
  // Hàm render thông tin user với avatar và fullName
  const checkLogin = () => {
    if (infoUser) {
      return (
        <div className="flex items-center gap-2 select-none cursor-pointer ">
          {/* Avatar manager với hover effect */}
          <Avatar
            className="w-12 h-12 rounded-full justify-center text-white font-bold hover:border-4 hover:border-orange-400 transition-all duration-300"
            src={infoUser.avatarUrl || undefined}              // Avatar URL hoặc default
          ></Avatar>
          {/* Tên manager */}
          <span className="text-sm font-medium text-white">
            {infoUser.fullName}
          </span>
        </div>
      );
    }
  };

  // ===== RENDER MAIN COMPONENT =====
  return (
    <Sider
      collapsible                                              // Cho phép thu gọn
      collapsed={collapsed}                                    // Trạng thái thu gọn
      onCollapse={onCollapse}                                 // Handler toggle
      theme="dark"                                            // Dark theme
      width={250}                                             // Chiều rộng khi expand
      trigger={null}                                          // Tắt trigger mặc định
      style={{
        position: "fixed",                                    // Fixed position
        height: "100vh",                                      // Full height
        left: 0,
        top: 0,
        zIndex: 1000,                                        // High z-index
        overflow: "auto",                                     // Scroll nếu content dài
      }}
    >
      {/* ===== MANAGER INFO SECTION ===== */}
      {/* Phần hiển thị thông tin manager với avatar */}
      <div className="p-4 text-center">{checkLogin()}</div>

      {/* ===== MAIN NAVIGATION MENU ===== */}
      {/* Menu chính với tất cả navigation items cho manager */}
      <Menu
        theme="dark"                                          // Dark theme
        selectedKeys={[selectedMenu]}                         // Highlight selected item
        mode="inline"                                         // Inline menu mode
        style={{ borderRight: 0 }}
        items={menuItems.map((item) => ({
          key: item.key,
          icon: item.icon,
          label: <Link to={item.path}>{item.label}</Link>,    // Sử dụng Link component để navigate
        }))}
      />

      {/* ===== HOME BUTTON ===== */}
      {/* Nút về trang chủ */}
      <div className="px-4 mt-4">
        <Button
          type="default"
          icon={<HomeOutlined />}
          style={{ width: "100%", height: "30px" }}
          onClick={() => navigate("/")}                      // Navigate về trang chủ
        >
          {!collapsed && "Về Trang Chủ"}                     {/* Text chỉ hiển thị khi expand */}
        </Button>
      </div>

      {/* ===== LOGOUT BUTTON ===== */}
      {/* Nút đăng xuất với style danger */}
      <div className="px-4 mt-2">
        <Button
          type="default"
          icon={<LogoutOutlined />}
          danger                                              // Danger style
          style={{
            width: "100%",
            backgroundColor: "#ff4d4f",                       // Red background
            borderColor: "#ff4d4f",
            color: "#fff",
            height: "40px",
          }}
          onClick={handleLogout}                              // Handler đăng xuất
        >
          {!collapsed && <span style={{ color: "#fff" }}>Đăng Xuất</span>}
        </Button>
      </div>
    </Sider>
  );
};

// ===== EXPORT COMPONENT =====
export default ManagerSidebar;
