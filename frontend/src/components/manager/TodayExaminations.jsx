import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Tag,
  Button,
  Space,
  Avatar,
  Row,
  Col,
  Statistic,
  Input,
  Select,
  Typography,
  message,
  Spin,
} from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { treatmentService } from "../../service/treatment.service";
import { useNavigate } from "react-router-dom";

const { Search } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

const TodayExaminations = () => {
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [filteredData, setFilteredData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const today = dayjs().format("YYYY-MM-DD");
        const res = await treatmentService.getAppointments({
          date: today,
          size: 100,
        });
        const data = res?.data?.result?.content || [];
        setAppointments(data);
      } catch (error) {
        message.error("Không thể tải dữ liệu lịch hẹn hôm nay!");
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    let filtered = appointments;
    if (statusFilter !== "all") {
      filtered = filtered.filter((item) => item.status === statusFilter);
    }
    if (searchText) {
      filtered = filtered.filter(
        (item) =>
          (item.customerName &&
            item.customerName
              .toLowerCase()
              .includes(searchText.toLowerCase())) ||
          (item.doctorName &&
            item.doctorName.toLowerCase().includes(searchText.toLowerCase()))
      );
    }
    setFilteredData(filtered);
  }, [statusFilter, searchText, appointments]);

  const getStatusTag = (status) => {
    const statusMap = {
      CONFIRMED: { color: "blue", text: "Đã xác nhận" },
      PENDING: { color: "orange", text: "Chờ xác nhận" },
      REJECTED_CHANGE: { color: "red", text: "Từ chối thay đổi" },
      CANCELLED: { color: "red", text: "Đã hủy" },
      COMPLETED: { color: "green", text: "Đã hoàn thành" },
      INPROGRESS: { color: "blue", text: "Đang thực hiện" },
      PENDING_CHANGE: { color: "gold", text: "Chờ duyệt đổi lịch" },
    };
    return (
      <Tag color={statusMap[status]?.color}>
        {statusMap[status]?.text || status}
      </Tag>
    );
  };

  const handleDetail = async (record) => {
    try {
      if (!record.recordId) {
        message.error("Không tìm thấy recordId cho lịch hẹn này!");
        return;
      }
      // Lấy chi tiết treatment record theo recordId
      const detailRes = await treatmentService.getTreatmentRecordById(
        record.recordId
      );
      const detail = detailRes?.data?.result;
      if (!detail) {
        message.error("Không lấy được chi tiết hồ sơ điều trị!");
        return;
      }
      navigate("/manager/treatment-stages-view", {
        state: {
          patientInfo: {
            customerId: detail.customerId,
            customerName: detail.customerName,
          },
          treatmentData: detail,
          sourcePage: "today-examinations",
          appointmentData: record,
        },
      });
    } catch (error) {
      message.error("Có lỗi xảy ra khi tìm hồ sơ điều trị!");
    }
  };

  const columns = [
    {
      title: "Bệnh nhân",
      dataIndex: "customerName",
      key: "customerName",
      render: (name, record) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <Avatar
            size={40}
            icon={<UserOutlined />}
            style={{ marginRight: 12, backgroundColor: "#1890ff" }}
          />
          <div>
            <Text strong>{name}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: "12px" }}>
              {record.customerEmail}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Bác sĩ",
      dataIndex: "doctorName",
      key: "doctorName",
      render: (name) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          <Text>{name}</Text>
        </Space>
      ),
    },
    {
      title: "Ngày hẹn",
      dataIndex: "appointmentDate",
      key: "appointmentDate",
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Ca khám",
      dataIndex: "shift",
      key: "shift",
      render: (shift) => (
        <Tag color="cyan">
          {shift === "MORNING"
            ? "Sáng"
            : shift === "AFTERNOON"
            ? "Chiều"
            : shift}
        </Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: getStatusTag,
    },
  ];

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col span={6}>
            <Search
              placeholder="Tìm kiếm bệnh nhân, bác sĩ..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<SearchOutlined />}
              allowClear
            />
          </Col>
          <Col span={4}>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: "100%" }}
            >
              <Option value="all">Tất cả</Option>
              <Option value="PENDING">Chờ xác nhận</Option>
              <Option value="CONFIRMED">Đã xác nhận</Option>
              <Option value="COMPLETED">Hoàn thành</Option>
              <Option value="CANCELLED">Đã hủy</Option>
              <Option value="PENDING_CHANGE">Chờ đổi lịch</Option>
            </Select>
          </Col>
        </Row>
      </Card>
      <Spin spinning={loading} tip="Đang tải...">
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Spin>
    </div>
  );
};

export default TodayExaminations;
