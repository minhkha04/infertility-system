import React from "react";
import { Card, Row, Col, Statistic, Typography } from "antd";
import { UserOutlined, TeamOutlined, SettingOutlined } from "@ant-design/icons";
import UserRoleChart from "../recharts/UserRoleChart";

const { Text } = Typography;

const AdminDashboard = () => {
  return (
    <div>
      <UserRoleChart />
    </div>
  );
};

export default AdminDashboard;
