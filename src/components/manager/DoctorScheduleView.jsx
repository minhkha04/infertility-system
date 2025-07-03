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
  Badge,
  Space,
  Button,
  Tooltip,
  Spin,
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
  MailOutlined,
  EnvironmentOutlined,
  CalendarOutlined as CalendarIcon,
  StarOutlined,
  TrophyOutlined,
  HeartOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { treatmentService } from "../../service/treatment.service";

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;

const DoctorScheduleView = () => {
  const [loading, setLoading] = useState(true);
  const [doctorSchedules, setDoctorSchedules] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [shiftFilter, setShiftFilter] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctorModalVisible, setDoctorModalVisible] = useState(false);
  const [doctorDetails, setDoctorDetails] = useState(null);
  const [loadingDoctorDetails, setLoadingDoctorDetails] = useState(false);
  const [workStats, setWorkStats] = useState({
    totalDoctorsToday: 0,
    totalPatientsToday: 0,
    completedPatientsToday: 0,
  });

  useEffect(() => {
    fetchManagerDashboardData();
  }, []);

  const fetchManagerDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch statistics using service
      const statsRes =
        await treatmentService.getManagerWorkScheduleStatistics();
      if (statsRes?.data?.result) {
        setWorkStats(statsRes.data.result);
      } else {
        setWorkStats({
          totalDoctorsToday: 0,
          totalPatientsToday: 0,
          completedPatientsToday: 0,
        });
      }

      // Fetch today's doctors using service
      const doctorsRes = await treatmentService.getManagerDoctorsToday();
      if (doctorsRes?.data?.result) {
        setDoctorSchedules(doctorsRes.data.result);
        setFilteredData(doctorsRes.data.result);
      } else {
        setDoctorSchedules([]);
        setFilteredData([]);
      }
    } catch (error) {
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

  // No doctor details API in new spec, so just show modal with available info
  const showDoctorDetails = (doctor) => {
    setSelectedDoctor(doctor);
    setDoctorModalVisible(true);
  };

  // Filter schedules
  useEffect(() => {
    let filtered = doctorSchedules;
    if (shiftFilter !== "all") {
      filtered = filtered.filter((item) => item.shift === shiftFilter);
    }
    if (searchText) {
      filtered = filtered.filter((item) =>
        item.doctorName.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    setFilteredData(filtered);
  }, [shiftFilter, searchText, doctorSchedules]);

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

  const getProgressColor = (completed, total) => {
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    if (percentage >= 80) return "#52c41a";
    if (percentage >= 50) return "#faad14";
    return "#ff4d4f";
  };

  const columns = [
    {
      title: "Bác sĩ",
      key: "doctor",
      align: "center",
      render: (_, record) => (
        <div
          className="flex items-center cursor-pointer hover:bg-blue-50 p-3 rounded-lg transition-all duration-200"
          onClick={() => showDoctorDetails(record)}
        >
          <Avatar
            size={48}
            icon={<UserOutlined />}
            className="mr-4 shadow-md"
            style={{
              backgroundColor: "#1890ff",
              border: "3px solid #e6f7ff",
            }}
            src={record.avatarUrl}
          />
          <div>
            <div className="font-bold text-lg text-gray-800">
              {record.doctorName}
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
          {getShiftTag(record.shift)}
          <div className="mt-2 text-xs text-gray-500">
            {record.shift === "FULL_DAY"
              ? "08:00 - 17:00"
              : record.shift === "MORNING"
              ? "08:00 - 12:00"
              : "13:00 - 17:00"}
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
            {record.completedAppointments}/{record.totalAppointments}
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

  return (
    <div
      style={{
        minHeight: "30vh",
      }}
    >
      {/* Statistics */}
      <Row gutter={24} style={{ marginBottom: 5 }}>
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

      {/* Filters */}
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
          <Col span={12}>
            <Search
              placeholder="Tìm kiếm bác sĩ..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              size="large"
              allowClear
            />
          </Col>
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

      {/* Schedule Table */}
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
          columns={columns}
          dataSource={filteredData}
          pagination={false}
          scroll={{ x: 1200 }}
          loading={loading}
          locale={{
            emptyText: loading ? (
              ""
            ) : (
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
        <style>{`
          .doctor-table-row .ant-table-cell {
            vertical-align: middle !important;
            padding-top: 20px !important;
            padding-bottom: 20px !important;
          }
        `}</style>
      </Card>

      {/* Doctor Details Modal */}
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
        footer={null}
        width={600}
        style={{ borderRadius: 16 }}
      >
        {selectedDoctor ? (
          <div className="space-y-6">
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

            <Row gutter={24}>
              <Col span={12}>
                <div className="space-y-4">
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

export default DoctorScheduleView;
