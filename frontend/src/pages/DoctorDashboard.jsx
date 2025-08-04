import React, { useState, useEffect, useContext } from "react";
import { Layout, Spin, Typography } from "antd";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { path } from "../common/path";
import DoctorSidebar from "../components/doctor/DoctorSidebar";
import DashboardOverview from "../components/doctor/DashboardOverview";
import PatientList from "../components/doctor/PatientList";
import TestResults from "../components/doctor/TestResults";
import DoctorProfile from "../components/doctor/DoctorProfile";
import DoctorWorkSchedule from "../components/doctor/DoctorWorkSchedule";
import TreatmentStageDetails from "../components/doctor/TreatmentStageDetails";
import { NotificationContext } from "../App";
import { useSelector } from "react-redux";
import { authService } from "../service/auth.service";
import DoctorBlogManagement from "../components/blog/DoctorBlogManagement";
import ChangeRequests from "../components/doctor/ChangeRequests";

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

const DoctorDashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedMenuItem, setSelectedMenuItem] = useState("dashboard");
  const { showNotification } = useContext(NotificationContext);
  const token = useSelector((state) => state.authSlice);
  const [infoUser, setInfoUser] = useState();

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }
    authService
      .getMyInfo(token.token)
      .then((res) => {
        const user = res.data.result;
        if (user.roleName.name !== "DOCTOR") {
          showNotification("Bạn không có quyền truy cập trang này", "error");
          navigate("/");
          return;
        }
        setInfoUser(res.data.result);
      })
      .catch((err) => {
        navigate("/");
        console.log(err);
      });
  }, [token]);

  // Update selected menu item based on current path
  useEffect(() => {
    const pathname = location.pathname;
    if (pathname.includes("/change-requests")) {
      setSelectedMenuItem("change-requests");
    } else if (pathname.includes("/dashboard")) {
      setSelectedMenuItem("dashboard");
    } else if (pathname.includes("/patients")) {
      setSelectedMenuItem("patients");
    } else if (pathname.includes("/treatment-stages")) {
      // Check if we came from test-results or patients page using location state
      const sourcePage = location.state?.sourcePage;
      if (sourcePage === "test-results" || sourcePage === "patients") {
        setSelectedMenuItem("test-results");
      } else {
        setSelectedMenuItem("patients");
      }
    } else if (pathname.includes("/test-results")) {
      setSelectedMenuItem("test-results");
    } else if (pathname.includes("/create-blog")) {
      setSelectedMenuItem("create-blog");
    } else if (pathname.includes("/my-blogs")) {
      setSelectedMenuItem("my-blogs");
    } else if (pathname.includes("/profile")) {
      setSelectedMenuItem("profile");
    } else {
      // if (pathname === "/doctor-dashboard") {
      // navigate(path.pageNotFound);
      // }
    }
  }, [location, navigate]);

  const getPageTitle = () => {
    switch (selectedMenuItem) {
      case "dashboard":
        return "Dashboard Bác Sĩ";
      case "patients":
        return "Danh Sách Bệnh Nhân";
      case "test-results":
        return "Quản lí hồ sơ bệnh nhân ";
      case "create-blog":
        return "Tạo Bài Viết Mới";
      case "my-blogs":
        return "Bài Viết Của Tôi";
      case "profile":
        return "Hồ Sơ Bác Sĩ";
      case "treatment-stages":
        return "Chi Tiết Giai Đoạn Điều Trị";
      case "change-requests":
        return "Quản Lý Yêu Cầu Thay Đổi";
      default:
        return "Dashboard Bác Sĩ";
    }
  };

  useEffect(() => {
    if (token?.token) {
      checkIntrospect();
    }
  }, [token]);

  // check hiệu lực token
  const checkIntrospect = async () => {
    await authService
      .checkIntrospect(token.token)
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        if (err.response.data.code == 1006) {
          localStorage.removeItem("token");
          window.location.reload();
        }
      });
  };

  if (!infoUser) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme="light"
        width={250}
      >
        <DoctorSidebar
          selectedMenuItem={selectedMenuItem}
          setSelectedMenuItem={setSelectedMenuItem}
          collapsed={collapsed}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            background: "white",
            padding: "0 24px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Title level={3} style={{ margin: 0, color: "#1890ff" }}>
            {getPageTitle()}
          </Title>
        </Header>

        <Content
          style={{
            background: "white",
            minHeight: "calc(100vh - 112px)",
            padding: "0 24px",
          }}
        >
          <Routes>
            <Route index element={<DashboardOverview />} />
            <Route path="dashboard" element={<DashboardOverview />} />
            <Route path="patients" element={<PatientList />} />
            <Route path="test-results" element={<TestResults />} />
            <Route path="profile" element={<DoctorProfile />} />
            <Route
              path="treatment-stages"
              element={<TreatmentStageDetails />}
            />
            <Route path="my-blogs" element={<DoctorBlogManagement />} />
            <Route
              path="treatment-stages"
              element={<TreatmentStageDetails />}
            />
            <Route path="change-requests" element={<ChangeRequests />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};

export default DoctorDashboard;
