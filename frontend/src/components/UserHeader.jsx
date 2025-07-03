import React, { useContext, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { path } from "../common/path";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, Button, Dropdown, Menu } from "antd";
import { NotificationContext } from "../App";
import { authService } from "../service/auth.service";
import {
  SettingOutlined,
  LogoutOutlined,
  UserOutlined,
  DashboardOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { clearAuth, setToken } from "../redux/authSlice";

const UserHeader = () => {
  const token = useSelector((state) => state.authSlice);
  const location = useLocation();
  const [infoUser, setInfoUser] = useState();
  const navigate = useNavigate();
  const { showNotification } = useContext(NotificationContext);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!token) return;

    authService
      .getMyInfo(token.token)
      .then((res) => {
        setInfoUser(res.data.result);
        console.log(res.data.result.avatarUrl);
        if (
          !res.data.result.phoneNumber &&
          res.data.result.roleName.name !== "ADMIN"
        ) {
          setTimeout(() => {
            navigate(path.updataProfile);
            showNotification(
              "You must complete your personal profile.",
              "warning"
            );
          }, 1000);
        }
      })
      .catch((err) => {});
  }, [token]);

  useEffect(() => {
    const loginFlag = localStorage.getItem("loginJustNow");
    if (token?.token && loginFlag === "true") {
      checkRefreshToken();
      localStorage.removeItem("loginJustNow");
    }
  }, []);

  useEffect(() => {
    if (token.token) {
      checkIntrospect();
    }
  }, []);

  const handleMenuClick = ({ key }) => {
    if (key === "update") {
      // Chuyển hướng sang trang cập nhật thông tin (bạn có thể thay đổi đường dẫn)
      navigate(path.updataProfile);
    } else if (key === "logout") {
      // Xử lý logout
      dispatch(clearAuth());
      localStorage.removeItem("token");
      localStorage.removeItem("userInfo"); // Xóa thông tin user
      // Clear user info immediately
      setInfoUser(null);
      // Chuyển hướng về trang chủ thay vì reload
      navigate(path.homePage);
    }
  };

  const handleAppointmentClick = (e) => {
    e.preventDefault();

    // Kiểm tra role
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    if (userInfo.roleName && userInfo.roleName.name !== "CUSTOMER") {
      showNotification(
        "Bạn không có quyền đăng ký lịch hẹn. Chỉ khách hàng mới có thể sử dụng tính năng này.",
        "error"
      );
      return;
    }

    // Nếu có quyền thì chuyển hướng
    navigate(path.appointment);
  };

  const accountMenu = (
    <Menu onClick={handleMenuClick}>
      {/* Nếu là admin thì thêm mục Admin */}
      {infoUser && infoUser.roleName.name === "ADMIN" && (
        <Menu.Item key="admin" icon={<DashboardOutlined />}>
          <Link to={path.admin} style={{ color: "inherit" }}>
            Admin
          </Link>
        </Menu.Item>
      )}
      {infoUser && infoUser.roleName.name === "MANAGER" && (
        <Menu.Item key="manager" icon={<DashboardOutlined />}>
          <Link to={path.manager} style={{ color: "inherit" }}>
            Manager
          </Link>
        </Menu.Item>
      )}
      {infoUser && infoUser.roleName.name === "CUSTOMER" && (
        <Menu.Item key="customer" icon={<DashboardOutlined />}>
          <Link to={path.customer} style={{ color: "inherit" }}>
            Customer
          </Link>
        </Menu.Item>
      )}
      {infoUser && infoUser.roleName.name === "DOCTOR" && (
        <Menu.Item key="doctor" icon={<DashboardOutlined />}>
          <Link to={path.doctor} style={{ color: "inherit" }}>
            Doctor
          </Link>
        </Menu.Item>
      )}
      <Menu.Item key="logout" icon={<LogoutOutlined />} danger>
        Đăng xuất
      </Menu.Item>
    </Menu>
  );

  const isActive = (pathname) => {
    if (
      pathname === path.ourStaff &&
      (location.pathname.startsWith("/doctor/") ||
        location.pathname.startsWith("/doctors/"))
    ) {
      return true;
    }
    if (
      pathname === path.services &&
      location.pathname.startsWith("/service-detail/")
    ) {
      return true;
    }
    return (
      location.pathname === pathname ||
      location.pathname.startsWith(`${pathname}/`)
    );
  };

  const checkUserLogin = () => {
    return infoUser ? (
      <Dropdown
        overlay={accountMenu}
        trigger={["click"]}
        placement="bottomRight"
      >
        <div className="flex items-center gap-2 select-none cursor-pointer ">
          <Avatar
            className="w-12 h-12 rounded-full justify-center text-white font-bold hover:border-4 hover:border-orange-400 transition-all duration-300"
            src={infoUser.avatarUrl || undefined}
          ></Avatar>
          <span className="text-sm font-medium text-gray-700">
            {infoUser.fullName}
          </span>
        </div>
      </Dropdown>
    ) : (
      <div className="flex gap-3">
        <Link
          to={path.testLogin}
          className="py-2 px-4 font-medium border border-orange-500 rounded-md hover:bg-orange-500 hover:text-white duration-300"
        >
          Đăng nhập
        </Link>
        <Link
          to={"/dang-nhap?mode=register"}
          className="py-2 px-4 font-medium border border-lime-300 rounded-md hover:bg-lime-300 hover:text-white duration-300"
        >
          Đăng ký
        </Link>
      </div>
    );
  };

  const checkIntrospect = async () => {
    const res = await authService.checkIntrospect(token.token);
    try {
      if (!res.data.result.valid) {
        console.log(res);
        localStorage.removeItem("token");
        window.location.reload();
      }
    } catch (error) {}
  };
  const checkRefreshToken = async () => {
    try {
      const res = await authService.refreshToken(token.token);

      if (res.data.result.token) {
        dispatch(setToken(res.data.result.token)); //  Cập nhật Redux
        localStorage.setItem("token", JSON.stringify(res.data.result.token)); //  Ghi đè vào localStorage
      }
    } catch (error) {
      console.error("Failed to refresh token:", error);
    }
  };
  return (
    <header
      style={{ borderBottom: "1px solid #f2f2f2", backgroundColor: "#FFF7ED" }}
      className="sticky top-0 bg-white z-50"
    >
      <div className="container mx-auto flex items-center justify-between py-4">
        {/* Logo and Center Name - Left */}
        <div className="flex items-center gap-3">
          <div
            className="rounded-full bg-white flex items-center justify-center w-16 h-16 overflow-hidden border-2"
            style={{ borderColor: "#FF8460" }}
          >
            <img
              src="https://res.cloudinary.com/di6hi1r0g/image/upload/v1748665959/icon_pch2gc.png"
              alt="Logo Bệnh viện Sinh sản NewLife"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-orange-300 bg-clip-text text-transparent">
              NewLife
            </div>
            <div className="text-gray-600 text-sm font-medium">
              Bệnh viện Hỗ Trợ Sinh sản
            </div>
          </div>
        </div>

        {/* Navigation Menu - Center */}
        <nav className="flex gap-8 text-xl">
          <Link
            to={path.homePage}
            onClick={() => window.scrollTo(0, 0)}
            className={`hover:text-orange-400 transition-colors ${
              isActive(path.homePage) && location.pathname === "/"
                ? "text-orange-400 font-bold text-2xl"
                : "text-gray-600"
            }`}
          >
            Trang chủ
          </Link>

          <Link
            to={path.services}
            onClick={() => window.scrollTo(0, 0)}
            className={`hover:text-orange-400 transition-colors ${
              isActive(path.services)
                ? "text-orange-400 font-bold text-2xl"
                : "text-gray-600"
            }`}
          >
            Dịch vụ
          </Link>
          <Link
            to={path.ourStaff}
            onClick={() => window.scrollTo(0, 0)}
            className={`hover:text-orange-400 transition-colors ${
              isActive(path.ourStaff)
                ? "text-orange-400 font-bold text-2xl"
                : "text-gray-600"
            }`}
          >
            Bác sĩ
          </Link>
          <Link
            to={path.blog}
            onClick={() => window.scrollTo(0, 0)}
            className={`hover:text-orange-400 transition-colors ${
              isActive(path.blog)
                ? "text-orange-400 font-bold text-2xl"
                : "text-gray-600"
            }`}
          >
            Blogs
          </Link>
          <Link
            to={path.appointment}
            onClick={handleAppointmentClick}
            className={`hover:text-orange-400 transition-colors ${
              isActive(path.appointment)
                ? "text-orange-400 font-bold text-2xl"
                : "text-gray-600"
            }`}
          >
            Đăng kí khám
          </Link>
          <Link
            to={path.contacts}
            onClick={() => window.scrollTo(0, 0)}
            className={`hover:text-orange-400 transition-colors ${
              isActive(path.contacts)
                ? "text-orange-400 font-bold text-2xl"
                : "text-gray-600"
            }`}
          >
            Liên hệ
          </Link>
        </nav>

        {/* Login/Signup or User Info - Right */}
        <div className="flex items-center">
          <div className="mr-4">{checkUserLogin()}</div>
        </div>
      </div>
    </header>
  );
};

export default UserHeader;
