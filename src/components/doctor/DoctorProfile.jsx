import React, { useState } from "react";
import {
  Card,
  Row,
  Col,
  Avatar,
  Button,
  Descriptions,
  Form,
  Input,
  Upload,
  Modal,
  Typography,
  Divider,
  Badge,
  Tag,
  Timeline,
  Progress,
  Statistic,
  Select,
  DatePicker,
  Switch,
} from "antd";
import {
  UserOutlined,
  EditOutlined,
  CameraOutlined,
  SaveOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  TrophyOutlined,
  BookOutlined,
  CalendarOutlined,
  MedicineBoxOutlined,
  TeamOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import ProfileUpdate from "../../pages/ProfileUpdate";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const DoctorProfile = () => {
  return (
    <div>
      <ProfileUpdate />
    </div>
  );
};

export default DoctorProfile;
