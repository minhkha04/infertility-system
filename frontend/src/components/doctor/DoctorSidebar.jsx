import React, { useEffect, useState } from "react";
import { Menu, Avatar, Typography, Divider, Button } from "antd";
import { useNavigate } from "react-router-dom";
import { path } from "../../common/path";
import {
  DashboardOutlined,
  TeamOutlined,
  FileTextOutlined,
  UserOutlined,
  HomeOutlined,
  ReadOutlined,
  ClockCircleOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { authService } from "../../service/auth.service";
import { useSelector } from "react-redux";

const DoctorSidebar = ({
  selectedMenuItem,      // Menu item hiện tại được chọn
  setSelectedMenuItem,   // Setter để update selected menu
  collapsed,             // Trạng thái thu gọn sidebar
}) => {
  // ===== MENU CONFIGURATION =====
  // Cấu hình tất cả menu items cho doctor với icons, labels, paths
  const menuItems = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
      title: "Xem tổng quan và lịch hôm nay",           // Tooltip khi hover
      path: path.doctorDashboard,                      // Route path
    },
    {
      key: "patients",
      icon: <TeamOutlined />,
      label: "Bệnh Nhân Hôm Nay",
      title: "Danh sách bệnh điều trị hôm nay",
      path: path.doctorPatients,
    },
    {
      key: "test-results",
      icon: <FileTextOutlined />,
      label: "Hồ Sơ Bệnh Nhân",
      title: "Quản lí hồ sơ bệnh nhân",
      path: path.doctorTestResults,
    },
    {
      key: "my-blogs",
      icon: <ReadOutlined />,
      label: "Bài viết của tôi",
      title: "Xem và quản lý bài viết của bạn",
      path: path.doctorBlogs,
    },
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Hồ Sơ",
      title: "Thông tin cá nhân bác sĩ",
      path: path.doctorProfile,
    },
    {
      key: "change-requests",
      icon: <ClockCircleOutlined />,
      label: "Yêu cầu đổi lịch hẹn",
      title: "Quản lý yêu cầu đổi lịch",
      path: path.doctorChangeRequests,
    },
  ];

  // ===== REDUX & NAVIGATION =====
  const token = useSelector((state) => state.authSlice);        // Token từ Redux store
  const navigate = useNavigate();                               // Hook điều hướng

  // ===== STATE MANAGEMENT =====
  const [infoUser, setInfoUser] = useState();                  // Thông tin user doctor hiện tại

  // ===== USEEFFECT: TẢI THÔNG TIN USER =====
  // useEffect này chạy khi có token để lấy thông tin doctor hiện tại
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
          {/* Avatar doctor với hover effect */}
          <Avatar
            className="w-12 h-12 rounded-full justify-center text-white font-bold hover:border-4 hover:border-orange-400 transition-all duration-300"
            src={infoUser.avatarUrl || undefined}              // Avatar URL hoặc default
          ></Avatar>
          {/* Tên doctor - chỉ hiển thị khi không collapse */}
          <span className="text-sm font-medium text-white">
            {infoUser.fullName}
          </span>
        </div>
      );
    }
  };

  // ===== RENDER MAIN COMPONENT =====
  return (
    <div
      style={{
        background: "#001529",                                 // Dark theme background
        color: "#fff",                                         // White text
        height: "100vh",                                       // Full viewport height
        position: "fixed",                                     // Fixed position
        left: 0,
        top: 0,
        zIndex: 1000,                                         // High z-index
        width: collapsed ? 80 : 250,                         // Dynamic width based on collapsed state
        overflow: "auto",                                     // Scroll if content overflow
        transition: "width 0.2s",                            // Smooth width transition
      }}
    >
      {/* ===== DOCTOR INFO SECTION ===== */}
      {/* Phần hiển thị thông tin doctor với avatar */}
      <div className="p-4 text-center">{checkLogin()}</div>

      {/* ===== MAIN NAVIGATION MENU ===== */}
      {/* Menu chính với tất cả navigation items */}
      <Menu
        mode="inline"                                          // Inline menu mode
        selectedKeys={[selectedMenuItem]}                      // Highlight selected item
        theme="dark"                                          // Dark theme
        style={{
          border: "none",
          background: "transparent",
          color: "#fff",
          height: "auto",
        }}
        onClick={({ key }) => {
          // Handler khi click menu item
          const items = menuItems.find((item) => item.key === key);
          if (!items) {
            console.warn(`Không tìm thấy menu item với key: ${key}`);
            return;
          }
          navigate(items.path);                               // Navigate to item path
          setSelectedMenuItem(key);                           // Update selected state
        }}
        items={menuItems.map((item) => ({
          key: item.key,
          icon: item.icon,
          label: item.label,                                  // Label hiển thị
          title: collapsed ? item.title : "",                // Tooltip chỉ hiển thị khi collapsed
        }))}
      />

      {/* ===== HOME BUTTON ===== */}
      {/* Nút về trang chủ */}
      <div className="px-4 mt-4">
        <Button
          type="default"
          icon={<HomeOutlined />}
          style={{
            width: "100%",
            color: "#001529",                                 // Dark text
            background: "#fff",                               // White background
            border: "none",
            height: "30px",
          }}
          onClick={() => navigate("/")}                      // Navigate về trang chủ
        >
          {!collapsed && <span style={{ marginLeft: 8 }}>Về Trang Chủ</span>}
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
          {!collapsed && (                                    // Text chỉ hiển thị khi expand
            <span style={{ marginLeft: 8, color: "#fff" }}>Đăng Xuất</span>
          )}
        </Button>
      </div>

      {/* ===== FOOTER DIVIDER ===== */}
      {/* Footer với divider - chỉ hiển thị khi không collapse */}
      {!collapsed && (
        <div
          style={{
            position: "absolute",
            bottom: 16,
            left: 24,
            right: 24,
            textAlign: "center",
            color: "#bfbfbf",                                 // Light gray color
          }}
        >
          <Divider style={{ margin: "8px 0", borderColor: "#222" }} />
        </div>
      )}
    </div>
  );
};

// ===== EXPORT COMPONENT =====
export default DoctorSidebar;
