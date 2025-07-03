import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Table,
  Calendar,
  Badge,
  Typography,
  Statistic,
  Tag,
  Avatar,
  Space,
  Button,
  Timeline,
  Progress,
  DatePicker,
  Spin,
  message,
} from "antd";
import {
  CalendarOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  MedicineBoxOutlined,
  PhoneOutlined,
  StarFilled,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { managerService } from "../../service/manager.service";
import { treatmentService } from "../../service/treatment.service";
import { authService } from "../../service/auth.service";
import { doctorService } from "../../service/doctor.service";
import "dayjs/locale/vi";
dayjs.locale("vi");

const { Title, Text } = Typography;
const shiftMap = {
  MORNING: { color: "green", text: "Sáng" },
  AFTERNOON: { color: "orange", text: "Chiều" },
  FULL_DAY: { color: "purple", text: "Cả ngày" },
  NONE: { color: "default", text: "Nghỉ" },
  undefined: { color: "default", text: "Nghỉ" },
  null: { color: "default", text: "Nghỉ" },
  "": { color: "default", text: "Nghỉ" },
};
const weekdays = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN"];
const bgColorMap = {
  MORNING: "#f6ffed",
  AFTERNOON: "#fff7e6",
  FULL_DAY: "#f9f0ff",
};

const DashboardOverview = () => {
  // Lịch làm việc tháng này
  const [selectedMonth, setSelectedMonth] = useState(dayjs().format("YYYY-MM"));
  const [schedule, setSchedule] = useState({});
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [doctorId, setDoctorId] = useState(null);

  // Lịch khám hôm nay
  const [loadingToday, setLoadingToday] = useState(true);
  const [todayAppointments, setTodayAppointments] = useState([]);

  // Dashboard stats
  const [dashboardStats, setDashboardStats] = useState({
    workShiftsThisMonth: 0,
    patients: 0,
    avgRating: 0,
  });

  // Lấy doctorId từ token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map(function (c) {
              return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join("")
        );
        const decoded = JSON.parse(jsonPayload);
        setDoctorId(decoded.sub);
      } catch (error) {
        message.error("Không thể xác thực thông tin bác sĩ");
      }
    }
  }, []);

  // Lấy lịch làm việc tháng
  useEffect(() => {
    if (!doctorId) return;
    setLoadingSchedule(true);

    // Thử API mới trước
    doctorService
      .getWorkScheduleByMonth(selectedMonth)
      .then((res) => {
        if (res.data && res.data.result) {
          // Chuyển đổi format từ API mới sang format cũ
          const schedules = {};
          res.data.result.forEach((item) => {
            schedules[item.workDate] = item.shift;
          });
          setSchedule(schedules);
        } else {
          setSchedule({});
        }
      })
      .catch((err) => {
        console.warn("API mới không hoạt động, thử API cũ:", err);
        // Fallback to old API
        managerService
          .getWorkScheduleYear(selectedMonth, doctorId)
          .then((res) => {
            if (res.data && res.data.result && res.data.result.schedules) {
              setSchedule(res.data.result.schedules);
            } else {
              setSchedule({});
            }
          })
          .catch((oldErr) => {
            setSchedule({});
            message.error("Không thể lấy lịch làm việc");
          });
      })
      .finally(() => setLoadingSchedule(false));
  }, [doctorId, selectedMonth]);

  // Lấy lịch khám hôm nay
  useEffect(() => {
    if (!doctorId) return;
    setLoadingToday(true);

    // Sử dụng API mới
    doctorService
      .getAppointmentsToday(0, 10)
      .then((res) => {
        const data = res?.data?.result?.content || [];
        // Log dữ liệu để debug
        console.log("[Lịch Khám Hôm Nay] todayAppointments:", data);
        setTodayAppointments(data);
      })
      .catch(() => setTodayAppointments([]))
      .finally(() => setLoadingToday(false));
  }, [doctorId]);

  // Lấy dashboard statics
  useEffect(() => {
    if (!doctorId) return;

    // Thử API mới trước
    doctorService
      .getDashboardOverview()
      .then((res) => {
        if (res?.data?.result) {
          setDashboardStats(res.data.result);
        }
      })
      .catch((err) => {
        console.warn("API mới không hoạt động, thử API cũ:", err);
        // Fallback to old API
        doctorService
          .getDashboardStatics(doctorId)
          .then((res) => {
            if (res?.data?.result) {
              setDashboardStats(res.data.result);
            }
          })
          .catch(() =>
            setDashboardStats({
              workShiftsThisMonth: 0,
              patients: 0,
              avgRating: 0,
            })
          );
      });
  }, [doctorId]);

  // Bảng lịch làm việc tháng (thu nhỏ)
  const getCalendarGrid = (monthStr) => {
    const [year, month] = monthStr.split("-").map(Number);
    const firstDate = new Date(year, month - 1, 1);
    const totalDays = new Date(year, month, 0).getDate();
    const firstDay = firstDate.getDay(); // 0=CN
    const offset = firstDay === 0 ? 6 : firstDay - 1;
    const calendar = [];
    let day = 1;
    for (let i = 0; i < 6 && day <= totalDays; i++) {
      const week = [];
      for (let j = 0; j < 7; j++) {
        if ((i === 0 && j < offset) || day > totalDays) {
          week.push(null);
        } else {
          week.push(
            `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
              2,
              "0"
            )}`
          );
          day++;
        }
      }
      calendar.push(week);
    }
    return calendar;
  };

  // Bảng lịch khám hôm nay
  const todayColumns = [
    {
      title: "Bệnh nhân",
      dataIndex: "customerName",
      key: "customerName",
      render: (name, record) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <Avatar
            size="small"
            icon={<UserOutlined />}
            style={{ marginRight: 8 }}
          />
          <span>{name}</span>
        </div>
      ),
    },
    {
      title: "Ca khám",
      dataIndex: "shift",
      key: "shift",
      render: (shift) => {
        const shiftColorMap = {
          MORNING: "blue",
          AFTERNOON: "orange",
          FULL_DAY: "purple",
        };
        return (
          <Tag color={shiftColorMap[shift] || "default"}>
            {shiftMap[shift]?.text || shift}
          </Tag>
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const statusMap = {
          CONFIRMED: { color: "blue", text: "Đã xác nhận" },
          PLANNED: { color: "orange", text: "Chờ thực hiện" },
          COMPLETED: { color: "green", text: "Hoàn thành" },
          CANCELLED: { color: "red", text: "Đã hủy" },
          INPROGRESS: { color: "blue", text: "Đang thực hiện" },
          IN_PROGRESS: { color: "blue", text: "Đang thực hiện" },
        };
        const s = statusMap[status] || { color: "default", text: status };
        return <Tag color={s.color}>{s.text}</Tag>;
      },
    },
    {
      title: "Mục đích",
      key: "purpose",
      render: (record) => {
        // Lấy trường 'purpose' từ API thay vì 'step'
        return <Tag color="purple">{record.purpose || "Chưa có"}</Tag>;
      },
    },
  ];

  return (
    <div>
      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Tổng ca làm việc tháng này"
              value={dashboardStats.workShiftsThisMonth}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Tổng số bệnh nhân"
              value={dashboardStats.patients}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Đánh giá"
              value={dashboardStats.avgRating || 0}
              prefix={<StarFilled style={{ color: "#faad14" }} />}
              valueStyle={{ color: "#faad14" }}
              precision={1}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        {/* Today's Appointments */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <CalendarOutlined />
                <span>Lịch Khám Hôm Nay</span>
                <Tag color="blue">{dayjs().format("DD/MM/YYYY")}</Tag>
              </Space>
            }
          >
            <Table
              columns={todayColumns}
              dataSource={todayAppointments}
              loading={loadingToday}
              pagination={false}
              rowKey="id"
              size="small"
              scroll={{ x: 600 }}
            />
          </Card>
        </Col>

        {/* Weekly Schedule */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                <Space>
                  <MedicineBoxOutlined />
                  <span>Lịch Làm Việc</span>
                </Space>
                <div
                  style={{
                    background: "#faf6ff",
                    border: "1.5px solid #b37feb",
                    borderRadius: 8,
                    padding: "4px 12px",
                    display: "flex",
                    alignItems: "center",
                    minWidth: 150,
                  }}
                >
                  <DatePicker
                    picker="month"
                    value={dayjs(selectedMonth + "-01")}
                    onChange={(d) => setSelectedMonth(d.format("YYYY-MM"))}
                    allowClear={false}
                    format="[Tháng] MM/YYYY"
                    size="middle"
                    style={{
                      fontWeight: 600,
                      fontSize: 16,
                      minWidth: 120,
                      background: "transparent",
                      border: "none",
                    }}
                    classNames={{ popup: { root: "ant-picker-dropdown-vi" } }}
                  />
                </div>
              </div>
            }
          >
            {loadingSchedule ? (
              <Spin tip="Đang tải lịch làm việc...">
                <div style={{ minHeight: 200 }} />
              </Spin>
            ) : (
              <div
                style={{
                  background: "#fff",
                  borderRadius: 16,
                  boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                  padding: 12,
                  marginBottom: 12,
                  minWidth: 400,
                  maxWidth: 600,
                  width: "100%",
                  overflowX: "auto",
                }}
              >
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "separate",
                    borderSpacing: 0,
                  }}
                >
                  <thead>
                    <tr>
                      {weekdays.map((day) => (
                        <th
                          key={day}
                          style={{
                            border: "none",
                            padding: 8,
                            background: "#fafafa",
                            textAlign: "center",
                            fontWeight: 700,
                            fontSize: 15,
                            color: "#722ed1",
                          }}
                        >
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {getCalendarGrid(selectedMonth).map((week, i) => (
                      <tr key={i}>
                        {week.map((dateStr, j) => {
                          const shift = schedule[dateStr];
                          const bgColor = bgColorMap[shift] || undefined;
                          return (
                            <td
                              key={j}
                              style={{
                                border: "1.5px solid #bfbfbf",
                                height: 60,
                                minWidth: 60,
                                textAlign: "center",
                                verticalAlign: "middle",
                                background:
                                  bgColor ||
                                  (dateStr === dayjs().format("YYYY-MM-DD")
                                    ? "#e6f7ff"
                                    : "#fff"),
                                borderRadius: 8,
                                transition: "background 0.2s",
                                position: "relative",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  height: "100%",
                                }}
                              >
                                {dateStr && shift ? (
                                  <span
                                    style={{
                                      color: shiftMap[shift]?.color,
                                      fontWeight: 700,
                                      fontSize: 15,
                                      letterSpacing: 0.5,
                                    }}
                                  >
                                    {shiftMap[shift]?.text || "Nghỉ"}
                                  </span>
                                ) : null}
                                <div
                                  style={{
                                    fontSize: 13,
                                    color: "#aaa",
                                    marginTop: 6,
                                  }}
                                >
                                  {dateStr ? dayjs(dateStr).format("D") : ""}
                                </div>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardOverview;
