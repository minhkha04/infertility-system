import React, { useContext, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { path } from "../common/path";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, Dropdown, Menu } from "antd";
import { NotificationContext } from "../App";
import { authService } from "../service/auth.service";
import { LogoutOutlined, DashboardOutlined } from "@ant-design/icons";
import { clearAuth, setToken } from "../redux/authSlice";

const UserHeader = () => {
  // ===== REDUX & NAVIGATION =====
  const token = useSelector((state) => state.authSlice); // Token từ Redux store
  const location = useLocation(); // Current location
  const navigate = useNavigate(); // Hook điều hướng
  const dispatch = useDispatch(); // Redux dispatch

  // ===== STATE MANAGEMENT =====
  const [infoUser, setInfoUser] = useState(); // Thông tin user hiện tại

  // ===== CONTEXT =====
  const { showNotification } = useContext(NotificationContext); // Context hiển thị thông báo

  // ===== USEEFFECT: TẢI THÔNG TIN USER =====
  // useEffect này chạy khi có token để lấy thông tin user và check profile hoàn thiện
  useEffect(() => {
    if (!token) return; // Nếu không có token thì return

    authService
      .getMyInfo(token.token) // Gọi API lấy thông tin user
      .then((res) => {
        setInfoUser(res.data.result); // Set thông tin user vào state
        console.log(res.data.result.avatarUrl);

        // Kiểm tra xem user đã cập nhật thông tin cá nhân chưa (trừ admin)
        if (
          !res.data.result.phoneNumber &&
          res.data.result.roleName.name !== "ADMIN"
        ) {
          setTimeout(() => {
            // Chuyển hướng đến trang profile tương ứng theo role
            if (res.data.result.roleName.name === "CUSTOMER") {
              navigate(path.customerProfile);
            } else if (res.data.result.roleName.name === "DOCTOR") {
              navigate(path.doctorProfile);
            } else if (res.data.result.roleName.name === "MANAGER") {
              navigate(path.managerProfile);
            }

            // Hiển thị thông báo yêu cầu cập nhật thông tin
            showNotification(
              "Bạn phải cập nhật thông tin cá nhân trước khi sử dụng các chức năng khác",
              "warning"
            );
          }, 1000);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, [token]);

  // ===== USEEFFECT: REFRESH TOKEN KHI VỪA LOGIN =====
  // useEffect này chạy để refresh token khi user vừa login
  useEffect(() => {
    const loginFlag = localStorage.getItem("loginJustNow");
    if (token?.token && loginFlag === "true") {
      checkRefreshToken(); // Refresh token
      localStorage.removeItem("loginJustNow"); // Clear flag
    }
  }, []);

  // ===== USEEFFECT: KIỂM TRA TOKEN HỢP LỆ =====
  // useEffect này chạy để kiểm tra token còn hợp lệ không
  useEffect(() => {
    if (token.token) {
      checkIntrospect(); // Validate token
    }
  }, []);

  // ===== HANDLER: MENU CLICK =====
  // Hàm xử lý khi click vào các item trong dropdown menu
  const handleMenuClick = ({ key }) => {
    if (key === "update") {
      // Chuyển hướng sang trang cập nhật thông tin (bạn có thể thay đổi đường dẫn)
      navigate(path.updataProfile);
    } else if (key === "logout") {
      // Xử lý logout
      dispatch(clearAuth()); // Clear Redux state
      localStorage.removeItem("token"); // Clear token từ localStorage
      localStorage.removeItem("userInfo"); // Clear user info từ localStorage
      setInfoUser(null); // Clear user info từ state
      navigate(path.homePage); // Chuyển hướng về trang chủ
    }
  };

  // ===== HANDLER: APPOINTMENT CLICK =====
  // Hàm xử lý khi click vào "Đăng ký khám" - chỉ customer mới được phép
  const handleAppointmentClick = (e) => {
    e.preventDefault();

    // Kiểm tra role từ localStorage
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

  // ===== DROPDOWN MENU CONFIGURATION =====
  // Cấu hình dropdown menu cho user với các dashboard links theo role
  const accountMenu = (
    <Menu onClick={handleMenuClick}>
      {/* Dashboard link cho ADMIN */}
      {infoUser && infoUser.roleName.name === "ADMIN" && (
        <Menu.Item key="admin" icon={<DashboardOutlined />}>
          <Link to={path.admin} style={{ color: "inherit" }}>
            Admin
          </Link>
        </Menu.Item>
      )}

      {/* Dashboard link cho MANAGER */}
      {infoUser && infoUser.roleName.name === "MANAGER" && (
        <Menu.Item key="manager" icon={<DashboardOutlined />}>
          <Link to={path.manager} style={{ color: "inherit" }}>
            Manager
          </Link>
        </Menu.Item>
      )}

      {/* Dashboard link cho CUSTOMER */}
      {infoUser && infoUser.roleName.name === "CUSTOMER" && (
        <Menu.Item key="customer" icon={<DashboardOutlined />}>
          <Link to={path.customer} style={{ color: "inherit" }}>
            Customer
          </Link>
        </Menu.Item>
      )}

      {/* Dashboard link cho DOCTOR */}
      {infoUser && infoUser.roleName.name === "DOCTOR" && (
        <Menu.Item key="doctor" icon={<DashboardOutlined />}>
          <Link to={path.doctor} style={{ color: "inherit" }}>
            Doctor
          </Link>
        </Menu.Item>
      )}

      {/* Logout menu item */}
      <Menu.Item key="logout" icon={<LogoutOutlined />} danger>
        Đăng xuất
      </Menu.Item>
    </Menu>
  );

  // ===== UTILITY FUNCTION: CHECK ACTIVE LINK =====
  // Hàm kiểm tra xem link có đang active không để highlight
  const isActive = (pathname) => {
    // Special case cho our staff page
    if (
      pathname === path.ourStaff &&
      (location.pathname.startsWith("/doctor/") ||
        location.pathname.startsWith("/doctors/"))
    ) {
      return true;
    }

    // Special case cho services page
    if (
      pathname === path.services &&
      location.pathname.startsWith("/service-detail/")
    ) {
      return true;
    }

    // Default check
    return (
      location.pathname === pathname ||
      location.pathname.startsWith(`${pathname}/`)
    );
  };

  // ===== USER LOGIN STATUS RENDER FUNCTION =====
  // Hàm render user login status - hiển thị avatar/name hoặc login/register buttons
  const checkUserLogin = () => {
    return infoUser ? (
      // Nếu đã login - hiển thị dropdown với avatar và name
      <Dropdown
        overlay={accountMenu}
        trigger={["click"]}
        placement="bottomRight"
      >
        <div className="flex items-center gap-2 select-none cursor-pointer ">
          <Avatar
            className="w-12 h-12 rounded-full justify-center text-white font-bold hover:border-4 hover:border-orange-400 transition-all duration-300"
            src={infoUser.avatarUrl || undefined} // Avatar URL hoặc default
          ></Avatar>
          <span className="text-sm font-medium text-gray-700">
            {infoUser.fullName}
          </span>
        </div>
      </Dropdown>
    ) : (
      // Nếu chưa login - hiển thị login/register buttons
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

  // ===== API FUNCTION: CHECK TOKEN INTROSPECT =====
  // Hàm kiểm tra token có còn hợp lệ không
  const checkIntrospect = async () => {
    const res = await authService.checkIntrospect(token.token);
    try {
      if (!res.data.result.valid) {
        // Nếu token không hợp lệ
        console.log(res);
        localStorage.removeItem("token"); // Remove token
        window.location.reload(); // Reload page
      }
    } catch (error) {}
  };

  // ===== API FUNCTION: REFRESH TOKEN =====
  // Hàm refresh token để duy trì session
  const checkRefreshToken = async () => {
    try {
      const res = await authService.refreshToken(token.token);

      if (res.data.result.token) {
        dispatch(setToken(res.data.result.token)); // Cập nhật Redux
        localStorage.setItem("token", JSON.stringify(res.data.result.token)); // Ghi đè vào localStorage
      }
    } catch (error) {
      console.error("Failed to refresh token:", error);
    }
  };

  // ===== RENDER MAIN COMPONENT =====
  return (
    <header
      style={{ borderBottom: "1px solid #f2f2f2", backgroundColor: "#FFF7ED" }}
      className="sticky top-0 bg-white z-50"
    >
      <div className="container mx-auto flex items-center justify-between py-4">
        {/* ===== LOGO AND BRAND SECTION ===== */}
        {/* Logo và tên bệnh viện - bên trái */}
        <Link to={path.homePage}>
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
        </Link>

        {/* ===== NAVIGATION MENU SECTION ===== */}
        {/* Menu navigation chính - ở giữa */}
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
            onClick={handleAppointmentClick} // Special handler with role check
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

        {/* ===== USER LOGIN SECTION ===== */}
        {/* User login/avatar hoặc login/register buttons - bên phải */}
        <div className="flex items-center">
          <div className="mr-4">{checkUserLogin()}</div>
        </div>
      </div>
    </header>
  );
};

// ===== EXPORT COMPONENT =====
export default UserHeader;
