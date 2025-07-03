import React, { useEffect, useState } from "react";
import {
  Menu,
  Avatar,
  Typography,
  Divider,
  Button,
  Spin,
  Dropdown,
} from "antd";
import { Link, useNavigate } from "react-router-dom";
import { path } from "../../common/path";
import {
  DashboardOutlined,
  TeamOutlined,
  FileTextOutlined,
  UserOutlined,
  CalendarOutlined,
  MedicineBoxOutlined,
  HomeOutlined,
  EditOutlined,
  ReadOutlined,
  ClockCircleOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { authService } from "../../service/auth.service";
import { useSelector } from "react-redux";

const { Text } = Typography;

const DoctorSidebar = ({
  selectedMenuItem,
  setSelectedMenuItem,
  collapsed,
}) => {
  const menuItems = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
      title: "Xem tổng quan và lịch hôm nay",
      path: path.doctorDashboard,
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
    ,
    {
      key: "my-blogs",
      icon: <ReadOutlined />,
      label: "Bài viết của tôi",
      title: "Xem và quản lý bài viết của bạn",
      path: "/doctor-dashboard/my-blogs",
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
      path: "/doctor-dashboard/change-requests",
    },
  ];
  const token = useSelector((state) => state.authSlice);

  const navigate = useNavigate();
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

  const handleLogout = () => {
    // Clear token and redirect to home page
    localStorage.removeItem("token");
    navigate("/");
  };

  const checkLogin = () => {
    if (infoUser) {
      return (
        <div className="flex items-center gap-2 select-none cursor-pointer ">
          <Avatar
            className="w-12 h-12 rounded-full justify-center text-white font-bold hover:border-4 hover:border-orange-400 transition-all duration-300"
            src={infoUser.avatarUrl || undefined}
          ></Avatar>
          <span className="text-sm font-medium text-white">
            {infoUser.fullName}
          </span>
        </div>
      );
    }
  };

  return (
    <div
      style={{
        background: "#001529",
        color: "#fff",
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        zIndex: 1000,
        width: collapsed ? 80 : 250,
        overflow: "auto",
        transition: "width 0.2s",
      }}
    >
      {/* Doctor Info */}
      <div className="p-4 text-center">{checkLogin()}</div>

      {/* Menu */}
      <Menu
        mode="inline"
        selectedKeys={[selectedMenuItem]}
        theme="dark"
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
            <span
              onClick={() => {
                if (item.path) navigate(item.path);
                setSelectedMenuItem(item.key);
              }}
              title={collapsed ? item.title : ""}
              style={{ color: "#fff", cursor: "pointer" }}
            >
              {item.label}
            </span>
          ),
        }))}
      />

      {/* Nút về trang chủ */}
      <div className="px-4 mt-4">
        <Button
          type="default"
          icon={<HomeOutlined />}
          style={{
            width: "100%",
            color: "#001529",
            background: "#fff",
            border: "none",
            height: "30px",
          }}
          onClick={() => navigate("/")}
        >
          {!collapsed && <span style={{ marginLeft: 8 }}>Về Trang Chủ</span>}
        </Button>
      </div>

      {/* Nút đăng xuất */}
      <div className="px-4 mt-2">
        <Button
          type="default"
          icon={<LogoutOutlined />}
          danger
          style={{
            width: "100%",
            backgroundColor: "#ff4d4f",
            borderColor: "#ff4d4f",
            color: "#fff",
            height: "40px",
          }}
          onClick={handleLogout}
        >
          {!collapsed && (
            <span style={{ marginLeft: 8, color: "#fff" }}>Đăng Xuất</span>
          )}
        </Button>
      </div>

      {/* Footer */}
      {!collapsed && (
        <div
          style={{
            position: "absolute",
            bottom: 16,
            left: 24,
            right: 24,
            textAlign: "center",
            color: "#bfbfbf",
          }}
        >
          <Divider style={{ margin: "8px 0", borderColor: "#222" }} />
        </div>
      )}
    </div>
  );
};

export default DoctorSidebar;
