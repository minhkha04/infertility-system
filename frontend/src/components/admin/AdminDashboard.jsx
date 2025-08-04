import React from "react";
import { Card, Row, Col, Statistic, Typography } from "antd";
import { UserOutlined, TeamOutlined, SettingOutlined } from "@ant-design/icons";
import UserRoleChart from "../recharts/UserRoleChart";

const { Text } = Typography;

const AdminDashboard = () => {
  // ===== COMPONENT MÌNH ĐẠO =====
  // AdminDashboard component - Trang chủ admin đơn giản
  // Chỉ hiển thị biểu đồ thống kê user roles
  
  return (
    <div>
      {/* ===== USER ROLE CHART ===== */}
      {/* Component chart hiển thị thống kê phân bố người dùng theo role */}
      <UserRoleChart />
    </div>
  );
};

// ===== EXPORT COMPONENT =====
export default AdminDashboard;
