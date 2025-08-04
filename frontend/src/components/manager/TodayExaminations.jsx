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
  // ===== STATE MANAGEMENT =====
  // State quản lý dữ liệu và UI
  const [loading, setLoading] = useState(true);                      // Trạng thái loading
  const [appointments, setAppointments] = useState([]);              // Danh sách appointments raw từ API
  const [searchText, setSearchText] = useState("");                  // Text tìm kiếm
  const [statusFilter, setStatusFilter] = useState("all");           // Filter theo trạng thái
  const [filteredData, setFilteredData] = useState([]);              // Dữ liệu đã được filter

  // ===== NAVIGATION =====
  const navigate = useNavigate();                                    // Hook điều hướng

  // ===== USEEFFECT: TẢI DỮ LIỆU APPOINTMENTS HÔM NAY =====
  // useEffect này chạy khi component mount để tải appointments hôm nay
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const today = dayjs().format("YYYY-MM-DD");               // Format ngày hôm nay
        
        // Gọi API lấy appointments cho ngày hôm nay
        const res = await treatmentService.getAppointments({
          date: today,                                            // Filter theo ngày hôm nay
          size: 100,                                             // Lấy tối đa 100 records
        });
        const data = res?.data?.result?.content || [];
        setAppointments(data);                                   // Set raw appointments data
      } catch (error) {
        message.error("Không thể tải dữ liệu lịch hẹn hôm nay!");
        setAppointments([]);                                     // Set empty array nếu lỗi
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ===== USEEFFECT: FILTER DỮ LIỆU =====
  // useEffect này chạy khi filter hoặc search text thay đổi
  useEffect(() => {
    let filtered = appointments;                                  // Bắt đầu với tất cả appointments
    
    // Filter theo status nếu không phải "all"
    if (statusFilter !== "all") {
      filtered = filtered.filter((item) => item.status === statusFilter);
    }
    
    // Filter theo search text (tìm trong tên bệnh nhân và bác sĩ)
    if (searchText) {
      filtered = filtered.filter(
        (item) =>
          (item.customerName &&
            item.customerName
              .toLowerCase()
              .includes(searchText.toLowerCase())) ||            // Tìm theo tên bệnh nhân
          (item.doctorName &&
            item.doctorName.toLowerCase().includes(searchText.toLowerCase()))  // Tìm theo tên bác sĩ
      );
    }
    setFilteredData(filtered);                                   // Update filtered data
  }, [statusFilter, searchText, appointments]);

  // ===== UTILITY FUNCTION: STATUS TAG =====
  // Hàm tạo Tag component với màu sắc cho các trạng thái appointment
  const getStatusTag = (status) => {
    const statusMap = {
      CONFIRMED: { color: "blue", text: "Đã xác nhận" },
      PENDING: { color: "orange", text: "Chờ xác nhận" },
      REJECTED: { color: "volcano", text: "Từ chối yêu cầu đổi lịch" },
      CANCELLED: { color: "red", text: "Đã hủy" },
      COMPLETED: { color: "green", text: "Đã hoàn thành" },
      INPROGRESS: { color: "orange", text: "Đang điều trị" },
      PENDING_CHANGE: { color: "gold", text: "Chờ duyệt đổi lịch" },
    };
    return (
      <Tag color={statusMap[status]?.color}>
        {statusMap[status]?.text || status}
      </Tag>
    );
  };

  // ===== HANDLER: XEM CHI TIẾT TREATMENT =====
  // Hàm xử lý khi click để xem chi tiết treatment của appointment
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
      
      // Navigate sang trang treatment stages view với state data
      navigate("/manager/treatment-stages-view", {
        state: {
          patientInfo: {                                         // Thông tin patient
            customerId: detail.customerId,
            customerName: detail.customerName,
          },
          treatmentData: detail,                                 // Dữ liệu treatment chi tiết
          sourcePage: "today-examinations",                     // Source page để biết đến từ đâu
          appointmentData: record,                               // Dữ liệu appointment
        },
      });
    } catch (error) {
      message.error("Có lỗi xảy ra khi tìm hồ sơ điều trị!");
    }
  };

  // ===== TABLE COLUMNS CONFIGURATION =====
  // Cấu hình các columns cho bảng danh sách appointments
  const columns = [
    {
      title: "Bệnh nhân",
      dataIndex: "customerName",
      key: "customerName",
      render: (name, record) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          {/* Avatar bệnh nhân */}
          <Avatar
            size={40}
            icon={<UserOutlined />}
            style={{ marginRight: 12, backgroundColor: "#1890ff" }}
          />
          <div>
            <Text strong>{name}</Text>                           {/* Tên bệnh nhân */}
            <br />
            <Text type="secondary" style={{ fontSize: "12px" }}>
              {record.customerEmail}                             {/* Email bệnh nhân */}
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
          <Text>{name}</Text>                                    {/* Tên bác sĩ */}
        </Space>
      ),
    },
    {
      title: "Ngày hẹn",
      dataIndex: "appointmentDate",
      key: "appointmentDate",
      render: (date) => dayjs(date).format("DD/MM/YYYY"),        // Format ngày hiển thị
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
      render: getStatusTag,                                      // Sử dụng utility function
    },
  ];

  // ===== RENDER MAIN COMPONENT =====
  return (
    <div>
      {/* ===== FILTER CONTROLS ===== */}
      {/* Card chứa search và filter controls */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          {/* Search input */}
          <Col span={6}>
            <Search
              placeholder="Tìm kiếm bệnh nhân, bác sĩ..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<SearchOutlined />}
              allowClear
            />
          </Col>
          
          {/* Status filter dropdown */}
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

      {/* ===== APPOINTMENTS TABLE ===== */}
      {/* Bảng hiển thị danh sách appointments hôm nay với loading */}
      <Spin spinning={loading} tip="Đang tải...">
        <Table
          columns={columns}                                      // Columns configuration
          dataSource={filteredData}                             // Data đã được filter
          rowKey="id"                                            // Unique key cho mỗi row
          pagination={{ pageSize: 10 }}                        // Pagination với 10 items/page
        />
      </Spin>
    </div>
  );
};

// ===== EXPORT COMPONENT =====
export default TodayExaminations;
