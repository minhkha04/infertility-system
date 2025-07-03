import React, { useEffect, useState } from "react";
import { Menu, Avatar, Typography, Divider, Badge, Button } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { path } from "../../common/path";
import {
  UserOutlined,
  MedicineBoxOutlined,
  CalendarOutlined,
  HeartOutlined,
  StarOutlined,
  BellOutlined,
  MessageOutlined,
  FileTextOutlined,
  CreditCardOutlined,
  LogoutOutlined,
  SettingOutlined,
  EditOutlined,
  HomeOutlined,
  ReadOutlined,
} from "@ant-design/icons";
import { authService } from "../../service/auth.service";
import { useSelector } from "react-redux";

const { Text } = Typography;

const CustomerSidebar = ({
  selectedMenuItem,
  setSelectedMenuItem,
  collapsed,
}) => {
  const [userName, setUserName] = useState("");
  const menuItems = [
    {
      key: "services",
      icon: <MedicineBoxOutlined />,
      label: "Dịch Vụ",
      title: "Xem dịch vụ đã đăng ký",
      path: path.customerServices,
    },
    {
      key: "appointments",
      icon: <CalendarOutlined />,
      label: "Lịch Hẹn",
      title: "Quản lý lịch hẹn khám",
      path: path.customerAppointments,
    },
    {
      key: "treatment",
      icon: <HeartOutlined />,
      label: "Điều Trị",
      title: "Theo dõi lịch trình điều trị",
      path: path.customerTreatment,
    },

    {
      key: "my-blogs",
      icon: <ReadOutlined />,
      label: "Bài viết của tôi",
      title: "Xem và quản lý bài viết của bạn",
      path: "/customer-dashboard/my-blogs",
    },

    {
      key: "feedback",
      icon: <MessageOutlined />,
      label: "Phản Hồi",
      title: "Gửi phản hồi và khiếu nại",
      path: path.customerFeedback,
    },
    {
      key: "payment",
      icon: <CreditCardOutlined />,
      label: "Thanh Toán",
      title: "Quản lý thanh toán",
      path: path.customerPayment,
    },
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Hồ Sơ",
      title: "Xem thông tin cá nhân",
      path: path.customerProfile,
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

  const handleLogout = () => {
    // Clear token and redirect to home page
    localStorage.removeItem("token");
    navigate("/");
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
      {/* Customer Info */}
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
            <Link
              to={item.path}
              title={collapsed ? item.title : ""}
              style={{ color: "#fff" }}
            >
              {item.label}
            </Link>
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
            height: "30px",
            color: "#001529",
            background: "#fff",
            border: "none",
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
            height: "30px",
          }}
          onClick={handleLogout}
        >
          {!collapsed && <span style={{ marginLeft: 8, color: "#fff" }}>Đăng Xuất</span>}
        </Button>
      </div>

      {/* Footer */}
      {!collapsed && (
        <div
          style={{
            position: "absolute",
            bottom: 16,
            left: 16,
            right: 16,
            color: "#bfbfbf",
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
            Hệ thống khách hàng v1.0
          </Text>
        </div>
      )}
    </div>
  );
};

export default CustomerSidebar;
