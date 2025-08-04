import React, { useState, useEffect } from "react";
import { Tag, DatePicker, Spin, message } from "antd";
import { CalendarOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { managerService } from "../../service/manager.service";

// ===== SHIFT MAPPING CONFIGURATION =====
// Map để dịch shift codes thành text và màu sắc hiển thị
const shiftMap = {
  MORNING: { color: "green", text: "Ca sáng" },
  AFTERNOON: { color: "orange", text: "Ca chiều" },
  FULL_DAY: { color: "purple", text: "Cả ngày" },
  NONE: { color: "default", text: "Nghỉ" },
  undefined: { color: "default", text: "Nghỉ" },
  null: { color: "default", text: "Nghỉ" },
  "": { color: "default", text: "Nghỉ" }
};

// Tên các ngày trong tuần để hiển thị header
const weekdays = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN"];

// Map màu background cho từng loại ca làm việc
const bgColorMap = {
  MORNING: '#f6ffed',       // Xanh lá nhạt cho ca sáng
  AFTERNOON: '#fff7e6',     // Cam nhạt cho ca chiều
  FULL_DAY: '#f9f0ff',      // Tím nhạt cho cả ngày
};

const DoctorWorkSchedule = () => {
  // ===== STATE MANAGEMENT =====
  const [selectedMonth, setSelectedMonth] = useState(dayjs().format("YYYY-MM"));  // Tháng được chọn
  const [schedule, setSchedule] = useState({});                                   // Object chứa lịch làm việc {date: shift}
  const [loading, setLoading] = useState(false);                                 // Trạng thái loading
  const [doctorId, setDoctorId] = useState(null);                               // ID của doctor hiện tại

  // ===== USEEFFECT: DECODE TOKEN ĐỂ LẤY DOCTOR ID =====
  // useEffect này decode JWT token để lấy doctor ID
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Decode JWT token manual để lấy sub (doctor ID)
        const base64Url = token.split('.')[1];                          // Lấy payload part
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/'); // Convert base64Url to base64
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const decoded = JSON.parse(jsonPayload);                        // Parse JSON payload
        setDoctorId(decoded.sub);                                       // Set doctor ID từ sub claim
      } catch (error) {
        message.error('Không thể xác thực thông tin bác sĩ');
      }
    }
  }, []);

  // ===== USEEFFECT: TẢI LỊCH LÀM VIỆC =====
  // useEffect này gọi API lấy lịch làm việc khi có doctorId hoặc đổi tháng
  useEffect(() => {
    if (!doctorId) return;  // Cần có doctorId mới call API
    
    setLoading(true);
    managerService.getWorkScheduleMonth(doctorId)                      // Gọi API lấy lịch làm việc
      .then(res => {
        if (res.data && res.data.result && res.data.result.schedules) {
          // Lọc lịch theo tháng đang chọn
          const allSchedule = res.data.result.schedules;               // Tất cả lịch từ API
          const map = {};
          Object.entries(allSchedule).forEach(([date, shift]) => {
            if (date.startsWith(selectedMonth)) {                      // Chỉ lấy dates thuộc tháng được chọn
              map[date] = shift;
            }
          });
          setSchedule(map);                                           // Set filtered schedule
        } else {
          setSchedule({});                                            // Set empty nếu không có data
        }
      })
      .catch(err => {
        setSchedule({});
        message.error('Không thể lấy lịch làm việc');
      })
      .finally(() => setLoading(false));
  }, [doctorId, selectedMonth]);

  // ===== UTILITY FUNCTION: TẠO CALENDAR GRID =====
  // Hàm tạo cấu trúc calendar grid cho tháng được chọn
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
          week.push(`${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`);
          day++;
        }
      }
      calendar.push(week);
    }
    return calendar;
  };

  // ===== RENDER MAIN COMPONENT =====
  return (
    <div style={{
      minHeight: '100vh',
      background: '#fff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      padding: 0,
    }}>
      {/* ===== HEADER SECTION ===== */}
      {/* Header với icon calendar và month picker */}
      <div style={{ marginBottom: 32, display: 'flex', alignItems: 'center', gap: 16 }}>
        <CalendarOutlined style={{ fontSize: 28, marginRight: 8, color: '#722ed1' }} />
        <DatePicker
          picker="month"                                              // Chỉ cho chọn tháng
          value={dayjs(selectedMonth + "-01")}                       // Current value
          onChange={d => setSelectedMonth(d.format("YYYY-MM"))}      // Handler khi đổi tháng
          allowClear={false}                                         // Không cho phép clear
          format="MM/YYYY"                                           // Format hiển thị
          size="large"
          style={{ fontWeight: 600, fontSize: 20 }}
        />
      </div>

      {/* ===== MAIN CONTENT ===== */}
      {loading ? (
        // Loading state với spinner
        <Spin tip="Đang tải lịch làm việc...">
          <div style={{ minHeight: 300 }} />
        </Spin>
      ) : (
        // Calendar grid container
        <div style={{
          background: '#fff',
          borderRadius: 24,
          boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
          padding: 32,
          marginBottom: 32,
          minWidth: 1000,
          maxWidth: 1200,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
        }}>
          {/* ===== CALENDAR TABLE ===== */}
          {/* Table hiển thị calendar với lịch làm việc */}
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
            {/* Table header với tên các ngày trong tuần */}
            <thead>
              <tr>
                {weekdays.map(day => (
                  <th key={day} style={{ 
                    border: 'none', 
                    padding: 16, 
                    background: '#fafafa', 
                    textAlign: 'center', 
                    fontWeight: 700, 
                    fontSize: 20, 
                    color: '#722ed1' 
                  }}>
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
                    const shift = schedule[dateStr];                   // Lấy shift cho ngày này
                    const bgColor = bgColorMap[shift] || undefined;   // Lấy background color theo shift
                    
                    return (
                      <td
                        key={j}
                        style={{
                          border: '2px solid #bfbfbf',
                          height: 120,
                          minWidth: 120,
                          textAlign: 'center',
                          verticalAlign: 'middle',
                          background: bgColor || (dateStr === dayjs().format('YYYY-MM-DD') ? '#e6f7ff' : '#fff'), // Highlight ngày hôm nay
                          borderRadius: 16,
                          transition: 'background 0.2s',
                          position: 'relative',
                        }}
                      >
                        {/* Nội dung cell: shift text và số ngày */}
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: '100%',
                        }}>
                          {/* Text hiển thị ca làm việc */}
                          {dateStr && shift ? (
                            <span style={{
                              color: shiftMap[shift]?.color,
                              fontWeight: 700,
                              fontSize: 22,
                              letterSpacing: 0.5,
                            }}>
                              {shiftMap[shift]?.text || 'Nghỉ'}
                            </span>
                          ) : null}
                          {/* Số ngày trong tháng */}
                          <div style={{ fontSize: 16, color: '#aaa', marginTop: 10 }}>
                            {dateStr ? dayjs(dateStr).format('D') : ''}
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
    </div>
  );
};

// ===== EXPORT COMPONENT =====
export default DoctorWorkSchedule; 