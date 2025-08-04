import React, { useContext, useEffect, useState } from "react";
import { Select, Popconfirm, Modal } from "antd";
import { doctorService } from "../../service/doctor.service";
import { NotificationContext } from "../../App";
import { useSelector } from "react-redux";
import { authService } from "../../service/auth.service";
import { managerService } from "../../service/manager.service";

const ScheduleManagement = () => {
  // ===== REDUX & CONTEXT =====
  const token = useSelector((state) => state.authSlice);                  // Token từ Redux store
  const { showNotification } = useContext(NotificationContext);           // Context hiển thị thông báo

  // ===== CONSTANTS =====
  // Danh sách các ngày trong tuần
  const days = [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
  ];
  
  // Options cho shift selection
  const shiftOptions = ["", "MORNING", "AFTERNOON", "FULL_DAY"];
  
  // Mapping hiển thị shift tiếng Việt
  const shiftDisplayMap = {
    MORNING: "Sáng",
    AFTERNOON: "Chiều",
    FULL_DAY: "Cả ngày",
  };

  // Mapping hiển thị ngày tiếng Việt
  const dayDisplayMap = {
    MONDAY: "Thứ 2",
    TUESDAY: "Thứ 3",
    WEDNESDAY: "Thứ 4",
    THURSDAY: "Thứ 5",
    FRIDAY: "Thứ 6",
    SATURDAY: "Thứ 7",
    SUNDAY: "Chủ nhật",
  };

  // ===== STATE MANAGEMENT =====
  // State quản lý user và data
  const [infoUser, setInfoUser] = useState();                             // Thông tin manager user hiện tại
  const [doctorList, setDoctorList] = useState([]);                       // Danh sách doctors
  const [selectedDoctor, setSelectedDoctor] = useState(null);             // Doctor được chọn
  const [selectedMonth, setSelectedMonth] = useState("");                 // Tháng được chọn (YYYY-MM)

  // State quản lý schedule
  const [shiftByDay, setShiftByDay] = useState({});                       // Shift theo từng ngày trong tuần
  const [scheduleMap, setScheduleMap] = useState({});                     // Map schedule theo date

  // State quản lý modal
  const [editingDate, setEditingDate] = useState(null);                   // Ngày đang edit
  const [editingShift, setEditingShift] = useState("");                   // Shift đang edit
  const [isModalVisible, setIsModalVisible] = useState(false);            // Hiển thị modal edit

  // ===== ANTD COMPONENTS =====
  const { Option } = Select;

  // ===== USEEFFECT: TẢI THÔNG TIN USER =====
  // useEffect này chạy khi có token để lấy thông tin manager hiện tại
  useEffect(() => {
    if (!token) return;

    authService
      .getMyInfo()                                                        // Gọi API lấy thông tin user
      .then((res) => {
        setInfoUser(res.data.result);                                     // Set thông tin user vào state
      })
      .catch(() => {});                                                   // Silent catch lỗi
  }, [token]);

  // ===== USEEFFECT: TẢI DANH SÁCH DOCTORS =====
  // useEffect này chạy khi component mount để load doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const doctors = await doctorService.getDoctorToSelectSchedule();  // Gọi API lấy doctors
        setDoctorList(doctors.data.result);                               // Set danh sách doctors
      } catch (error) {
        message.error("Không thể tải danh sách bác sĩ");
      }
    };

    fetchDoctors();
  }, []);

  // ===== USEEFFECT: TẢI SCHEDULE THEO THÁNG =====
  // useEffect này chạy khi doctor hoặc month thay đổi để load schedule
  useEffect(() => {
    getWorkScheduleMonth();                                               // Load schedule cho tháng được chọn
  }, [selectedDoctor, selectedMonth]);

  // ===== HANDLER: CHANGE SHIFT BY DAY =====
  // Hàm xử lý khi thay đổi shift cho một ngày trong tuần
  const handleChange = (day, value) => {
    setShiftByDay((prev) => ({
      ...prev,
      [day]: value,                                                       // Update shift cho ngày cụ thể
    }));
  };

  // ===== HANDLER: SUBMIT BULK SCHEDULE =====
  // Hàm xử lý submit tạo schedule theo pattern tuần
  const handleSubmit = async () => {
    const selectedCount = Object.values(shiftByDay).filter(Boolean).length;

    // Validate có ít nhất 1 ca làm
    if (selectedCount === 0) {
      showNotification("Bạn phải chọn ít nhất 1 ca làm", "error");
      return;
    }
    
    // Validate doctor và month được chọn
    if (!selectedDoctor || !selectedMonth) {
      showNotification(
        "Vui lòng không để trống mục chọn tháng và bác sĩ",
        "error"
      );
      return;
    }
    
    // Tạo shift rules từ shiftByDay
    const shiftRules = Object.entries(shiftByDay)
      .filter(([_, shift]) => shift)                                      // Chỉ lấy những ngày có shift
      .map(([weekday, shift]) => ({
        weekday,
        shift,
      }));
      
    // Payload để gửi API
    const payload = {
      doctorId: selectedDoctor.id,
      month: selectedMonth,
      shiftRules,
      createdBy: infoUser.id,
    };

    try {
      const res = await managerService.createWorkScheduleBulk(payload);   // Gọi API tạo bulk schedule
      showNotification(res.data.result, "success");
      getWorkScheduleMonth();                                             // Refresh schedule sau khi tạo
    } catch (err) {
      console.error(" Lỗi gửi lịch:", err);
      console.log(payload);
    }
  };

  // ===== API FUNCTION: GET WORK SCHEDULE =====
  // Hàm lấy schedule của doctor trong tháng được chọn
  const getWorkScheduleMonth = async () => {
    if (!selectedDoctor || !selectedMonth) return;                       // Cần có doctor và month

    try {
      const res = await managerService.getWorkScheduleYear(
        selectedMonth,
        selectedDoctor.id
      );
      const allSchedule = res.data.result;
      
      // Tạo map schedule theo date cho hiển thị calendar
      const map = {};
      for (const item of allSchedule) {
        const date = item.workDate; // "2025-06-01"
        if (date.startsWith(selectedMonth)) {                             // Chỉ lấy schedule của tháng hiện tại
          map[date] = item.shift;
        }
      }
      setScheduleMap(map);                                                // Set schedule map
    } catch (err) {
      console.error("Không thể lấy lịch tháng này:", err);
    }
  };

  // ===== HANDLER: DELETE SCHEDULE =====
  // Hàm xử lý xóa schedule của một ngày cụ thể
  const handleDelete = (date, doctorId) => {
    managerService
      .deleteWorkSchedule(date, doctorId)                                 // Gọi API xóa schedule
      .then(() => {
        showNotification("Xóa lịch làm việc thành công", "success");
        getWorkScheduleMonth();                                           // Refresh schedule sau khi xóa
      })
      .catch((err) => {
        showNotification(err.response.data.message, "error");
      });
  };

  // ===== HANDLER: UPDATE SCHEDULE =====
  // Hàm xử lý cập nhật schedule hiện có
  const handleUpdate = (doctorId, data) => {
    managerService
      .updateWorkSchedule(doctorId, data)                                 // Gọi API update schedule
      .then(() => {
        showNotification("Cập nhật lịch làm việc thành công", "success");
        getWorkScheduleMonth();                                           // Refresh schedule sau khi update
      })
      .catch((err) => {
        console.log(err);
        showNotification(err.response.data.message, "error");
      });
  };

  // ===== HANDLER: CREATE SCHEDULE BY DAY =====
  // Hàm xử lý tạo mới schedule cho một ngày cụ thể
  const handleCreateByDay = (doctorId, data) => {
    managerService
      .createWorkScheduleByDay({
        doctorId: doctorId,
        workDate: data.workDate,
        shift: data.shift,
        createdBy: infoUser.id,
      })                                                                  // Gọi API tạo schedule cho ngày
      .then(() => {
        showNotification("Tạo lịch làm việc thành công", "success");
        getWorkScheduleMonth();                                           // Refresh schedule sau khi tạo
      })
      .catch((err) => {
        console.error("Lỗi tạo lịch:", err);
      });
  };

  // ===== HANDLER: OPEN EDIT MODAL =====
  // Hàm mở modal để edit/tạo schedule cho một ngày cụ thể
  const openEditModal = (dateStr) => {
    setEditingDate(dateStr);                                              // Set ngày đang edit
    setEditingShift(scheduleMap[dateStr] || "");                         // Set shift hiện tại hoặc rỗng
    setIsModalVisible(true);                                              // Mở modal
  };

  // ===== UTILITY FUNCTION: GENERATE CALENDAR GRID =====
  // Hàm tạo cấu trúc calendar grid cho tháng được chọn
  const getCalendarGrid = (monthStr) => {
    const [year, month] = monthStr.split("-").map(Number);                // Parse year và month
    const firstDate = new Date(year, month - 1, 1);                      // Ngày đầu tháng
    const totalDays = new Date(year, month, 0).getDate();                // Tổng số ngày trong tháng
    const firstDay = firstDate.getDay(); // 0=CN                         // Thứ mấy của ngày đầu

    const offset = firstDay === 0 ? 6 : firstDay - 1;                    // Offset để align với thứ 2 đầu tuần
    const calendar = [];
    let day = 1;

    // Tạo calendar grid 6 tuần x 7 ngày
    for (let i = 0; i < 6 && day <= totalDays; i++) {
      const week = [];
      for (let j = 0; j < 7; j++) {
        if ((i === 0 && j < offset) || day > totalDays) {                // Cells trống ở đầu/cuối
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

  // ===== RENDER MAIN COMPONENT =====
  return (
    <div className="rounded-[12px] overflow-hidden shadow bg-white">
      {/* ===== BULK SCHEDULE CREATION SECTION ===== */}
      {/* Phần tạo schedule theo pattern tuần */}
      <div className="bg-blue-600 text-white px-5 py-3 text-base font-semibold rounded-t">
        Bảng ca phân ca làm theo tháng
      </div>
      <div className="px-5">
        {/* ===== MONTH & DOCTOR SELECTION ===== */}
        {/* Phần chọn tháng và bác sĩ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-5">
          {/* Month picker */}
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-700 font-medium">
              Chọn tháng:
            </label>
            <input
              type="month"
              className="h-10 border border-gray-300 rounded-md px-3 text-sm"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}            // Update selected month
            />
          </div>

          {/* Doctor selection */}
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-700 font-medium">
              Chọn bác sĩ:
            </label>
            <Select
              showSearch
              placeholder="Chọn bác sĩ"
              className="w-full h-10 text-sm"
              dropdownStyle={{ fontSize: "14px" }}
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
              onChange={(value) => {
                const doctor = doctorList.find((d) => d.id === value);     // Find selected doctor
                setSelectedDoctor(doctor);                                 // Set selected doctor
              }}
            >
              {doctorList.map((doctor) => (
                <Option key={doctor.id} value={doctor.id}>
                  {doctor.fullName}
                </Option>
              ))}
            </Select>
          </div>
        </div>

        {/* ===== WEEKLY SHIFT SELECTION ===== */}
        {/* Grid chọn ca làm việc cho từng ngày trong tuần */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 mt-6 ">
          {days.map((day) => (
            <div key={day} className="border rounded-md p-3 text-center">
              <div className="text-sm font-medium text-gray-700 mb-2">
                {dayDisplayMap[day]}                                       {/* Tên ngày tiếng Việt */}
              </div>
              <select
                className="w-full h-9 border border-gray-300 rounded-md text-sm px-2"
                value={shiftByDay[day] || ""}
                onChange={(e) => handleChange(day, e.target.value)}        // Update shift cho ngày này
              >
                <option value="">-- chọn ca --</option>
                {shiftOptions
                  .filter((s) => s)                                        // Loại bỏ empty string
                  .map((shift) => (
                    <option key={shift} value={shift}>
                      {shiftDisplayMap[shift] || shift}                    {/* Text hiển thị shift */}
                    </option>
                  ))}
              </select>
            </div>
          ))}
        </div>

        {/* Submit button */}
        <div className="flex justify-end py-5">
          <button
            onClick={handleSubmit}                                         // Submit bulk schedule
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md text-sm font-medium shadow"
          >
            Xác nhận
          </button>
        </div>
      </div>

      {/* ===== MONTHLY CALENDAR SECTION ===== */}
      {/* Phần hiển thị calendar tháng với schedule hiện tại */}
      <div className="rounded-[12px] overflow-hidden shadow bg-white mt-10">
        <div className="bg-purple-600 text-white px-5 py-3 text-base font-semibold">
          Lịch tháng
        </div>

        {/* ===== CALENDAR TABLE ===== */}
        {/* Bảng calendar hiển thị schedule theo ngày */}
        <table className="w-full table-fixed border-collapse text-sm">
          {/* Table header với tên các ngày trong tuần */}
          <thead>
            <tr className="bg-gray-100 text-gray-800">
              {["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN"].map(
                (day) => (
                  <th key={day} className="py-2 border text-center font-medium">
                    {day}
                  </th>
                )
              )}
            </tr>
          </thead>
          
          {/* Table body với calendar cells */}
          <tbody>
            {getCalendarGrid(selectedMonth).map((week, i) => (
              <tr key={i}>
                {week.map((dateStr, j) => (
                  <td
                    key={j}
                    onClick={() => dateStr && openEditModal(dateStr)}     // Click để edit schedule
                    className="h-28 border p-2 align-top relative hover:bg-gray-50 cursor-pointer"
                  >
                    {dateStr && (
                      <>
                        {/* Số ngày */}
                        <div className="text-right text-xs font-medium text-gray-600">
                          {+dateStr.split("-")[2]}                        {/* Lấy số ngày từ date string */}
                        </div>

                        {/* Hiển thị shift nếu có */}
                        {scheduleMap[dateStr] ? (
                          <div className="mt-1">
                            <div className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                              {shiftDisplayMap[scheduleMap[dateStr]] ||
                                scheduleMap[dateStr]}                      {/* Text shift */}
                            </div>
                          </div>
                        ) : (
                          // Placeholder khi chưa có schedule
                          <div className="text-center text-xs italic text-gray-400 mt-2">
                            + Thêm ca làm
                            <br />
                            (nghỉ)
                          </div>
                        )}
                      </>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ===== EDIT SCHEDULE MODAL ===== */}
      {/* Modal để edit/tạo/xóa schedule cho một ngày cụ thể */}
      <Modal
        title={`Cập nhật lịch: ${editingDate}`}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}                                                     // Custom footer
      >
        {/* Shift selection */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Chọn ca làm:</label>
          <Select
            className="w-full"
            value={editingShift}
            onChange={(value) => setEditingShift(value)}                  // Update editing shift
          >
            {shiftOptions
              .filter((s) => s)                                           // Loại bỏ empty string
              .map((shift) => (
                <Select.Option key={shift} value={shift}>
                  {shiftDisplayMap[shift] || shift}                       {/* Text hiển thị shift */}
                </Select.Option>
              ))}
          </Select>
        </div>

        {/* Action buttons */}
        <div className="flex justify-between">
          {/* Delete button - chỉ hiển thị nếu đã có schedule */}
          {scheduleMap[editingDate] && (
            <Popconfirm
              title="Xoá lịch ngày này?"
              onConfirm={() => {
                handleDelete(editingDate, selectedDoctor.id);             // Xóa schedule
                isModalVisible(false);                                    // Đóng modal
              }}
              okText="Xoá"
              cancelText="Huỷ"
            >
              <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">
                Xoá
              </button>
            </Popconfirm>
          )}
          
          {/* Save button */}
          <button
            onClick={() => {
              const payload = {
                workDate: editingDate,
                shift: editingShift,
              };

              if (scheduleMap[editingDate]) {
                // Cập nhật schedule hiện có
                handleUpdate(selectedDoctor.id, payload);
              } else {
                // Tạo mới schedule
                handleCreateByDay(selectedDoctor.id, payload);
              }

              setIsModalVisible(false);                                   // Đóng modal
            }}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            {scheduleMap[editingDate] ? "Cập nhật" : "Tạo mới"}           {/* Button text tùy theo action */}
          </button>
        </div>
      </Modal>
    </div>
  );
};

// ===== EXPORT COMPONENT =====
export default ScheduleManagement;
