import { useEffect, useState } from "react";
import { Layout, Menu, Avatar, Typography, Button } from "antd";
import {
  DashboardOutlined,
  TeamOutlined,
  PlusOutlined,
  LogoutOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import { useSelector } from "react-redux";
import { authService } from "../../service/auth.service";
import { useNavigate } from "react-router-dom";

const { Sider } = Layout;
const { Title, Text } = Typography;

const AdminSidebar = ({
  collapsed,          // Trạng thái thu gọn sidebar
  onCollapse,         // Handler để toggle collapse
  selectedMenu,       // Menu item được chọn hiện tại
  onMenuSelect,       // Handler khi click menu item
}) => {
  // ===== REDUX & NAVIGATION =====
  const token = useSelector((state) => state.authSlice);       // Token từ Redux store
  const navigate = useNavigate();                              // Hook điều hướng

  // ===== STATE MANAGEMENT =====
  const [infoUser, setInfoUser] = useState();                 // Thông tin user admin hiện tại

  // ===== LOGOUT HANDLER =====
  // Hàm xử lý đăng xuất và clear token
  const handleLogout = () => {
    // Clear token and redirect to home page
    localStorage.removeItem("token");
    navigate("/");
  };

  // ===== MENU CONFIGURATION =====
  // Cấu hình các menu items cho admin sidebar
  const menuItems = [
    {
      key: "dashboard",                                        // Dashboard chính
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "user-management",                                  // Quản lý người dùng
      icon: <TeamOutlined />,
      label: "Quản Lý User",
    },
    {
      key: "create-account",                                   // Tạo tài khoản mới
      icon: <PlusOutlined />,
      label: "Tạo Tài Khoản",
    },
  ];

  // ===== USEEFFECT: TẢI THÔNG TIN USER =====
  // useEffect này chạy khi có token để lấy thông tin admin hiện tại
  useEffect(() => {
    if (!token) return;  // Nếu không có token thì return
    
    authService
      .getMyInfo(token.token)                                // Gọi API lấy thông tin user
      .then((res) => {
        setInfoUser(res.data.result);                        // Set thông tin user vào state
      })
      .catch((err) => {
        console.log(err);                                    // Log lỗi nếu có
      });
  }, [token]);

  // ===== UTILITY FUNCTION =====
  // Hàm render avatar từ thông tin user
  const getCustomInfo = () => {
    if (infoUser) {
      return <Avatar>{infoUser.username}</Avatar>;           // Hiển thị avatar với username
    }
  };

  // ===== RENDER MAIN COMPONENT =====
  return (
    <Sider
      collapsible                                            // Cho phép thu gọn
      collapsed={collapsed}                                  // Trạng thái thu gọn
      onCollapse={onCollapse}                               // Handler toggle
      theme="dark"                                          // Theme tối
      width={250}                                           // Chiều rộng khi expand
      trigger={null}                                        // Tắt trigger mặc định
      style={{
        position: "fixed",                                  // Fixed position
        height: "100vh",                                    // Full height
        left: 0,
        top: 0,
        zIndex: 1000,                                      // High z-index
        overflow: "auto",                                   // Scroll nếu nội dung dài
      }}
    >
      {/* ===== HEADER TITLE ===== */}
      {/* Tiêu đề ADMIN có thể thu gọn thành "A" */}
      <div className="flex items-center justify-center py-4">
        <Title level={3} style={{ color: "white", margin: 0 }}>
          {collapsed ? "A" : "ADMIN"}
        </Title>
      </div>

      {/* ===== USER INFO SECTION ===== */}
      {/* Phần hiển thị thông tin admin user với avatar */}
      <div className="flex flex-col items-center py-4 border-b border-gray-600">
        <nav>{getCustomInfo()}</nav>                         {/* Avatar admin */}
        {!collapsed && (                                      // Chỉ hiển thị khi không collapse
          <div className="text-center mt-2">
            <Text style={{ color: "white" }}>Admin User</Text>
            <br />
            <Text style={{ color: "#8c8c8c" }}>VP Admin</Text>
          </div>
        )}
      </div>

      {/* ===== MAIN NAVIGATION MENU ===== */}
      {/* Menu chính với các items: Dashboard, User Management, Create Account */}
      <Menu
        theme="dark"                                          // Theme tối
        selectedKeys={[selectedMenu]}                         // Item được chọn
        mode="inline"                                         // Inline mode
        style={{ borderRight: 0, marginTop: 16 }}
        onClick={({ key }) => onMenuSelect(key)}              // Handler click menu
        items={menuItems}                                     // Danh sách menu items
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
      {/* Nút đăng xuất với màu đỏ warning */}
      <div className="px-4 mt-4">
        <Button
          type="text"
          icon={<LogoutOutlined />}
          style={{
            color: "white",
            width: "100%",
            backgroundColor: "#ff4d4f",                      // Màu đỏ warning
            borderColor: "#ff4d4f",
            height: "30px",
          }}
          onClick={handleLogout}                             // Handler đăng xuất
        >
          {!collapsed && <span style={{ color: "#fff" }}>Đăng Xuất</span>}
        </Button>
      </div>
    </Sider>
  );
};

// ===== EXPORT COMPONENT =====
export default AdminSidebar;
