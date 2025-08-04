import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Table,
  Typography,
  Statistic,
  Tag,
  Avatar,
  Space,
  DatePicker,
  Spin,
  message,
  Button,
} from "antd";
import {
  CalendarOutlined,
  UserOutlined,
  MedicineBoxOutlined,
  StarFilled,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { managerService } from "../../service/manager.service";
import { doctorService } from "../../service/doctor.service";
import "dayjs/locale/vi";
import { useInfiniteQuery } from "@tanstack/react-query";

dayjs.locale("vi");

// ===== SHIFT MAPPING CONFIGURATION =====
// Map để dịch shift codes thành text và màu sắc hiển thị
const shiftMap = {
  MORNING: { color: "green", text: "Sáng" },
  AFTERNOON: { color: "orange", text: "Chiều" },
  FULL_DAY: { color: "purple", text: "Cả ngày" },
  NONE: { color: "default", text: "Nghỉ" },
  undefined: { color: "default", text: "Nghỉ" },
  null: { color: "default", text: "Nghỉ" },
  "": { color: "default", text: "Nghỉ" },
};

// Tên các ngày trong tuần để hiển thị header calendar
const weekdays = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN"];

// Map màu background cho từng loại ca làm việc trong calendar
const bgColorMap = {
  MORNING: "#f6ffed",       // Xanh lá nhạt cho ca sáng
  AFTERNOON: "#fff7e6",     // Cam nhạt cho ca chiều
  FULL_DAY: "#f9f0ff",      // Tím nhạt cho cả ngày
};

const DashboardOverview = () => {
  // ===== STATE MANAGEMENT =====
  // State quản lý work schedule và calendar
  const [selectedMonth, setSelectedMonth] = useState(dayjs().format("YYYY-MM"));  // Tháng được chọn trong calendar
  const [schedule, setSchedule] = useState({});                                   // Object chứa lịch làm việc {date: shift}
  const [loadingSchedule, setLoadingSchedule] = useState(false);                  // Loading state cho calendar
  const [doctorId, setDoctorId] = useState(null);                                // ID của doctor hiện tại

  // State quản lý dashboard statistics
  const [dashboardStats, setDashboardStats] = useState({
    workShiftsThisMonth: 0,         // Tổng ca làm việc tháng này
    patients: 0,                    // Tổng số bệnh nhân
    avgRating: 0,                   // Đánh giá trung bình
  });

  const [appointments, setAppointments] = useState([]);                           // Danh sách appointments hôm nay

  // ===== USEEFFECT: DECODE TOKEN ĐỂ LẤY DOCTOR ID =====
  // useEffect này decode JWT token để lấy doctor ID
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        // Decode JWT token manual để lấy sub (doctor ID)
        const base64Url = token.split(".")[1];                         // Lấy payload part
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");// Convert base64Url to base64
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map(function (c) {
              return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join("")
        );
        const decoded = JSON.parse(jsonPayload);                       // Parse JSON payload
        setDoctorId(decoded.sub);                                      // Set doctor ID từ sub claim
      } catch (error) {
        message.error("Không thể xác thực thông tin bác sĩ");
      }
    }
  }, []);

  // ===== USEEFFECT: TẢI LỊCH LÀM VIỆC =====
  // useEffect này gọi API lấy lịch làm việc khi có doctorId hoặc đổi tháng
  useEffect(() => {
    if (!doctorId) return;  // Cần có doctorId mới call API
    setLoadingSchedule(true);

    // Thử API mới trước (new API pattern)
    doctorService
      .getWorkScheduleByMonth(selectedMonth)                           // Gọi API mới
      .then((res) => {
        if (res.data && res.data.result) {
          // Chuyển đổi format từ API mới sang format cũ để tương thích
          const schedules = {};
          res.data.result.forEach((item) => {
            schedules[item.workDate] = item.shift;
          });
          setSchedule(schedules);                                      // Set schedule từ API mới
        } else {
          setSchedule({});
        }
      })
      .catch((err) => {
        console.warn("API mới không hoạt động, thử API cũ:", err);
        // Fallback to old API nếu API mới fail
        managerService
          .getWorkScheduleYear(selectedMonth, doctorId)                // Gọi API cũ
          .then((res) => {
            if (res.data && res.data.result && res.data.result.schedules) {
              setSchedule(res.data.result.schedules);                  // Set schedule từ API cũ
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

  // ===== USEEFFECT: TẢI DASHBOARD STATISTICS =====
  // useEffect này gọi API lấy dashboard statistics khi có doctorId
  useEffect(() => {
    if (!doctorId) return;

    // Thử API mới trước (new API pattern)
    doctorService
      .getDashboardOverview()                                          // Gọi API mới
      .then((res) => {
        if (res?.data?.result) {
          setDashboardStats(res.data.result);                         // Set stats từ API mới
        }
      })
      .catch((err) => {
        console.warn("API mới không hoạt động, thử API cũ:", err);
        // Fallback to old API nếu API mới fail
        doctorService
          .getDashboardStatics(doctorId)                               // Gọi API cũ
          .then((res) => {
            if (res?.data?.result) {
              setDashboardStats(res.data.result);                     // Set stats từ API cũ
            }
          })
          .catch(() =>
            setDashboardStats({                                        // Fallback default values
              workShiftsThisMonth: 0,
              patients: 0,
              avgRating: 0,
            })
          );
      });
  }, [doctorId]);

  // ===== UTILITY FUNCTION: TẠO CALENDAR GRID =====
  // Hàm tạo cấu trúc calendar grid cho tháng được chọn (compact version)
  const getCalendarGrid = (monthStr) => {
    const [year, month] = monthStr.split("-").map(Number);            // Parse year và month
    const firstDate = new Date(year, month - 1, 1);                  // Ngày đầu tháng
    const totalDays = new Date(year, month, 0).getDate();            // Tổng số ngày trong tháng
    const firstDay = firstDate.getDay();                             // Thứ mấy của ngày đầu (0=CN)
    const offset = firstDay === 0 ? 6 : firstDay - 1;               // Offset để align với thứ 2 đầu tuần
    
    const calendar = [];
    let day = 1;
    
    // Tạo calendar grid 6 tuần x 7 ngày
    for (let i = 0; i < 6 && day <= totalDays; i++) {
      const week = [];
      for (let j = 0; j < 7; j++) {
        if ((i === 0 && j < offset) || day > totalDays) {            // Cells trống ở đầu/cuối
          week.push(null);
        } else {
          // Format date string YYYY-MM-DD
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

  // ===== TABLE COLUMNS CONFIGURATION =====
  // Cấu hình các columns cho bảng appointments hôm nay
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
          <span>{name}</span>                                        {/* Tên bệnh nhân */}
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
          PLANED: { color: "gold", text: "Đã lên lịch" },
          COMPLETED: { color: "green", text: "Hoàn thành" },
          CANCELLED: { color: "red", text: "Đã hủy" },
          INPROGRESS: { color: "blue", text: "Đang thực hiện" },
          IN_PROGRESS: { color: "blue", text: "Đang thực hiện" },
          PENDING_CHANGE: { color: "yellow", text: "Yêu cầu thay đổi" },
          REJECTED: { color: "red", text: "Từ chối yêu cầu thay đổi" },
        };
        const s = statusMap[status] || { color: "default", text: status };
        return <Tag color={s.color}>{s.text}</Tag>;
      },
    },
    {
      title: "Mục đích",
      key: "purpose",
      render: (record) => {
        return <Tag color="purple">{record.purpose || "Chưa có"}</Tag>;
      },
    },
  ];

  // ===== REACT QUERY INFINITE QUERY =====
  // Setup infinite query để load appointments hôm nay với pagination
  const {
    data: appointmentPages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: loading,
  } = useInfiniteQuery({
    queryKey: ["appointmentsToday", doctorId],                       // Query key với doctorId
    queryFn: async ({ pageParam = 0 }) => {
      const res = await doctorService.getAppointmentsToday(pageParam, 5);
      const data = res?.data?.result;
      setAppointments(data?.content || []);                          // Update appointments state

      return {
        list: data?.content || [],                                   // Danh sách appointments
        hasNextPage: !data?.last,                                   // Còn page tiếp theo không
      };
    },
    enabled: !!doctorId,                                             // Chỉ enabled khi có doctorId
    getNextPageParam: (lastPage, pages) =>                          // Logic xác định next page param
      lastPage.hasNextPage ? pages.length : undefined,

    // Optimization settings để tránh refetch không cần thiết
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
    staleTime: Infinity,                                             // Cache permanently hoặc vài phút
  });

  // Flatten tất cả pages thành 1 mảng appointments
  const todayAppointment = Array.isArray(appointmentPages?.pages)
    ? appointmentPages.pages.flatMap((page) =>
        Array.isArray(page.list) ? page.list : []
      )
    : [];

  // ===== RENDER MAIN COMPONENT =====
  return (
    <div className="flex flex-col gap-4">
      {/* ===== STATISTICS CARDS SECTION ===== */}
      {/* 3 cards hiển thị statistics tổng quan */}
      <Row gutter={[16, 16]}>
        {/* Tổng ca làm việc tháng này */}
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
        
        {/* Tổng số bệnh nhân */}
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
        
        {/* Đánh giá trung bình */}
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Đánh giá"
              value={dashboardStats.avgRating || 0}
              prefix={<StarFilled style={{ color: "#faad14" }} />}
              valueStyle={{ color: "#faad14" }}
              precision={1}                                          // Hiển thị 1 số thập phân
            />
          </Card>
        </Col>
      </Row>

      {/* ===== MAIN CONTENT SECTION ===== */}
      <Row gutter={[24, 24]}>
        {/* ===== TODAY'S APPOINTMENTS ===== */}
        {/* Bảng hiển thị appointments hôm nay với infinite scroll */}
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
              columns={todayColumns}                                 // Columns configuration
              dataSource={todayAppointment}                          // Data từ infinite query
              loading={loading}                                      // Loading state
              pagination={false}                                     // Disable built-in pagination
              rowKey="id"                                            // Unique key cho mỗi row
              size="small"                                           // Compact table size
              scroll={{ x: 600 }}                                   // Horizontal scroll
            />

            {/* Load more button cho infinite scroll */}
            {hasNextPage && (
              <div className="text-center mt-4">
                <Button
                  onClick={() => {
                    fetchNextPage();                                 // Trigger fetch next page
                    console.log(appointments);                       // Debug log
                  }}
                  loading={isFetchingNextPage}                       // Loading state
                  disabled={appointments.length === 0}              // Disable nếu không có appointments
                >
                  {isFetchingNextPage ? "Đang tải..." : "Xem thêm"}
                </Button>
              </div>
            )}
          </Card>
        </Col>

        {/* ===== WORK SCHEDULE CALENDAR ===== */}
        {/* Calendar hiển thị lịch làm việc của doctor với month picker */}
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
                
                {/* Month picker với custom styling */}
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
                    picker="month"                                   // Chỉ cho chọn tháng
                    value={dayjs(selectedMonth + "-01")}            // Current value
                    onChange={(d) => setSelectedMonth(d.format("YYYY-MM"))}  // Handler khi đổi tháng
                    allowClear={false}                              // Không cho phép clear
                    format="[Tháng] MM/YYYY"                        // Format hiển thị
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
              // Loading state với spinner
              <Spin tip="Đang tải lịch làm việc...">
                <div style={{ minHeight: 200 }} />
              </Spin>
            ) : (
              // Calendar grid container
              <div
                style={{
                  background: "#fff",
                  borderRadius: 16,
                  boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                  padding: 12,
                  marginBottom: 12,
                  width: "100%",
                  overflowX: "auto",                                 // Horizontal scroll cho responsive
                }}
              >
                {/* ===== CALENDAR TABLE ===== */}
                {/* Table hiển thị calendar với lịch làm việc */}
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "separate",
                    borderSpacing: 0,
                  }}
                >
                  {/* Table header với tên các ngày trong tuần */}
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
                  
                  {/* Table body với calendar cells */}
                  <tbody>
                    {getCalendarGrid(selectedMonth).map((week, i) => (
                      <tr key={i}>
                        {week.map((dateStr, j) => {
                          const shift = schedule[dateStr];              // Lấy shift cho ngày này
                          const bgColor = bgColorMap[shift] || undefined;  // Lấy background color theo shift
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
                                    ? "#e6f7ff"                      // Highlight ngày hôm nay
                                    : "#fff"),
                                borderRadius: 8,
                                transition: "background 0.2s",
                                position: "relative",
                              }}
                            >
                              {/* Nội dung cell: shift text và số ngày */}
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  height: "100%",
                                }}
                              >
                                {/* Text hiển thị ca làm việc */}
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
                                {/* Số ngày trong tháng */}
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

// ===== EXPORT COMPONENT =====
export default DashboardOverview;
