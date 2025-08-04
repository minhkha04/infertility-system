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
  // ===== STATE MANAGEMENT =====
  // State quản lý loading states
  const [loadingAppointments, setLoadingAppointments] = useState(false);      // Loading appointments
  const [loadingChangeRequests, setLoadingChangeRequests] = useState(false);  // Loading change requests
  
  // State quản lý data
  const [appointments, setAppointments] = useState([]);                       // Danh sách appointments
  const [changeRequests, setChangeRequests] = useState([]);                   // Danh sách yêu cầu đổi lịch
  const [filteredAppointments, setFilteredAppointments] = useState([]);       // Appointments sau khi filter
  const [filteredChangeRequests, setFilteredChangeRequests] = useState([]);   // Change requests sau khi filter
  
  // State quản lý filters
  const [statusFilter, setStatusFilter] = useState("all");                    // Filter theo trạng thái
  const [dateFilter, setDateFilter] = useState(null);                        // Filter theo ngày
  const [searchText, setSearchText] = useState("");                          // Text tìm kiếm
  
  // State quản lý modal
  const [selectedAppointment, setSelectedAppointment] = useState(null);       // Appointment được chọn trong modal
  const [selectedChangeRequest, setSelectedChangeRequest] = useState(null);   // Change request được chọn trong modal
  const [appointmentModalVisible, setAppointmentModalVisible] = useState(false); // Hiển thị modal appointment
  const [changeRequestModalVisible, setChangeRequestModalVisible] = useState(false); // Hiển thị modal change request
  
  // State quản lý statistics (unused hiện tại)
  const [stats, setStats] = useState({
    totalAppointments: 0,
    todayAppointments: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
    changeRequests: 0,
  });
  
  // State quản lý actions
  const [changeRequestNotes, setChangeRequestNotes] = useState("");          // Notes khi xử lý change request
  const [actionLoading, setActionLoading] = useState(false);                 // Loading khi xử lý action
  
  // State quản lý pagination
  const [currentPage, setCurrentPage] = useState(0);                         // Trang hiện tại cho appointments (0-based)
  const [totalPages, setTotalPages] = useState(1);                           // Tổng số trang cho appointments
  const [changeRequestPage, setChangeRequestPage] = useState(0);             // Trang hiện tại cho change requests
  const [changeRequestTotalPages, setChangeRequestTotalPages] = useState(1); // Tổng số trang cho change requests

  // ===== API FUNCTION: FETCH APPOINTMENTS =====
  // Hàm lấy danh sách appointments (không bao gồm PENDING_CHANGE)
  const fetchAppointments = async (page = 0) => {
    try {
      setLoadingAppointments(true);
      // Gọi API lấy appointments với pagination
      const response = await treatmentService.getAppointments({
        page: page,
        size: 8,
        // Nếu backend chưa hỗ trợ filter loại trừ status, phải filter ở FE:
        // status: "NOT_PENDING_CHANGE" // hoặc bỏ tham số này
      });
      const data = response?.data?.result?.content || [];
      
      // Nếu API trả về cả PENDING_CHANGE, filter ở đây để chỉ lấy appointments thường
      const appointmentsOnly = data.filter(
        (x) => x.status !== "PENDING_CHANGE"
      );
      
      setAppointments(appointmentsOnly);                               // Set raw appointments
      setFilteredAppointments(appointmentsOnly);                      // Set filtered appointments
      setCurrentPage(page);                                           // Update current page
      setTotalPages(response?.data?.result?.totalPages);              // Update total pages
    } catch (err) {
      notification.error({ message: "Lỗi khi tải lịch hẹn." });
    } finally {
      setLoadingAppointments(false);
    }
  };

  // ===== API FUNCTION: FETCH CHANGE REQUESTS =====
  // Hàm lấy danh sách change requests (chỉ status PENDING_CHANGE)
  const fetchChangeRequests = async (page = 0) => {
    try {
      setLoadingChangeRequests(true);
      // Gọi API lấy appointments với status PENDING_CHANGE
      const response = await treatmentService.getAppointments({
        status: "PENDING_CHANGE",
        page: page,
        size: 8,
      });
      const pendingChangeAppointments = response?.data?.result?.content || [];
      
      // Lấy detail từng item (có thể song song, tối ưu performance):
      const detailPromises = pendingChangeAppointments.map(
        async (appointment) => {
          try {
            // Gọi API lấy chi tiết từng appointment để có thêm thông tin
            const detail = await http.get(`v1/appointments/${appointment.id}`);
            const detailData = detail?.data?.result;
            return { ...appointment, ...detailData };              // Merge appointment với detail
          } catch (error) {
            return appointment;                                     // Fallback nếu không lấy được detail
          }
        }
      );
      const detailedChangeRequests = await Promise.all(detailPromises);

      setChangeRequests(detailedChangeRequests);                    // Set raw change requests
      setFilteredChangeRequests(detailedChangeRequests);           // Set filtered change requests
      setChangeRequestPage(page);                                  // Update current page
      setChangeRequestTotalPages(response?.data?.result?.totalPages); // Update total pages
    } catch (err) {
      notification.error({ message: "Lỗi khi tải yêu cầu đổi lịch." });
    } finally {
      setLoadingChangeRequests(false);
    }
  };

  // ===== USEEFFECT: INITIAL DATA LOAD =====
  // useEffect này chạy khi component mount để load appointments
  useEffect(() => {
    fetchAppointments();
  }, []);

  // ===== HANDLER: CHANGE REQUEST ACTION =====
  // Hàm xử lý approve/reject change request
  const handleChangeRequestAction = async (status) => {
    if (!changeRequestNotes || !changeRequestNotes.trim()) {
      notification.error({ message: "Vui lòng nhập ghi chú!" });
      return;
    }
    
    setActionLoading(true);
    try {
      // Gọi API confirm change request với status và notes
      await treatmentService.confirmAppointmentChange(
        selectedChangeRequest.id,
        { status: status, note: changeRequestNotes }
      );
      
      notification.success({
        message:
          status === "PLANED" ? "Đã duyệt yêu cầu!" : "Đã từ chối yêu cầu!",
        description: `Yêu cầu thay đổi lịch hẹn của ${
          selectedChangeRequest.customerName
        } đã được ${status === "PLANED" ? "duyệt" : "từ chối"} thành công.`,
      });
      
      setChangeRequestModalVisible(false);                         // Đóng modal
      setChangeRequestNotes("");                                   // Reset notes
      await fetchChangeRequests();                                // Refresh change requests list
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

  // ===== UTILITY FUNCTIONS: STATUS MAPPING =====
  
  // Hàm lấy màu cho status tag
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
      case "REJECTED":
        return "volcano";
      case "PLANED":
        return "orange";
      case "INPROGRESS":
        return "orange";
      default:
        return "default";
    }
  };

  // Hàm lấy text hiển thị cho status
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
      case "REJECTED":
        return "Từ chối yêu cầu thay đổi";
      case "PLANED":
        return "Đã đặt lịch";
      case "INPROGRESS":
        return "Đang điều trị";
      default:
        return status;
    }
  };

  // Hàm lấy icon cho status
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

  // ===== MODAL HANDLERS =====
  
  // Hàm hiển thị modal chi tiết appointment
  const showAppointmentDetail = (appointment) => {
    setSelectedAppointment(appointment);
    setAppointmentModalVisible(true);
  };

  // Hàm hiển thị modal chi tiết change request
  const showChangeRequestDetail = (request) => {
    setSelectedChangeRequest(request);
    setChangeRequestModalVisible(true);
  };

  // ===== FILTER FUNCTIONS =====
  
  // Hàm filter appointments theo search text, status, và date
  const filterAppointments = () => {
    let filtered = [...appointments];

    // Filter theo search text
    if (searchText) {
      const lower = searchText.toLowerCase();
      filtered = filtered.filter(
        (apt) =>
          apt.customerName?.toLowerCase().includes(lower) ||
          apt.doctorName?.toLowerCase().includes(lower) ||
          apt.purpose?.toLowerCase().includes(lower)
      );
    }

    // Filter theo status
    if (statusFilter !== "all") {
      filtered = filtered.filter((apt) => apt.status === statusFilter);
    }

    // Filter theo date
    if (dateFilter) {
      filtered = filtered.filter((apt) =>
        dayjs(apt.appointmentDate).isSame(dateFilter, "day")
      );
    }

    setFilteredAppointments(filtered);
  };

  // Hàm filter change requests theo search text
  const filterChangeRequests = () => {
    let filtered = [...changeRequests];

    // Filter theo search text
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

  // ===== USEEFFECT: AUTO FILTER =====
  // useEffect này chạy khi data hoặc filter thay đổi để auto filter

  // Auto filter appointments khi data hoặc filters thay đổi
  useEffect(() => {
    filterAppointments();
  }, [appointments, searchText, statusFilter, dateFilter]);

  // Auto filter change requests khi data hoặc search text thay đổi
  useEffect(() => {
    filterChangeRequests();
  }, [changeRequests, searchText]);

  // ===== TABLE COLUMNS CONFIGURATION =====
  
  // Cấu hình columns cho bảng appointments
  const appointmentColumns = [
    {
      title: "Bệnh nhân",
      dataIndex: "customerName",
      key: "customerName",
      render: (name, record) => (
        <Space>
          <div>
            <Text strong>{name}</Text>
            {record.customerPhone && (
              <>
                <br />
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  {record.customerPhone}                               {/* Số điện thoại bệnh nhân */}
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
          <Text strong>{dayjs(date).format("DD/MM/YYYY")}</Text>       {/* Format ngày hiển thị */}
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

  // Cấu hình columns cho bảng change requests
  const changeRequestColumns = [
    {
      title: "Bệnh nhân",
      dataIndex: "customerName",
      key: "customerName",
      render: (name, record) => (
        <Space>
          <div>
            <Text strong>{name}</Text>
            {record.customerEmail && (
              <>
                <br />
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  {record.customerEmail}                               {/* Email bệnh nhân */}
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
          <div>
            <Text>{name}</Text>
            {record.doctorEmail && (
              <>
                <br />
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  {record.doctorEmail}                                 {/* Email bác sĩ */}
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
            {dayjs(record.appointmentDate).format("DD/MM/YYYY")}       {/* Ngày hiện tại */}
          </Text>
          <Tag color="blue">
            {record.shift === "MORNING" ? "Sáng" : "Chiều"}           {/* Ca hiện tại */}
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
            {dayjs(t).format("DD/MM/YYYY")}                           {/* Ngày yêu cầu đổi */}
          </Text>
        ) : (
          <Text type="secondary">Chưa có thông tin</Text>
        ),
    },
    {
      title: "Ca yêu cầu",
      dataIndex: "requestedShift",
      key: "requestedShift",
      // Ca yêu cầu đổi - render text dựa trên shift value
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

  // ===== TABS CONFIGURATION =====
  // Cấu hình tabs items cho Antd 5+
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
          {/* ===== FILTER SECTION ===== */}
          {/* Card chứa các filter controls */}
          <Card
            size="small"
            style={{ marginBottom: 16, background: "#fafafa" }}
          >
            <Row gutter={16} align="middle">
              {/* Search input */}
              <Col span={6}>
                <Input.Search
                  placeholder="Tìm kiếm bệnh nhân, bác sĩ..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  prefix={<SearchOutlined />}
                />
              </Col>
              
              {/* Status filter */}
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
                    { value: "INPROGRESS", label: "Đang điều trị" },
                  ]}
                />
              </Col>
              
              {/* Date filter */}
              <Col span={4}>
                <DatePicker
                  placeholder="Chọn ngày"
                  value={dateFilter}
                  onChange={setDateFilter}
                  style={{ width: "100%" }}
                />
              </Col>
              
              {/* Reset button */}
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

          {/* ===== APPOINTMENTS TABLE ===== */}
          {/* Bảng hiển thị danh sách appointments với loading và pagination */}
          <Spin spinning={loadingAppointments}>
            <Table
              pagination={false}                                      // Disable built-in pagination
              columns={appointmentColumns}                            // Columns configuration
              dataSource={filteredAppointments}                      // Data đã được filter
              rowKey="id"                                             // Unique key cho mỗi row
              locale={{
                emptyText: loadingAppointments
                  ? ""
                  : "Không có lịch hẹn nào phù hợp hoặc dữ liệu chưa sẵn sàng.",
              }}
            />
            
            {/* Custom pagination controls */}
            <div className="flex justify-end mt-4">
              <Button
                disabled={currentPage === 0}                         // Disable nếu ở trang đầu
                onClick={() => fetchAppointments(currentPage - 1)}
                className="mr-2"
              >
                Trang trước
              </Button>
              <span className="px-4 py-1 bg-gray-100 rounded text-sm">
                Trang {currentPage + 1} / {totalPages}
              </span>
              <Button
                disabled={currentPage + 1 >= totalPages}             // Disable nếu ở trang cuối
                onClick={() => fetchAppointments(currentPage + 1)}
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
          {/* Alert thông báo số lượng change requests cần xử lý */}
          {stats.changeRequests > 0 && (
            <Alert
              message={`Có ${stats.changeRequests} yêu cầu thay đổi lịch hẹn cần xử lý`}
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          {/* ===== CHANGE REQUESTS TABLE ===== */}
          {/* Bảng hiển thị danh sách change requests với loading và pagination */}
          <Spin spinning={loadingChangeRequests}>
            <Table
              columns={changeRequestColumns}                         // Columns configuration
              pagination={false}                                     // Disable built-in pagination
              dataSource={filteredChangeRequests}                   // Data đã được filter
              rowKey="id"                                            // Unique key cho mỗi row
              locale={{
                emptyText: loadingChangeRequests
                  ? ""
                  : "Không có yêu cầu thay đổi lịch hẹn nào hoặc dữ liệu chưa sẵn sàng.",
              }}
            />
            
            {/* Custom pagination controls cho change requests */}
            <div className="flex justify-end mt-4">
              <Button
                disabled={changeRequestPage === 0}                   // Disable nếu ở trang đầu
                onClick={() => fetchChangeRequests(changeRequestPage - 1)}
                className="mr-2"
              >
                Trang trước
              </Button>
              <span className="px-4 py-1 bg-gray-100 rounded text-sm">
                Trang {changeRequestPage + 1} / {changeRequestTotalPages}
              </span>
              <Button
                disabled={changeRequestPage + 1 >= changeRequestTotalPages} // Disable nếu ở trang cuối
                onClick={() => fetchChangeRequests(changeRequestPage + 1)}
                className="ml-2"
              >
                Trang tiếp
              </Button>
            </div>
          </Spin>
        </>
      ),
    },
  ];

  // ===== RENDER MAIN COMPONENT =====
  return (
    <div>
      {/* ===== MAIN CONTENT SECTION ===== */}
      {/* Card chính chứa tabs quản lý appointments và change requests */}
      <Card
        style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
      >
        <Tabs
          defaultActiveKey="appointments"
          size="large"
          items={tabItems}                                            // Tabs configuration
          onChange={(key) => {
            // Khi chuyển sang tab change requests thì fetch data
            if (key === "changeRequests") {
              fetchChangeRequests();
            }
          }}
        />
      </Card>

      {/* ===== APPOINTMENT DETAIL MODAL ===== */}
      {/* Modal hiển thị chi tiết appointment */}
      <Modal
        title="Chi tiết lịch hẹn"
        open={appointmentModalVisible}
        onCancel={() => setAppointmentModalVisible(false)}
        footer={null}                                                 // Custom footer
        width={600}
      >
        {selectedAppointment && (
          <Descriptions column={2} bordered>
            <Descriptions.Item label="Bệnh nhân" span={2}>
              <Space>
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

      {/* ===== CHANGE REQUEST DETAIL MODAL ===== */}
      {/* Modal hiển thị chi tiết change request với approve/reject actions */}
      <Modal
        title="Chi tiết yêu cầu thay đổi lịch hẹn"
        open={changeRequestModalVisible}
        onCancel={() => setChangeRequestModalVisible(false)}
        footer={null}                                                 // Custom footer
        width={700}
      >
        {selectedChangeRequest && (
          <div>
            {/* ===== BASIC INFO SECTION ===== */}
            {/* Thông tin cơ bản về bệnh nhân và bác sĩ */}
            <Descriptions column={2} bordered style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Bệnh nhân" span={2}>
                <Space>
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
            
            {/* ===== TIMELINE SECTION ===== */}
            {/* Timeline so sánh lịch hiện tại và lịch yêu cầu */}
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
            
            {/* ===== REASON SECTION ===== */}
            {/* Card hiển thị lý do thay đổi */}
            <Card className="mt-4" size="small" title="Lí do">
              <Text>
                {selectedChangeRequest.reasonChange || "Chưa có thông tin"}
              </Text>
            </Card>
            
            {/* Notes nếu có */}
            {selectedChangeRequest.notes && (
              <>
                <Divider />
                <Card size="small" title="Ghi chú">
                  <Text>{selectedChangeRequest.notes}</Text>
                </Card>
              </>
            )}
            
            {/* ===== ACTION SECTION ===== */}
            {/* Phần nhập lý do và buttons approve/reject */}
            <Divider />
            <div style={{ marginBottom: 16 }}>
              <Text strong>Lí do xử lý:</Text>
              <Input.TextArea
                rows={3}
                value={changeRequestNotes}
                onChange={(e) => setChangeRequestNotes(e.target.value)}
                placeholder="Nhập lí do bắt buộc"
                style={{ marginTop: 8 }}
              />
            </div>
            
            {/* Action buttons */}
            <Space style={{ width: "100%", justifyContent: "center" }}>
              <Button
                type="primary"
                size="large"
                icon={<CheckOutlined />}
                loading={actionLoading}
                onClick={() => handleChangeRequestAction("PLANED")}
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

// ===== EXPORT COMPONENT =====
export default AppointmentManagement;
