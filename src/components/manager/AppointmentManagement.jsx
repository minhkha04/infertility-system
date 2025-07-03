import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Tag,
  Space,
  Typography,
  Spin,
  DatePicker,
  Select,
  Button,
  Input,
  notification,
  Row,
  Col,
  Statistic,
  Tabs,
  Modal,
  Descriptions,
  Timeline,
  Avatar,
  Badge,
  Tooltip,
  Divider,
  Alert,
} from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SwapOutlined,
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
  ReloadOutlined,
  SearchOutlined,
  BellOutlined,
  ScheduleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { http } from "../../service/config";
import { treatmentService } from "../../service/treatment.service";

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const AppointmentManagement = () => {
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [changeRequests, setChangeRequests] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [filteredChangeRequests, setFilteredChangeRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedChangeRequest, setSelectedChangeRequest] = useState(null);
  const [appointmentModalVisible, setAppointmentModalVisible] = useState(false);
  const [changeRequestModalVisible, setChangeRequestModalVisible] =
    useState(false);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    todayAppointments: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
    changeRequests: 0,
  });
  const [changeRequestNotes, setChangeRequestNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0); // page index (0-based)
  const [totalPages, setTotalPages] = useState(1);

  const [changeRequestPage, setChangeRequestPage] = useState(0);
  const [changeRequestTotalPages, setChangeRequestTotalPages] = useState(1);
  const [pagedChangeRequests, setPagedChangeRequests] = useState([]);
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (page = 0) => {
    try {
      setLoading(true);

      // Bước 1: Lấy tất cả appointments
      const response = await treatmentService.getAppointments({
        page: page, // API backend thường dùng 0-based
        size: 5,
      });

      const appointmentData = response?.data?.result?.content || [];
      console.log("✅ Appointments loaded:", appointmentData.length);

      // Bước 2: Lấy danh sách PENDING_CHANGE appointments
      const changeRequestsResponse = await treatmentService.getAppointments({
        status: "PENDING_CHANGE",
        page: 0,
        size: 100,
      });

      const pendingChangeAppointments =
        changeRequestsResponse?.data?.result?.content || [];
      console.log(
        "✅ PENDING_CHANGE appointments found:",
        pendingChangeAppointments.length
      );

      // Bước 3: Lấy thông tin chi tiết cho từng PENDING_CHANGE appointment
      const detailedChangeRequests = [];
      for (const appointment of pendingChangeAppointments) {
        try {
          const detailResponse = await http.get(
            `v1/appointments/${appointment.id}`
          );
          const detailData = detailResponse?.data?.result;
          if (detailData) {
            // Merge thông tin từ cả 2 API
            const mergedData = {
              ...appointment,
              ...detailData,
              customerName: detailData.customerName || appointment.customerName,
              doctorName: detailData.doctorName || appointment.doctorName,
              appointmentDate:
                detailData.appointmentDate || appointment.appointmentDate,
              shift: detailData.shift || appointment.shift,
              purpose: appointment.purpose,
              step: appointment.step,
              recordId: appointment.recordId,
              requestedDate:
                detailData.requestedDate || appointment.requestedDate,
              requestedShift:
                detailData.requestedShift || appointment.requestedShift,
            };
            detailedChangeRequests.push(mergedData);
          }
        } catch (error) {
          console.warn(
            `Failed to get details for appointment ${appointment.id}:`,
            error
          );
          // Fallback: sử dụng data từ API đầu tiên
          detailedChangeRequests.push(appointment);
        }
      }

      console.log(
        "✅ Detailed change requests loaded:",
        detailedChangeRequests.length
      );

      setAppointments(appointmentData);
      setChangeRequests(detailedChangeRequests);
      setFilteredAppointments(appointmentData);
      setFilteredChangeRequests(detailedChangeRequests);
      setTotalPages(response?.data?.result?.totalPages);
      setCurrentPage(page);

      // Calculate statistics
      const today = dayjs().format("YYYY-MM-DD");
      const todayAppointments = appointmentData.filter(
        (apt) => apt.appointmentDate === today
      );

      setStats({
        totalAppointments: appointmentData.length,
        todayAppointments: todayAppointments.length,
        pendingAppointments: appointmentData.filter(
          (apt) => apt.status === "PENDING" || apt.status === "CONFIRMED"
        ).length,
        completedAppointments: appointmentData.filter(
          (apt) => apt.status === "COMPLETED"
        ).length,
        changeRequests: detailedChangeRequests.length,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      notification.error({
        message: "Lỗi",
        description:
          "Không thể tải dữ liệu. Vui lòng kiểm tra kết nối và thử lại.",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchChangeRequests = async () => {
    // Không cần gọi API riêng nữa vì đã xử lý trong fetchData
    // Chỉ cần cập nhật filtered data
    setFilteredChangeRequests(changeRequests);
  };

  useEffect(() => {
    if (appointments.length > 0) fetchChangeRequests();
  }, [appointments]);

  const handleChangeRequestAction = async (status) => {
    if (!changeRequestNotes || !changeRequestNotes.trim()) {
      notification.error({ message: "Vui lòng nhập ghi chú!" });
      return;
    }
    setActionLoading(true);
    try {
      await treatmentService.confirmAppointmentChange(
        selectedChangeRequest.id,
        { status: status, note: changeRequestNotes }
      );
      notification.success({
        message:
          status === "CONFIRMED" ? "Đã duyệt yêu cầu!" : "Đã từ chối yêu cầu!",
        description: `Yêu cầu thay đổi lịch hẹn của ${
          selectedChangeRequest.customerName
        } đã được ${status === "CONFIRMED" ? "duyệt" : "từ chối"} thành công.`,
      });
      setChangeRequestModalVisible(false);
      setChangeRequestNotes("");
      await fetchData();
    } catch (err) {
      notification.error({
        message: "Không thể cập nhật yêu cầu!",
        description:
          err?.response?.data?.message || err?.message || "Lỗi không xác định.",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "orange";
      case "CONFIRMED":
        return "blue";
      case "CANCELLED":
        return "red";
      case "COMPLETED":
        return "green";
      case "PENDING_CHANGE":
        return "gold";
      case "REJECTED_CHANGE":
        return "volcano";
      case "REJECTED":
        return "volcano";
      default:
        return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "PENDING":
        return "Chờ xác nhận";
      case "CONFIRMED":
        return "Đã xác nhận";
      case "CANCELLED":
        return "Đã hủy";
      case "COMPLETED":
        return "Hoàn thành";
      case "PENDING_CHANGE":
        return "Chờ duyệt đổi lịch";
      case "REJECTED_CHANGE":
        return "Từ chối đổi lịch";
      case "REJECTED":
        return "Đã từ chối";
      default:
        return status;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircleOutlined style={{ color: "#52c41a" }} />;
      case "CONFIRMED":
        return <ScheduleOutlined style={{ color: "#1890ff" }} />;
      case "PENDING":
        return <ClockCircleOutlined style={{ color: "#faad14" }} />;
      case "PENDING_CHANGE":
        return <SwapOutlined style={{ color: "#faad14" }} />;
      case "CANCELLED":
        return <CloseOutlined style={{ color: "#ff4d4f" }} />;
      default:
        return <ClockCircleOutlined style={{ color: "#d9d9d9" }} />;
    }
  };

  const showAppointmentDetail = (appointment) => {
    setSelectedAppointment(appointment);
    setAppointmentModalVisible(true);
  };

  const showChangeRequestDetail = (request) => {
    setSelectedChangeRequest(request);
    setChangeRequestModalVisible(true);
  };

  const filterAppointments = () => {
    let filtered = [...appointments];

    if (searchText) {
      const lower = searchText.toLowerCase();
      filtered = filtered.filter(
        (apt) =>
          apt.customerName?.toLowerCase().includes(lower) ||
          apt.doctorName?.toLowerCase().includes(lower) ||
          apt.purpose?.toLowerCase().includes(lower)
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((apt) => apt.status === statusFilter);
    }

    if (dateFilter) {
      filtered = filtered.filter((apt) =>
        dayjs(apt.appointmentDate).isSame(dateFilter, "day")
      );
    }

    setFilteredAppointments(filtered);
  };

  const filterChangeRequests = () => {
    let filtered = [...changeRequests];

    if (searchText) {
      const lower = searchText.toLowerCase();
      filtered = filtered.filter(
        (req) =>
          req.customerName?.toLowerCase().includes(lower) ||
          req.doctorName?.toLowerCase().includes(lower)
      );
    }

    setFilteredChangeRequests(filtered);
  };

  useEffect(() => {
    filterAppointments();
  }, [appointments, searchText, statusFilter, dateFilter]);

  useEffect(() => {
    filterChangeRequests();
  }, [changeRequests, searchText]);

  const appointmentColumns = [
    {
      title: "Bệnh nhân",
      dataIndex: "customerName",
      key: "customerName",
      render: (name, record) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          <div>
            <Text strong>{name}</Text>
            {record.customerPhone && (
              <>
                <br />
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  {record.customerPhone}
                </Text>
              </>
            )}
          </div>
        </Space>
      ),
    },
    {
      title: "Bác sĩ",
      dataIndex: "doctorName",
      key: "doctorName",
      render: (name) => (
        <Space>
          <Text>{name}</Text>
        </Space>
      ),
    },
    {
      title: "Ngày hẹn",
      dataIndex: "appointmentDate",
      key: "appointmentDate",
      render: (date) => (
        <Space direction="vertical" size="small">
          <Text strong>{dayjs(date).format("DD/MM/YYYY")}</Text>
        </Space>
      ),
    },
    {
      title: "Ca khám",
      dataIndex: "shift",
      key: "shift",
      render: (shift) => (
        <Tag color="cyan" icon={<ScheduleOutlined />}>
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
      render: (status) => (
        <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => showAppointmentDetail(record)}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  const changeRequestColumns = [
    {
      title: "Bệnh nhân",
      dataIndex: "customerName",
      key: "customerName",
      render: (name, record) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          <div>
            <Text strong>{name}</Text>
            {record.customerEmail && (
              <>
                <br />
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  {record.customerEmail}
                </Text>
              </>
            )}
          </div>
        </Space>
      ),
    },
    {
      title: "Bác sĩ",
      dataIndex: "doctorName",
      key: "doctorName",
      render: (name, record) => (
        <Space>
          <UserOutlined style={{ color: "#722ed1" }} />
          <div>
            <Text>{name}</Text>
            {record.doctorEmail && (
              <>
                <br />
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  {record.doctorEmail}
                </Text>
              </>
            )}
          </div>
        </Space>
      ),
    },
    {
      title: "Lịch hiện tại",
      key: "currentSchedule",
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Text strong>
            {dayjs(record.appointmentDate).format("DD/MM/YYYY")}
          </Text>
          <Tag color="blue">
            {record.shift === "MORNING" ? "Sáng" : "Chiều"}
          </Tag>
        </Space>
      ),
    },
    {
      title: "Ngày yêu cầu",
      dataIndex: "requestedDate",
      key: "requestedDate",
      render: (t) =>
        t ? (
          <Text strong style={{ color: "#faad14" }}>
            {dayjs(t).format("DD/MM/YYYY")}
          </Text>
        ) : (
          <Text type="secondary">Chưa có thông tin</Text>
        ),
    },
    {
      title: "Ca yêu cầu",
      dataIndex: "requestedShift",
      key: "requestedShift",
      render: (s) =>
        s === "MORNING"
          ? "Sáng"
          : s === "AFTERNOON"
          ? "Chiều"
          : s || <Text type="secondary">Chưa có thông tin</Text>,
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => showChangeRequestDetail(record)}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  // Tabs items for Antd 5+
  const tabItems = [
    {
      key: "appointments",
      label: (
        <span>
          <CalendarOutlined />
          Lịch hẹn ({filteredAppointments.length})
        </span>
      ),
      children: (
        <>
          {/* Filters */}
          <Card
            size="small"
            style={{ marginBottom: 16, background: "#fafafa" }}
          >
            <Row gutter={16} align="middle">
              <Col span={6}>
                <Input.Search
                  placeholder="Tìm kiếm bệnh nhân, bác sĩ..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  prefix={<SearchOutlined />}
                />
              </Col>
              <Col span={4}>
                <Select
                  placeholder="Trạng thái"
                  value={statusFilter}
                  onChange={setStatusFilter}
                  style={{ width: "100%" }}
                  options={[
                    { value: "all", label: "Tất cả" },
                    { value: "PENDING", label: "Chờ xác nhận" },
                    { value: "CONFIRMED", label: "Đã xác nhận" },
                    { value: "COMPLETED", label: "Hoàn thành" },
                    { value: "CANCELLED", label: "Đã hủy" },
                    { value: "PENDING_CHANGE", label: "Chờ đổi lịch" },
                  ]}
                />
              </Col>
              <Col span={4}>
                <DatePicker
                  placeholder="Chọn ngày"
                  value={dateFilter}
                  onChange={setDateFilter}
                  style={{ width: "100%" }}
                />
              </Col>
              <Col span={4}>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => {
                    setSearchText("");
                    setStatusFilter("all");
                    setDateFilter(null);
                  }}
                >
                  Đặt lại
                </Button>
              </Col>
            </Row>
          </Card>

          <Spin spinning={loading}>
            <Table
              pagination={false}
              columns={appointmentColumns}
              dataSource={filteredAppointments}
              rowKey="id"
              locale={{
                emptyText: loading
                  ? ""
                  : "Không có lịch hẹn nào phù hợp hoặc dữ liệu chưa sẵn sàng.",
              }}
            />
            {/* Pagination buttons giống feedback */}
            <div className="flex justify-end mt-4">
              <Button
                disabled={currentPage === 0}
                onClick={() => fetchData(currentPage - 1)}
                className="mr-2"
              >
                Trang trước
              </Button>
              <span className="px-4 py-1 bg-gray-100 rounded text-sm">
                Trang {currentPage + 1} / {totalPages}
              </span>
              <Button
                disabled={currentPage + 1 >= totalPages}
                onClick={() => fetchData(currentPage + 1)}
                className="ml-2"
              >
                Trang tiếp
              </Button>
            </div>
          </Spin>
        </>
      ),
    },
    {
      key: "changeRequests",
      label: (
        <span>
          <SwapOutlined />
          Yêu cầu thay đổi lịch hẹn
          {stats.changeRequests > 0 && (
            <Badge count={stats.changeRequests} style={{ marginLeft: 8 }} />
          )}
        </span>
      ),
      children: (
        <>
          {stats.changeRequests > 0 && (
            <Alert
              message={`Có ${stats.changeRequests} yêu cầu thay đổi lịch hẹn cần xử lý`}
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          <Spin spinning={loading}>
            <Table
              columns={changeRequestColumns}
              pagination={false}
              dataSource={filteredChangeRequests}
              rowKey="id"
              locale={{
                emptyText: loading
                  ? ""
                  : "Không có yêu cầu thay đổi lịch hẹn nào hoặc dữ liệu chưa sẵn sàng.",
              }}
            />
          </Spin>
        </>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px", background: "#f5f5f5", minHeight: "100vh" }}>
      {/* Statistics */}
      <Row gutter={24} style={{ marginBottom: 24 }}>
        <Col span={4}>
          <Card
            style={{
              borderRadius: 12,
              boxShadow: "0 2px 8px rgba(24,144,255,0.08)",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            }}
            styles={{ body: { padding: "20px" } }}
          >
            <Statistic
              title={
                <span style={{ color: "white", fontWeight: 600 }}>
                  Tổng lịch hẹn
                </span>
              }
              value={stats.totalAppointments}
              prefix={<CalendarOutlined style={{ color: "white" }} />}
              valueStyle={{ color: "white", fontSize: 28 }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card
            style={{
              borderRadius: 12,
              boxShadow: "0 2px 8px rgba(52,201,58,0.08)",
              background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
            }}
            styles={{ body: { padding: "20px" } }}
          >
            <Statistic
              title={
                <span style={{ color: "white", fontWeight: 600 }}>Hôm nay</span>
              }
              value={stats.todayAppointments}
              prefix={<ScheduleOutlined style={{ color: "white" }} />}
              valueStyle={{ color: "white", fontSize: 28 }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card
            style={{
              borderRadius: 12,
              boxShadow: "0 2px 8px rgba(250,173,20,0.08)",
              background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
            }}
            styles={{ body: { padding: "20px" } }}
          >
            <Statistic
              title={
                <span style={{ color: "white", fontWeight: 600 }}>
                  Chờ xử lý
                </span>
              }
              value={stats.pendingAppointments}
              prefix={<ClockCircleOutlined style={{ color: "white" }} />}
              valueStyle={{ color: "white", fontSize: 28 }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card
            style={{
              borderRadius: 12,
              boxShadow: "0 2px 8px rgba(82,196,26,0.08)",
              background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
            }}
            styles={{ body: { padding: "20px" } }}
          >
            <Statistic
              title={
                <span style={{ color: "white", fontWeight: 600 }}>
                  Hoàn thành
                </span>
              }
              value={stats.completedAppointments}
              prefix={<CheckCircleOutlined style={{ color: "white" }} />}
              valueStyle={{ color: "white", fontSize: 28 }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card
            style={{
              borderRadius: 12,
              boxShadow: "0 2px 8px rgba(250,173,20,0.08)",
              background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
            }}
            styles={{ body: { padding: "20px" } }}
          >
            <Statistic
              title={
                <span style={{ color: "white", fontWeight: 600 }}>
                  Yêu cầu thay đổi
                </span>
              }
              value={stats.changeRequests}
              prefix={<SwapOutlined style={{ color: "white" }} />}
              valueStyle={{ color: "white", fontSize: 28 }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card
            style={{
              borderRadius: 12,
              boxShadow: "0 2px 8px rgba(24,144,255,0.08)",
              background: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
            }}
            styles={{ body: { padding: "20px" } }}
          >
            <Button
              type="primary"
              size="large"
              icon={<ReloadOutlined />}
              onClick={fetchData}
              style={{ width: "100%", height: "60px", borderRadius: "8px" }}
            >
              Làm mới
            </Button>
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Card
        style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
      >
        <Tabs defaultActiveKey="appointments" size="large" items={tabItems} />
      </Card>

      {/* Appointment Detail Modal */}
      <Modal
        title="Chi tiết lịch hẹn"
        open={appointmentModalVisible}
        onCancel={() => setAppointmentModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedAppointment && (
          <Descriptions column={2} bordered>
            <Descriptions.Item label="Bệnh nhân" span={2}>
              <Space>
                <Avatar icon={<UserOutlined />} />
                <div>
                  <Text strong>{selectedAppointment.customerName}</Text>
                  {selectedAppointment.customerPhone && (
                    <>
                      <br />
                      <Text type="secondary">
                        {selectedAppointment.customerPhone}
                      </Text>
                    </>
                  )}
                </div>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Bác sĩ">
              <Text>{selectedAppointment.doctorName}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày hẹn">
              <Text>
                {dayjs(selectedAppointment.appointmentDate).format(
                  "DD/MM/YYYY"
                )}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Ca khám">
              <Tag color="cyan">
                {selectedAppointment.shift === "MORNING" ? "Sáng" : "Chiều"}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={getStatusColor(selectedAppointment.status)}>
                {getStatusText(selectedAppointment.status)}
              </Tag>
            </Descriptions.Item>
            {selectedAppointment.step && (
              <Descriptions.Item label="Bước điều trị" span={2}>
                <Text>{selectedAppointment.step}</Text>
              </Descriptions.Item>
            )}
            {selectedAppointment.notes && (
              <Descriptions.Item label="Ghi chú" span={2}>
                <Text>{selectedAppointment.notes}</Text>
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>

      {/* Change Request Detail Modal */}
      <Modal
        title="Chi tiết yêu cầu thay đổi lịch hẹn"
        open={changeRequestModalVisible}
        onCancel={() => setChangeRequestModalVisible(false)}
        footer={null}
        width={700}
      >
        {selectedChangeRequest && (
          <div>
            <Descriptions column={2} bordered style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Bệnh nhân" span={2}>
                <Space>
                  <Avatar icon={<UserOutlined />} />
                  <div>
                    <Text strong>{selectedChangeRequest.customerName}</Text>
                    {selectedChangeRequest.customerEmail && (
                      <>
                        <br />
                        <Text type="secondary">
                          {selectedChangeRequest.customerEmail}
                        </Text>
                      </>
                    )}
                  </div>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Bác sĩ" span={2}>
                <Space>
                  <UserOutlined style={{ color: "#722ed1" }} />
                  <div>
                    <Text>{selectedChangeRequest.doctorName}</Text>
                    {selectedChangeRequest.doctorEmail && (
                      <>
                        <br />
                        <Text type="secondary">
                          {selectedChangeRequest.doctorEmail}
                        </Text>
                      </>
                    )}
                  </div>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Bước điều trị">
                <Text>{selectedChangeRequest.step}</Text>
              </Descriptions.Item>
            </Descriptions>
            <Timeline>
              <Timeline.Item color="blue">
                <Card size="small" title="Thông tin hiện tại">
                  <Row gutter={16}>
                    <Col span={12}>
                      <Text strong>Ngày hiện tại:</Text>
                      <br />
                      <Text>
                        {selectedChangeRequest.appointmentDate ? (
                          dayjs(selectedChangeRequest.appointmentDate).format(
                            "DD/MM/YYYY"
                          )
                        ) : (
                          <Text type="secondary">Chưa có thông tin</Text>
                        )}
                      </Text>
                    </Col>
                    <Col span={12}>
                      <Text strong>Ca hiện tại:</Text>
                      <br />
                      <Tag color="blue">
                        {selectedChangeRequest.shift === "MORNING"
                          ? "Sáng"
                          : selectedChangeRequest.shift === "AFTERNOON"
                          ? "Chiều"
                          : selectedChangeRequest.shift}
                      </Tag>
                    </Col>
                  </Row>
                </Card>
              </Timeline.Item>
              <Timeline.Item color="orange">
                <Card size="small" title="Yêu cầu thay đổi">
                  <Row gutter={16}>
                    <Col span={12}>
                      <Text strong>Ngày yêu cầu:</Text>
                      <br />
                      {selectedChangeRequest.requestedDate ? (
                        <Text style={{ color: "#faad14" }}>
                          {dayjs(selectedChangeRequest.requestedDate).format(
                            "DD/MM/YYYY"
                          )}
                        </Text>
                      ) : (
                        <Text type="secondary">Chưa có thông tin</Text>
                      )}
                    </Col>
                    <Col span={12}>
                      <Text strong>Ca yêu cầu:</Text>
                      <br />
                      {selectedChangeRequest.requestedShift ? (
                        <Tag color="gold">
                          {selectedChangeRequest.requestedShift === "MORNING"
                            ? "Sáng"
                            : selectedChangeRequest.requestedShift ===
                              "AFTERNOON"
                            ? "Chiều"
                            : selectedChangeRequest.requestedShift}
                        </Tag>
                      ) : (
                        <Text type="secondary">Chưa có thông tin</Text>
                      )}
                    </Col>
                  </Row>
                </Card>
              </Timeline.Item>
            </Timeline>
            {selectedChangeRequest.notes && (
              <>
                <Divider />
                <Card size="small" title="Ghi chú">
                  <Text>{selectedChangeRequest.notes}</Text>
                </Card>
              </>
            )}
            <Divider />
            <div style={{ marginBottom: 16 }}>
              <Text strong>Ghi chú xử lý:</Text>
              <Input.TextArea
                rows={3}
                value={changeRequestNotes}
                onChange={(e) => setChangeRequestNotes(e.target.value)}
                placeholder="Nhập ghi chú bắt buộc"
                style={{ marginTop: 8 }}
              />
            </div>
            <Space style={{ width: "100%", justifyContent: "center" }}>
              <Button
                type="primary"
                size="large"
                icon={<CheckOutlined />}
                loading={actionLoading}
                onClick={() => handleChangeRequestAction("CONFIRMED")}
                style={{ minWidth: 120 }}
              >
                Duyệt yêu cầu
              </Button>
              <Button
                danger
                size="large"
                icon={<CloseOutlined />}
                loading={actionLoading}
                onClick={() => handleChangeRequestAction("REJECTED")}
                style={{ minWidth: 120 }}
              >
                Từ chối yêu cầu
              </Button>
            </Space>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AppointmentManagement;
