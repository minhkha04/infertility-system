import React, { useEffect, useState } from "react";
import { Menu, Avatar, Typography, Divider, Badge, Button } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { path } from "../../common/path";
import {
  UserOutlined,
  MedicineBoxOutlined,
  CalendarOutlined,
  HeartOutlined,
  MessageOutlined,
  CreditCardOutlined,
  LogoutOutlined,
  HomeOutlined,
  ReadOutlined,
} from "@ant-design/icons";
import { authService } from "../../service/auth.service";
import { useSelector } from "react-redux";

const { Text } = Typography;

const CustomerSidebar = ({
  selectedMenuItem,      // Menu item hiện tại được chọn
  setSelectedMenuItem,   // Setter để update selected menu (unused trong file này)
  collapsed,             // Trạng thái thu gọn sidebar
}) => {
  // ===== STATE MANAGEMENT =====
  const [userName, setUserName] = useState("");                      // Tên user (unused)
  const [infoUser, setInfoUser] = useState();                       // Thông tin customer user hiện tại

  // ===== MENU CONFIGURATION =====
  // Cấu hình tất cả menu items cho customer với icons, labels, paths
  const menuItems = [
    {
      key: "services",
      icon: <MedicineBoxOutlined />,
      label: "Dịch Vụ",
      title: "Xem dịch vụ đã đăng ký",
      path: path.customerServices,                              // Dịch vụ đã đăng ký
    },
    {
      key: "appointments",
      icon: <CalendarOutlined />,
      label: "Lịch Hẹn",
      title: "Quản lý lịch hẹn khám",
      path: path.customerAppointments,                          // Quản lý lịch hẹn
    },
    {
      key: "treatment",
      icon: <HeartOutlined />,
      label: "Điều Trị",
      title: "Theo dõi lịch trình điều trị",
      path: path.customerTreatment,                             // Theo dõi điều trị
    },
    {
      key: "my-blogs",
      icon: <ReadOutlined />,
      label: "Bài viết của tôi",
      title: "Xem và quản lý bài viết của bạn",
      path: "/customer-dashboard/my-blogs",                     // Blog posts của customer
    },
    {
      key: "feedback",
      icon: <MessageOutlined />,
      label: "Phản Hồi",
      title: "Gửi phản hồi và khiếu nại",
      path: path.customerFeedback,                              // Feedback và khiếu nại
    },
    {
      key: "payment",
      icon: <CreditCardOutlined />,
      label: "Thanh Toán",
      title: "Quản lý thanh toán",
      path: path.customerPayment,                               // Thanh toán và billing
    },
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Hồ Sơ",
      title: "Xem thông tin cá nhân",
      path: path.customerProfile,                               // Profile cá nhân
    },
  ];

  // ===== REDUX & NAVIGATION =====
  const token = useSelector((state) => state.authSlice);              // Token từ Redux store
  const navigate = useNavigate();                                     // Hook điều hướng

  // ===== USEEFFECT: TẢI THÔNG TIN USER =====
  // useEffect này chạy khi có token để lấy thông tin customer hiện tại
  useEffect(() => {
    if (!token) return;  // Nếu không có token thì return
    
    authService
      .getMyInfo(token.token)                                         // Gọi API lấy thông tin user
      .then((res) => {
        setInfoUser(res.data.result);                                // Set thông tin user vào state
      })
      .catch((err) => {});                                           // Silent catch lỗi
  }, [token]);

  // ===== USER INFO RENDER FUNCTION =====
  // Hàm render thông tin user với avatar và fullName
  const checkLogin = () => {
    if (infoUser) {
      return (
        <div className="flex items-center gap-2 select-none cursor-pointer ">
          {/* Avatar customer với hover effect */}
          <Avatar
            className="w-12 h-12 rounded-full justify-center text-white font-bold hover:border-4 hover:border-orange-400 transition-all duration-300"
            src={infoUser.avatarUrl || undefined}                    // Avatar URL hoặc default
          ></Avatar>
          {/* Tên customer */}
          <span className="text-sm font-medium text-white">
            {infoUser.fullName}
          </span>
        </div>
      );
    }
  };

  // ===== LOGOUT HANDLER =====
  // Hàm xử lý đăng xuất và clear token
  const handleLogout = () => {
    // Clear token and redirect to home page
    localStorage.removeItem("token");
    navigate("/");
  };

  // ===== RENDER MAIN COMPONENT =====
  return (
    <div
      style={{
        background: "#001529",                                        // Dark theme background
        color: "#fff",                                               // White text
        height: "100vh",                                             // Full viewport height
        position: "fixed",                                           // Fixed position
        left: 0,
        top: 0,
        zIndex: 1000,                                               // High z-index
        width: collapsed ? 80 : 250,                               // Dynamic width based on collapsed state
        overflow: "auto",                                           // Scroll if content overflow
        transition: "width 0.2s",                                  // Smooth width transition
      }}
    >
      {/* ===== CUSTOMER INFO SECTION ===== */}
      {/* Phần hiển thị thông tin customer với avatar */}
      <div className="p-4 text-center">{checkLogin()}</div>

      {/* ===== MAIN NAVIGATION MENU ===== */}
      {/* Menu chính với tất cả navigation items cho customer */}
      <Menu
        mode="inline"                                                // Inline menu mode
        selectedKeys={[selectedMenuItem]}                            // Highlight selected item
        theme="dark"                                                // Dark theme
        style={{
          border: "none",
          background: "transparent",
          color: "#fff",
          height: "auto",
        }}
        items={menuItems.map((item) => ({
          key: item.key,
          icon: item.icon,
          label: (
            <Link
              to={item.path}                                        // Route path
              title={collapsed ? item.title : ""}                   // Tooltip chỉ hiển thị khi collapsed
              style={{ color: "#fff" }}
            >
              {item.label}
            </Link>
          ),
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
            height: "30px",
            color: "#001529",                                       // Dark text
            background: "#fff",                                     // White background
            border: "none",
          }}
          onClick={() => navigate("/")}                            // Navigate về trang chủ
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
          danger                                                    // Danger style
          style={{
            width: "100%",
            backgroundColor: "#ff4d4f",                             // Red background
            borderColor: "#ff4d4f",
            color: "#fff",
            height: "30px",
          }}
          onClick={handleLogout}                                    // Handler đăng xuất
        >
          {!collapsed && (                                          // Text chỉ hiển thị khi expand
            <span style={{ marginLeft: 8, color: "#fff" }}>Đăng Xuất</span>
          )}
        </Button>
      </div>

      {/* ===== FOOTER SECTION ===== */}
      {/* Footer với version info - chỉ hiển thị khi không collapse */}
      {!collapsed && (
        <div
          style={{
            position: "absolute",
            bottom: 16,
            left: 16,
            right: 16,
            color: "#bfbfbf",                                       // Light gray color
          }}
        >
          <Divider style={{ margin: "8px 0", borderColor: "#222" }} />
          <Text
            type="secondary"
            style={{
              fontSize: "11px",
              display: "block",
              textAlign: "center",
              marginTop: "8px",
              color: "#bfbfbf",
            }}
          >
            Hệ thống khách hàng v1.0                                {/* Customer system version */}
          </Text>
        </div>
      )}
    </div>
  );
};

// ===== EXPORT COMPONENT =====
export default CustomerSidebar;
