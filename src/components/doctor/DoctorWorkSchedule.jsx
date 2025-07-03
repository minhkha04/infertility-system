import React, { useState, useEffect } from "react";
import { Tag, DatePicker, Spin, message } from "antd";
import { CalendarOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { managerService } from "../../service/manager.service";

const shiftMap = {
  MORNING: { color: "green", text: "Ca sáng" },
  AFTERNOON: { color: "orange", text: "Ca chiều" },
  FULL_DAY: { color: "purple", text: "Cả ngày" },
  NONE: { color: "default", text: "Nghỉ" },
  undefined: { color: "default", text: "Nghỉ" },
  null: { color: "default", text: "Nghỉ" },
  "": { color: "default", text: "Nghỉ" }
};

const weekdays = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN"];

const bgColorMap = {
  MORNING: '#f6ffed', // xanh lá nhạt
  AFTERNOON: '#fff7e6', // cam nhạt
  FULL_DAY: '#f9f0ff', // tím nhạt
};

const DoctorWorkSchedule = () => {
  const [selectedMonth, setSelectedMonth] = useState(dayjs().format("YYYY-MM"));
  const [schedule, setSchedule] = useState({});
  const [loading, setLoading] = useState(false);
  const [doctorId, setDoctorId] = useState(null);

  // Lấy doctorId từ token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const decoded = JSON.parse(jsonPayload);
        setDoctorId(decoded.sub);
      } catch (error) {
        message.error('Không thể xác thực thông tin bác sĩ');
      }
    }
  }, []);

  // Lấy lịch làm việc từ API khi có doctorId hoặc đổi tháng
  useEffect(() => {
    if (!doctorId) return;
    setLoading(true);
    managerService.getWorkScheduleMonth(doctorId)
      .then(res => {
        if (res.data && res.data.result && res.data.result.schedules) {
          // Lọc lịch theo tháng đang chọn
          const allSchedule = res.data.result.schedules;
          const map = {};
          Object.entries(allSchedule).forEach(([date, shift]) => {
            if (date.startsWith(selectedMonth)) {
              map[date] = shift;
            }
          });
          setSchedule(map);
        } else {
          setSchedule({});
        }
      })
      .catch(err => {
        setSchedule({});
        message.error('Không thể lấy lịch làm việc');
      })
      .finally(() => setLoading(false));
  }, [doctorId, selectedMonth]);

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
          week.push(`${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`);
          day++;
        }
      }
      calendar.push(week);
    }
    return calendar;
  };

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
      <div style={{ marginBottom: 32, display: 'flex', alignItems: 'center', gap: 16 }}>
        <CalendarOutlined style={{ fontSize: 28, marginRight: 8, color: '#722ed1' }} />
        <DatePicker
          picker="month"
          value={dayjs(selectedMonth + "-01")}
          onChange={d => setSelectedMonth(d.format("YYYY-MM"))}
          allowClear={false}
          format="MM/YYYY"
          size="large"
          style={{ fontWeight: 600, fontSize: 20 }}
        />
      </div>
      {loading ? (
        <Spin tip="Đang tải lịch làm việc...">
          <div style={{ minHeight: 300 }} />
        </Spin>
      ) : (
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
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr>
                {weekdays.map(day => (
                  <th key={day} style={{ border: 'none', padding: 16, background: '#fafafa', textAlign: 'center', fontWeight: 700, fontSize: 20, color: '#722ed1' }}>{day}</th>
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
                          border: '2px solid #bfbfbf',
                          height: 120,
                          minWidth: 120,
                          textAlign: 'center',
                          verticalAlign: 'middle',
                          background: bgColor || (dateStr === dayjs().format('YYYY-MM-DD') ? '#e6f7ff' : '#fff'),
                          borderRadius: 16,
                          transition: 'background 0.2s',
                          position: 'relative',
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: '100%',
                        }}>
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
                          <div style={{ fontSize: 16, color: '#aaa', marginTop: 10 }}>{dateStr ? dayjs(dateStr).format('D') : ''}</div>
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

export default DoctorWorkSchedule; 