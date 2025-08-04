import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Avatar,
  Modal,
  Descriptions,
  Row,
  Col,
  Input,
  Select,
  Typography,
  Spin,
  message,
} from "antd";
import { UserOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { treatmentService } from "../../service/treatment.service";
import { authService } from "../../service/auth.service";
import { useNavigate } from "react-router-dom";
import { doctorService } from "../../service/doctor.service";

const { Search } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

const PatientList = () => {
  // ===== STATE MANAGEMENT =====
  // State quản lý dữ liệu và UI
  const [loading, setLoading] = useState(true);                      // Trạng thái loading
  const [patients, setPatients] = useState([]);                     // Danh sách patients/appointments hôm nay
  const [selectedPatient, setSelectedPatient] = useState(null);     // Patient được chọn trong modal
  const [modalVisible, setModalVisible] = useState(false);          // Hiển thị modal chi tiết
  
  // State quản lý filter và search
  const [searchText, setSearchText] = useState("");                 // Text tìm kiếm
  const [statusFilter, setStatusFilter] = useState("all");          // Filter theo trạng thái
  
  // State quản lý doctor info và pagination
  const [doctorId, setDoctorId] = useState("");                     // ID của doctor hiện tại
  const [doctorName, setDoctorName] = useState("");                 // Tên doctor hiện tại
  const [currentPage, setCurrentPage] = useState(0);               // Trang hiện tại (0-based)
  const [totalPages, setTotalPages] = useState(1);                 // Tổng số trang

  // ===== NAVIGATION =====
  const navigate = useNavigate();                                   // Hook điều hướng

  // ===== USEEFFECT: TẢI THÔNG TIN DOCTOR =====
  // useEffect này chạy khi component mount để lấy thông tin doctor hiện tại
  useEffect(() => {
    const fetchDoctorInfo = async () => {
      try {
        // Gọi API lấy thông tin doctor từ token
        const res = await authService.getMyInfo();
        const id = res?.data?.result?.id;
        const name = res?.data?.result?.fullName;

        if (id) {
          setDoctorId(id);          // Set doctor ID
          setDoctorName(name);      // Set doctor name
        } else {
          message.error("Không thể lấy thông tin bác sĩ");
        }
      } catch (error) {
        console.error("Error fetching doctor info:", error);
        message.error("Không thể lấy thông tin bác sĩ");
      }
    };
    fetchDoctorInfo();
  }, []);

  // ===== USEEFFECT: TẢI DANH SÁCH APPOINTMENTS =====
  // useEffect này chạy khi có doctorId để lấy danh sách appointments hôm nay
  useEffect(() => {
    if (!doctorId) return;  // Cần có doctorId mới fetch data
    fetchData();
  }, [doctorId]);

  // ===== API FUNCTION: TẢI DỮ LIỆU APPOINTMENTS =====
  // Hàm fetch danh sách appointments hôm nay của doctor với pagination
  const fetchData = async (page = 0) => {
    try {
      setLoading(true);

      // Gọi API lấy appointments hôm nay với pagination
      const response = await doctorService.getAppointmentsToday(page, 8);
      setCurrentPage(page);                                          // Update current page
      setTotalPages(response.data.result.totalPages);               // Update total pages
      
      if (response?.data?.result?.content) {
        const appointments = response.data.result.content;
        console.log("✅ Appointments loaded from new API:", appointments);
        setPatients(appointments);                                  // Set danh sách appointments
      } else {
        console.warn("No appointments data from API");
        setPatients([]);                                           // Set empty array nếu không có data
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      message.error("Có lỗi xảy ra khi lấy dữ liệu lịch hẹn");
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  // ===== FILTER & SEARCH LOGIC =====
  // Logic filter patients theo search text và status
  const filteredData = patients.filter((patient) => {
    const matchesSearch =                                           // Kiểm tra search text
      patient.customerName.toLowerCase().includes(searchText.toLowerCase()) ||
      patient.id.toString().includes(searchText);
    const matchesStatus =                                           // Kiểm tra status filter
      statusFilter === "all" || patient.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // ===== UTILITY FUNCTION: STATUS TAG =====
  // Hàm tạo Tag component với màu sắc cho các trạng thái appointment
  const getStatusTag = (status) => {
    const statusMap = {
      CONFIRMED: { color: "blue", text: "Đã xác nhận" },
      PENDING: { color: "orange", text: "Chờ xác nhận" },
      PLANED: { color: "orange", text: "Đã đặt lịch" },
      REJECTED: { color: "volcano", text: "Từ chối yêu cầu đổi lịch" },
      PENDING_CHANGE: { color: "gold", text: "Yêu cầu thay đổi" },
      CANCELLED: { color: "red", text: "Đã hủy" },
      COMPLETED: { color: "green", text: "Đã hoàn thành" },
      INPROGRESS: { color: "orange", text: "Đang điều trị" },
    };
    return (
      <Tag color={statusMap[status]?.color}>
        {statusMap[status]?.text || status}
      </Tag>
    );
  };

  // ===== HANDLER: XEM CHI TIẾT TREATMENT =====
  // Hàm xử lý khi click button "Chi Tiết" để navigate sang trang treatment stages
  const handleDetail = async (record) => {
    try {
      // Lấy chi tiết treatment record theo recordId
      const detailRes = await treatmentService.getTreatmentRecordById(record);
      const detail = detailRes?.data?.result;
      if (!detail) {
        message.error("Không lấy được chi tiết hồ sơ điều trị!");
        return;
      }
      
      // Navigate sang trang treatment stages với state data
      navigate("/doctor-dashboard/treatment-stages", {
        state: {
          patientInfo: {                                            // Thông tin patient
            customerId: detail.customerId,
            customerName: detail.customerName,
          },
          treatmentData: detail,                                    // Dữ liệu treatment chi tiết
          sourcePage: "patients",                                   // Source page để biết đến từ đâu
          appointmentData: record,                                  // Dữ liệu appointment
        },
      });
    } catch (error) {
      console.error("Error in handleDetail:", error);
      message.error("Có lỗi xảy ra khi tìm hồ sơ điều trị!");
    }
  };

  // ===== TABLE COLUMNS CONFIGURATION =====
  // Cấu hình các columns cho bảng danh sách patients
  const columns = [
    {
      title: "Bệnh nhân",
      dataIndex: "customerName",
      key: "customerName",
      render: (name, record) => (
        <div>
          <div>
            <Text strong>{name}</Text>                              {/* Tên patient */}
            <br />
          </div>
        </div>
      ),
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
      key: "status",
      render: (record) => getStatusTag(record.status),              // Sử dụng utility function
    },
    {
      title: "Mục đích",
      key: "purpose",
      render: (record) => {
        return <Tag color="purple">{record.purpose || "Chưa có"}</Tag>;
      },
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            size="small"
            onClick={() => {
              handleDetail(record.recordId);                       // Navigate với recordId
            }}
          >
            Chi Tiết
          </Button>
        </Space>
      ),
    },
  ];

  // ===== RENDER MAIN COMPONENT =====
  return (
    <div>
      {/* ===== FILTERS SECTION ===== */}
      {/* Card chứa search và filter controls */}
      <Card
        className="mb-6"
        style={{
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          borderRadius: 12,
          border: "none",
        }}
      >
        <Row gutter={16} align="middle">
          {/* Search input */}
          <Col span={8}>
            <Search
              placeholder="Tìm kiếm tên hoặc ID bệnh nhân..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: "100%", borderRadius: 8 }}
              allowClear
            />
          </Col>
          
          {/* Status filter dropdown */}
          <Col span={6}>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: "100%", borderRadius: 8 }}
            >
              <Option value="all">Tất cả trạng thái</Option>
              <Option value="CONFIRMED">Đã xác nhận</Option>
              <Option value="PENDING">Chờ xác nhận</Option>
              <Option value="PLANED">Đã đặt lịch</Option>
              <Option value="COMPLETED">Đã hoàn thành</Option>
              <Option value="CANCELLED">Đã hủy</Option>
            </Select>
          </Col>
          
          {/* Total count display */}
          <Col span={10} style={{ textAlign: "right" }}>
            <Text type="secondary">Tổng: {filteredData.length} bệnh nhân</Text>
          </Col>
        </Row>
      </Card>

      {/* ===== PATIENT TABLE SECTION ===== */}
      {/* Card chứa bảng danh sách patients với loading và pagination */}
      <Card
        style={{
          boxShadow: "0 4px 16px rgba(24,144,255,0.08)",
          borderRadius: 16,
          border: "none",
          marginBottom: 24,
        }}
      >
        <Spin spinning={loading}>
          {filteredData.length === 0 ? (
            // Empty state khi không có data
            <div
              style={{
                padding: 32,
                textAlign: "center",
                color: "#888",
                fontSize: 16,
              }}
            >
              <p>Không có bệnh nhân nào cần điều trị hôm nay.</p>
            </div>
          ) : (
            <>
              {/* Bảng danh sách patients */}
              <Table
                columns={columns}                                   // Columns configuration
                dataSource={filteredData}                          // Data đã được filter
                rowKey="id"                                         // Unique key cho mỗi row
                pagination={false}                                  // Disable built-in pagination
                scroll={{ x: 1000 }}                              // Horizontal scroll
                bordered
                style={{ borderRadius: 12, overflow: "hidden" }}
              />
              
              {/* Custom pagination controls */}
              <div className="flex justify-end mt-4">
                <Button
                  disabled={currentPage === 0}                     // Disable nếu ở trang đầu
                  onClick={() => fetchData(currentPage - 1)}
                  className="mr-2"
                >
                  Trang trước
                </Button>
                <span className="px-4 py-1 bg-gray-100 rounded text-sm">
                  Trang {currentPage + 1} / {totalPages}
                </span>
                <Button
                  disabled={currentPage + 1 >= totalPages}         // Disable nếu ở trang cuối
                  onClick={() => fetchData(currentPage + 1)}
                  className="ml-2"
                >
                  Trang tiếp
                </Button>
              </div>
            </>
          )}
        </Spin>
      </Card>

      {/* ===== PATIENT DETAIL MODAL ===== */}
      {/* Modal hiển thị chi tiết thông tin patient (hiện tại không được dùng) */}
      <Modal
        title="Hồ Sơ Bệnh Nhân"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={800}
        destroyOnHidden
      >
        {selectedPatient && (
          <Descriptions column={2} bordered>
            <Descriptions.Item label="Họ tên">
              {selectedPatient.customerName}
            </Descriptions.Item>
            <Descriptions.Item label="ID">
              {selectedPatient.id}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              {getStatusTag(selectedPatient.status)}
            </Descriptions.Item>
            <Descriptions.Item label="Ca khám">
              {selectedPatient.shift === "MORNING" ? "Sáng" : "Chiều"}
            </Descriptions.Item>
            <Descriptions.Item label="Mục đích">
              {selectedPatient.purpose || "Chưa có"}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

// ===== EXPORT COMPONENT =====
export default PatientList;
