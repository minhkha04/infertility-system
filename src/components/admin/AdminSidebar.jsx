import React, { useEffect, useState } from "react";
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
  collapsed,
  onCollapse,
  selectedMenu,
  onMenuSelect,
}) => {
  const token = useSelector((state) => state.authSlice);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear token and redirect to home page
    localStorage.removeItem("token");
    navigate("/");
  };

  const menuItems = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "user-management",
      icon: <TeamOutlined />,
      label: "Quản Lý User",
    },
    {
      key: "create-account",
      icon: <PlusOutlined />,
      label: "Tạo Tài Khoản",
    },
  ];
  const [infoUser, setInfoUser] = useState();
  useEffect(() => {
    if (!token) return;
    authService
      .getMyInfo(token.token)
      .then((res) => {
        setInfoUser(res.data.result);
      })
      .catch((err) => {});
  }, [token]);

  const getCustomInfo = () => {
    if (infoUser) {
      return <Avatar>{infoUser.username}</Avatar>;
    }
  };

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      theme="dark"
      width={250}
      trigger={null}
      style={{
        position: "fixed",
        height: "100vh",
        left: 0,
        top: 0,
        zIndex: 1000,
        overflow: "auto",
      }}
    >
      <div className="flex items-center justify-center py-4">
        <Title level={3} style={{ color: "white", margin: 0 }}>
          {collapsed ? "A" : "ADMIN"}
        </Title>
      </div>

      <div className="flex flex-col items-center py-4 border-b border-gray-600">
        <nav>{getCustomInfo()}</nav>
        {!collapsed && (
          <div className="text-center mt-2">
            <Text style={{ color: "white" }}>Admin User</Text>
            <br />
            <Text style={{ color: "#8c8c8c" }}>VP Admin</Text>
          </div>
        )}
      </div>

      <Menu
        theme="dark"
        selectedKeys={[selectedMenu]}
        mode="inline"
        style={{ borderRight: 0, marginTop: 16 }}
        onClick={({ key }) => onMenuSelect(key)}
        items={menuItems}
      />

      {/* Nút về trang chủ */}
      <div className="px-4 mt-4">
        <Button
          type="default"
          icon={<HomeOutlined />}
          style={{ width: "100%", height: "30px" }}
          onClick={() => navigate("/")}
        >
          {!collapsed && "Về Trang Chủ"}
        </Button>
      </div>

      <div className="px-4 mt-4">
        <Button
          type="text"
          icon={<LogoutOutlined />}
          style={{
            color: "white",
            width: "100%",
            backgroundColor: "#ff4d4f",
            borderColor: "#ff4d4f",
            height: "30px",
          }}
          onClick={handleLogout}
        >
          {!collapsed && <span style={{ color: "#fff" }}>Đăng Xuất</span>}
        </Button>
      </div>
    </Sider>
  );
};

export default AdminSidebar;
