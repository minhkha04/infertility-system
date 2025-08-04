import React, { useState, useEffect } from "react";
import {
  Card,
  Typography,
  Table,
  Tag,
  Select,
  Input,
  Row,
  Col,
  Avatar,
  Statistic,
  Button,
  Tooltip,
  Modal,
  Progress,
  notification,
  Divider,
} from "antd";
import {
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  TeamOutlined,
  CalendarOutlined,
  PhoneOutlined,
  CalendarOutlined as CalendarIcon,
  StarOutlined,
  TrophyOutlined,
  HeartOutlined,
} from "@ant-design/icons";
import { treatmentService } from "../../service/treatment.service";

const { Option } = Select;
const { Search } = Input;

const DoctorScheduleView = () => {
  // ===== STATE MANAGEMENT =====
  // State quản lý loading và data
  const [loading, setLoading] = useState(true);                              // Loading state chính
  const [doctorSchedules, setDoctorSchedules] = useState([]);                // Danh sách lịch làm việc doctors
  const [filteredData, setFilteredData] = useState([]);                      // Data đã được filter
  
  // State quản lý filters
  const [shiftFilter, setShiftFilter] = useState("all");                     // Filter theo ca làm việc
  const [searchText, setSearchText] = useState("");                          // Text tìm kiếm
  
  // State quản lý modal
  const [selectedDoctor, setSelectedDoctor] = useState(null);                // Doctor được chọn trong modal
  const [doctorModalVisible, setDoctorModalVisible] = useState(false);       // Hiển thị modal chi tiết doctor
  
  // State quản lý statistics
  const [workStats, setWorkStats] = useState({
    totalDoctorsToday: 0,           // Tổng số bác sĩ hôm nay
    totalPatientsToday: 0,          // Tổng số bệnh nhân hôm nay
    completedPatientsToday: 0,      // Số bệnh nhân đã khám hôm nay
  });

  // ===== USEEFFECT: INITIAL DATA LOAD =====
  // useEffect này chạy khi component mount để load data
  useEffect(() => {
    fetchManagerDashboardData();
  }, []);

  // ===== API FUNCTION: FETCH DASHBOARD DATA =====
  // Hàm lấy dữ liệu dashboard bao gồm statistics và danh sách doctors
  const fetchManagerDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch statistics using service
      const statsRes =
        await treatmentService.getManagerWorkScheduleStatistics();          // Gọi API lấy statistics
      if (statsRes?.data?.result) {
        setWorkStats(statsRes.data.result);                                 // Set statistics nếu có data
      } else {
        setWorkStats({                                                      // Fallback default statistics
          totalDoctorsToday: 0,
          totalPatientsToday: 0,
          completedPatientsToday: 0,
        });
      }

      // Fetch today's doctors using service
      const doctorsRes = await treatmentService.getManagerDoctorsToday();   // Gọi API lấy danh sách doctors hôm nay
      if (doctorsRes?.data?.result) {
        setDoctorSchedules(doctorsRes.data.result);                         // Set raw doctor schedules
        setFilteredData(doctorsRes.data.result);                           // Set filtered data
      } else {
        setDoctorSchedules([]);                                             // Fallback empty array
        setFilteredData([]);
      }
    } catch (error) {
      // Error handling - set default values và hiển thị notification
      setWorkStats({
        totalDoctorsToday: 0,
        totalPatientsToday: 0,
        completedPatientsToday: 0,
      });
      setDoctorSchedules([]);
      setFilteredData([]);
      notification.error({
        message: "Lỗi tải dữ liệu",
        description:
          "Không thể tải thông tin bác sĩ và thống kê hôm nay. Vui lòng thử lại sau.",
        duration: 5,
      });
    } finally {
      setLoading(false);
    }
  };

  // ===== MODAL HANDLER =====
  // Hàm hiển thị modal chi tiết doctor (No API for details, just show available info)
  const showDoctorDetails = (doctor) => {
    setSelectedDoctor(doctor);                                              // Set doctor được chọn
    setDoctorModalVisible(true);                                            // Mở modal
  };

  // ===== USEEFFECT: AUTO FILTER =====
  // useEffect này chạy khi filters thay đổi để auto filter data
  useEffect(() => {
    let filtered = doctorSchedules;
    
    // Filter theo ca làm việc
    if (shiftFilter !== "all") {
      filtered = filtered.filter((item) => item.shift === shiftFilter);
    }
    
    // Filter theo tên bác sĩ
    if (searchText) {
      filtered = filtered.filter((item) =>
        item.doctorName.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    
    setFilteredData(filtered);                                              // Update filtered data
  }, [shiftFilter, searchText, doctorSchedules]);

  // ===== UTILITY FUNCTIONS =====
  
  // Hàm tạo shift tag với màu sắc tương ứng
  const getShiftTag = (shift) => {
    if (shift === "FULL_DAY")
      return (
        <Tag color="purple" icon={<CalendarOutlined />}>
          Cả ngày
        </Tag>
      );
    if (shift === "MORNING")
      return (
        <Tag color="blue" icon={<ClockCircleOutlined />}>
          Sáng
        </Tag>
      );
    if (shift === "AFTERNOON")
      return (
        <Tag color="orange" icon={<ClockCircleOutlined />}>
          Chiều
        </Tag>
      );
    return <Tag>{shift}</Tag>;
  };

  // Hàm lấy màu progress bar dựa trên tỉ lệ hoàn thành
  const getProgressColor = (completed, total) => {
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    if (percentage >= 80) return "#52c41a";                                 // Xanh lá >= 80%
    if (percentage >= 50) return "#faad14";                                 // Vàng >= 50%
    return "#ff4d4f";                                                       // Đỏ < 50%
  };

  // ===== TABLE COLUMNS CONFIGURATION =====
  // Cấu hình các columns cho bảng doctor schedules
  const columns = [
    {
      title: "Bác sĩ",
      key: "doctor",
      align: "center",
      render: (_, record) => (
        <div
          className="flex items-center cursor-pointer hover:bg-blue-50 p-3 rounded-lg transition-all duration-200"
          onClick={() => showDoctorDetails(record)}                          // Click để xem chi tiết
        >
          <Avatar
            size={48}
            icon={<UserOutlined />}
            className="mr-4 shadow-md"
            style={{
              backgroundColor: "#1890ff",
              border: "3px solid #e6f7ff",
            }}
            src={record.avatarUrl}                                           // Avatar URL nếu có
          />
          <div>
            <div className="font-bold text-lg text-gray-800">
              {record.doctorName}                                            {/* Tên bác sĩ */}
            </div>
            <div className="text-sm text-gray-500 flex items-center">
              <StarOutlined style={{ color: "#faad14", marginRight: 4 }} />
              Bác sĩ chuyên khoa
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Ca làm việc",
      key: "shift",
      align: "center",
      render: (_, record) => (
        <div className="text-center">
          {getShiftTag(record.shift)}                                        {/* Shift tag */}
          <div className="mt-2 text-xs text-gray-500">
            {record.shift === "FULL_DAY"
              ? "08:00 - 17:00"
              : record.shift === "MORNING"
              ? "08:00 - 12:00"
              : "13:00 - 17:00"}                                             {/* Giờ làm việc */}
          </div>
        </div>
      ),
    },
    {
      title: "Tiến độ khám",
      key: "progress",
      align: "center",
      render: (_, record) => (
        <div className="text-center">
          <div className="font-bold text-lg">
            {record.completedAppointments}/{record.totalAppointments}        {/* Số đã khám/tổng */}
          </div>
          <div className="text-sm text-gray-500 mb-2">Đã khám/Tổng</div>
          <Progress
            percent={
              record.totalAppointments > 0
                ? Math.round(
                    (record.completedAppointments / record.totalAppointments) *
                      100
                  )
                : 0
            }
            size="small"
            strokeColor={getProgressColor(
              record.completedAppointments,
              record.totalAppointments
            )}
            showInfo={false}
          />
        </div>
      ),
    },
    {
      title: "Liên hệ",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      align: "center",
      // Render contact info với phone call button
      render: (phone) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Tooltip title={phone}>
            <Button
              type="primary"
              icon={<PhoneOutlined />}
              shape="circle"
              size="large"
              style={{
                marginRight: 12,
                boxShadow: "0 4px 12px rgba(24, 144, 255, 0.3)",
              }}
              onClick={() => window.open(`tel:${phone}`)}
            />
          </Tooltip>
          <span style={{ fontWeight: 500, color: "#444", fontSize: 16 }}>
            {phone}
          </span>
        </div>
      ),
    },
  ];

  // ===== RENDER MAIN COMPONENT =====
  return (
    <div
      style={{
        minHeight: "30vh",
      }}
    >
      {/* ===== STATISTICS SECTION ===== */}
      {/* 3 cards hiển thị statistics tổng quan */}
      <Row gutter={24} style={{ marginBottom: 5 }}>
        {/* Tổng bác sĩ hôm nay */}
        <Col span={8}>
          <Card
            style={{
              borderRadius: 16,
              boxShadow: "0 8px 32px rgba(24,144,255,0.15)",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              border: "none",
            }}
            bodyStyle={{ padding: "24px" }}
          >
            <Statistic
              title={
                <span
                  style={{
                    color: "white",
                    fontWeight: 600,
                    fontSize: "1.1rem",
                  }}
                >
                  Tổng bác sĩ hôm nay
                </span>
              }
              value={workStats ? workStats.totalDoctorsToday : 0}
              prefix={
                <TeamOutlined style={{ color: "white", fontSize: "2rem" }} />
              }
              valueStyle={{ color: "white", fontSize: 36, fontWeight: "bold" }}
            />
          </Card>
        </Col>
        
        {/* Bệnh nhân đã khám */}
        <Col span={8}>
          <Card
            style={{
              borderRadius: 16,
              boxShadow: "0 8px 32px rgba(82,196,26,0.15)",
              background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
              border: "none",
            }}
            bodyStyle={{ padding: "24px" }}
          >
            <Statistic
              title={
                <span
                  style={{
                    color: "white",
                    fontWeight: 600,
                    fontSize: "1.1rem",
                  }}
                >
                  Bệnh nhân đã khám
                </span>
              }
              value={workStats ? workStats.completedPatientsToday : 0}
              prefix={
                <CheckCircleOutlined
                  style={{ color: "white", fontSize: "2rem" }}
                />
              }
              valueStyle={{ color: "white", fontSize: 36, fontWeight: "bold" }}
            />
          </Card>
        </Col>
        
        {/* Tổng bệnh nhân hôm nay */}
        <Col span={8}>
          <Card
            style={{
              borderRadius: 16,
              boxShadow: "0 8px 32px rgba(250,173,20,0.15)",
              background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
              border: "none",
            }}
            bodyStyle={{ padding: "24px" }}
          >
            <Statistic
              title={
                <span
                  style={{
                    color: "white",
                    fontWeight: 600,
                    fontSize: "1.1rem",
                  }}
                >
                  Tổng bệnh nhân hôm nay
                </span>
              }
              value={workStats ? workStats.totalPatientsToday : 0}
              prefix={
                <UserOutlined style={{ color: "white", fontSize: "2rem" }} />
              }
              valueStyle={{ color: "white", fontSize: 36, fontWeight: "bold" }}
            />
          </Card>
        </Col>
      </Row>

      {/* ===== FILTERS SECTION ===== */}
      {/* Card chứa các filter controls */}
      <Card
        className="my-2"
        style={{
          borderRadius: 16,
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Row gutter={16} align="middle">
          {/* Shift filter */}
          <Col span={8}>
            <Select
              value={shiftFilter}
              onChange={setShiftFilter}
              style={{ width: "100%" }}
              size="large"
              placeholder="Chọn ca làm việc"
            >
              <Option value="all">Tất cả ca</Option>
              <Option value="MORNING">Ca sáng</Option>
              <Option value="AFTERNOON">Ca chiều</Option>
              <Option value="FULL_DAY">Cả ngày</Option>
            </Select>
          </Col>
          
          {/* Search input */}
          <Col span={12}>
            <Search
              placeholder="Tìm kiếm bác sĩ..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              size="large"
              allowClear
            />
          </Col>
          
          {/* Refresh button */}
          <Col span={4} className="text-right">
            <Button
              type="primary"
              onClick={fetchManagerDashboardData}
              icon={<CalendarOutlined />}
              size="large"
              style={{
                borderRadius: 12,
                height: 40,
                boxShadow: "0 4px 12px rgba(24, 144, 255, 0.3)",
              }}
            >
              Làm mới
            </Button>
          </Col>
        </Row>
      </Card>

      {/* ===== SCHEDULE TABLE SECTION ===== */}
      {/* Bảng hiển thị lịch làm việc của các bác sĩ */}
      <Card
        className="shadow-lg"
        style={{
          borderRadius: 16,
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Table
          columns={columns}                                                  // Columns configuration
          dataSource={filteredData}                                         // Data đã được filter
          pagination={false}                                                 // Disable pagination
          scroll={{ x: 1200 }}                                              // Horizontal scroll
          loading={loading}                                                  // Loading state
          locale={{
            emptyText: loading ? (
              ""
            ) : (
              // Custom empty state
              <div className="text-center py-8">
                <HeartOutlined
                  style={{
                    fontSize: "3rem",
                    color: "#d9d9d9",
                    marginBottom: 16,
                  }}
                />
                <div className="text-gray-500 text-lg">
                  Không có dữ liệu bác sĩ hôm nay
                </div>
                <div className="text-gray-400">
                  Vui lòng thử lại sau hoặc liên hệ quản trị viên
                </div>
              </div>
            ),
          }}
          rowClassName={() => "doctor-table-row"}
          style={{ verticalAlign: "middle" }}
        />
        
        {/* Custom CSS cho table styling */}
        <style>{`
          .doctor-table-row .ant-table-cell {
            vertical-align: middle !important;
            padding-top: 20px !important;
            padding-bottom: 20px !important;
          }
        `}</style>
      </Card>

      {/* ===== DOCTOR DETAILS MODAL ===== */}
      {/* Modal hiển thị chi tiết thông tin bác sĩ */}
      <Modal
        title={
          <div className="flex items-center">
            <UserOutlined
              style={{ fontSize: "1.5rem", color: "#1890ff", marginRight: 8 }}
            />
            <span style={{ fontSize: "1.3rem", fontWeight: "bold" }}>
              Thông tin chi tiết bác sĩ
            </span>
          </div>
        }
        open={doctorModalVisible}
        onCancel={() => setDoctorModalVisible(false)}
        footer={null}                                                        // Custom footer
        width={600}
        style={{ borderRadius: 16 }}
      >
        {selectedDoctor ? (
          <div className="space-y-6">
            {/* ===== DOCTOR HEADER INFO ===== */}
            {/* Phần header với avatar và tên bác sĩ */}
            <div className="flex items-center space-x-6">
              <Avatar
                size={80}
                icon={<UserOutlined />}
                style={{
                  backgroundColor: "#1890ff",
                  border: "4px solid #e6f7ff",
                  boxShadow: "0 4px 12px rgba(24, 144, 255, 0.3)",
                }}
                src={selectedDoctor.avatarUrl}
              />
              <div>
                <h3 className="text-2xl font-bold text-gray-800">
                  {selectedDoctor.doctorName}
                </h3>
                <p className="text-gray-500 flex items-center">
                  <StarOutlined style={{ color: "#faad14", marginRight: 8 }} />
                  Bác sĩ chuyên khoa
                </p>
              </div>
            </div>

            <Divider />

            {/* ===== DOCTOR DETAILS GRID ===== */}
            {/* Grid hiển thị thông tin chi tiết */}
            <Row gutter={24}>
              <Col span={12}>
                <div className="space-y-4">
                  {/* Số điện thoại */}
                  <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                    <PhoneOutlined className="mr-3 text-blue-500 text-lg" />
                    <div>
                      <div className="font-semibold text-gray-800">
                        Số điện thoại
                      </div>
                      <div className="text-gray-600">
                        {selectedDoctor.phoneNumber}
                      </div>
                    </div>
                  </div>

                  {/* Ca làm việc */}
                  <div className="flex items-center p-3 bg-green-50 rounded-lg">
                    <CalendarOutlined className="mr-3 text-green-500 text-lg" />
                    <div>
                      <div className="font-semibold text-gray-800">
                        Ca làm việc
                      </div>
                      <div>{getShiftTag(selectedDoctor.shift)}</div>
                    </div>
                  </div>
                </div>
              </Col>

              <Col span={12}>
                <div className="space-y-4">
                  {/* Tổng lịch hẹn */}
                  <div className="flex items-center p-3 bg-orange-50 rounded-lg">
                    <TrophyOutlined className="mr-3 text-orange-500 text-lg" />
                    <div>
                      <div className="font-semibold text-gray-800">
                        Tổng lịch hẹn
                      </div>
                      <div className="text-2xl font-bold text-orange-500">
                        {selectedDoctor.totalAppointments}
                      </div>
                    </div>
                  </div>

                  {/* Đã khám */}
                  <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                    <CheckCircleOutlined className="mr-3 text-purple-500 text-lg" />
                    <div>
                      <div className="font-semibold text-gray-800">Đã khám</div>
                      <div className="text-2xl font-bold text-purple-500">
                        {selectedDoctor.completedAppointments}
                      </div>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        ) : (
          // Empty state khi không có selectedDoctor
          <div className="text-center py-8">
            <UserOutlined
              style={{ fontSize: "3rem", color: "#d9d9d9", marginBottom: 16 }}
            />
            <div className="text-gray-500">Không tìm thấy thông tin bác sĩ</div>
          </div>
        )}
      </Modal>
    </div>
  );
};

// ===== EXPORT COMPONENT =====
export default DoctorScheduleView;
