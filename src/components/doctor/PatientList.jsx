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
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [doctorId, setDoctorId] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [purposeData, setPurposeData] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctorInfo = async () => {
      try {
        const res = await authService.getMyInfo();
        const id = res?.data?.result?.id;
        const name = res?.data?.result?.fullName;
        if (id) {
          setDoctorId(id);
          setDoctorName(name);
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

  useEffect(() => {
    if (!doctorId) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const today = dayjs().format("YYYY-MM-DD");

        // Gọi song song 3 API: appointments, treatment records, và purpose data
        const [appointmentsRes, treatmentRecordsRes, purposeRes] =
          await Promise.all([
            treatmentService.getDoctorAppointmentsByDate(doctorId, today),
            treatmentService.getTreatmentRecordsByDoctor(doctorId),
            doctorService
              .getAppointmentsToday(0, 100)
              .catch(() => ({ data: { result: { content: [] } } })),
          ]);

        // Đảm bảo appointments là array
        let appointments = [];
        if (appointmentsRes?.data?.result) {
          if (Array.isArray(appointmentsRes.data.result)) {
            appointments = appointmentsRes.data.result;
          } else if (
            appointmentsRes.data.result.content &&
            Array.isArray(appointmentsRes.data.result.content)
          ) {
            appointments = appointmentsRes.data.result.content;
          } else {
            console.warn(
              "Appointments data format không đúng:",
              appointmentsRes.data.result
            );
            appointments = [];
          }
        }

        // Đảm bảo treatmentRecords là array
        let treatmentRecords = [];
        if (Array.isArray(treatmentRecordsRes)) {
          treatmentRecords = treatmentRecordsRes;
        } else if (treatmentRecordsRes?.data?.result) {
          if (Array.isArray(treatmentRecordsRes.data.result)) {
            treatmentRecords = treatmentRecordsRes.data.result;
          } else if (
            treatmentRecordsRes.data.result.content &&
            Array.isArray(treatmentRecordsRes.data.result.content)
          ) {
            treatmentRecords = treatmentRecordsRes.data.result.content;
          }
        }

        // Xử lý purpose data từ API mới
        const purposeList = purposeRes?.data?.result?.content || [];
        const purposeMap = {};
        purposeList.forEach((item) => {
          if (item.customerName && item.purpose) {
            purposeMap[item.customerName] = item.purpose;
          }
        });
        setPurposeData(purposeMap);

        console.log("📅 Appointments:", appointments);
        console.log("📋 Treatment Records:", treatmentRecords);
        console.log("🎯 Purpose Data:", purposeMap);

        // Lọc: chỉ giữ lịch hẹn mà bệnh nhân có treatment record hợp lệ
        const filtered = appointments.filter((appt) => {
          return treatmentRecords.some(
            (record) =>
              (record.customerId === appt.customerId ||
                record.customerName === appt.customerName) &&
              record.status !== "PENDING" &&
              record.status !== "CANCELLED"
          );
        });

        console.log("✅ Filtered patients:", filtered);
        setPatients(filtered);
      } catch (error) {
        console.error("Error fetching data:", error);
        message.error("Có lỗi xảy ra khi lấy dữ liệu bệnh nhân");
        setPatients([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [doctorId]);

  // Filter data
  const filteredData = patients.filter((patient) => {
    const matchesSearch =
      patient.customerName.toLowerCase().includes(searchText.toLowerCase()) ||
      patient.id.toString().includes(searchText);
    const matchesStatus =
      statusFilter === "all" || patient.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusTag = (status) => {
    const statusMap = {
      CONFIRMED: { color: "blue", text: "Đã xác nhận" },
      PENDING: { color: "orange", text: "Chờ xác nhận" },
      REJECTED_CHANGE: { color: "red", text: "Từ chối thay đổi" },
      CANCELLED: { color: "red", text: "Đã hủy" },
      COMPLETED: { color: "green", text: "Đã hoàn thành" },
      INPROGRESS: { color: "blue", text: "Đang thực hiện" },
    };
    return (
      <Tag color={statusMap[status]?.color}>
        {statusMap[status]?.text || status}
      </Tag>
    );
  };

  const handleDetail = async (record) => {
    try {
      if (!record.recordId) {
        message.error("Không tìm thấy recordId cho lịch hẹn này!");
        return;
      }
      // Lấy chi tiết treatment record theo recordId
      const detailRes = await treatmentService.getTreatmentRecordById(
        record.recordId
      );
      const detail = detailRes?.data?.result;
      if (!detail) {
        message.error("Không lấy được chi tiết hồ sơ điều trị!");
        return;
      }
      navigate("/doctor-dashboard/treatment-stages", {
        state: {
          patientInfo: {
            customerId: detail.customerId,
            customerName: detail.customerName,
          },
          treatmentData: detail,
          sourcePage: "patients",
          appointmentData: record,
        },
      });
    } catch (error) {
      console.error("Error in handleDetail:", error);
      message.error("Có lỗi xảy ra khi tìm hồ sơ điều trị!");
    }
  };

  const columns = [
    {
      title: "Bệnh nhân",
      dataIndex: "customerName",
      key: "customerName",
      render: (name, record) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <Avatar
            size={40}
            icon={<UserOutlined />}
            style={{ marginRight: 12, backgroundColor: "#1890ff" }}
          />
          <div>
            <Text strong>{name}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: "12px" }}>
              {record.customerEmail}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Ngày khám",
      dataIndex: "appointmentDate",
      key: "appointmentDate",
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
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
      render: (record) => getStatusTag(record.status),
    },
    {
      title: "Mục đích",
      key: "serviceName",
      render: (record) => {
        // Ưu tiên lấy purpose từ API mới
        const purpose = purposeData[record.customerName];
        if (purpose) {
          return <Tag color="purple">{purpose}</Tag>;
        }

        // Fallback về logic cũ nếu không có purpose từ API mới
        const serviceName =
          record.purpose ||
          record.serviceName ||
          record.treatmentServiceName ||
          record.treatmentService?.name ||
          "Chưa có";
        return <Tag color="purple">{serviceName}</Tag>;
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
            onClick={() => handleDetail(record)}
          >
            Chi Tiết
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* Filters */}
      <Card
        className="mb-6"
        style={{
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          borderRadius: 12,
          border: "none",
        }}
      >
        <Row gutter={16} align="middle">
          <Col span={8}>
            <Search
              placeholder="Tìm kiếm tên hoặc ID bệnh nhân..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: "100%", borderRadius: 8 }}
              allowClear
            />
          </Col>
          <Col span={6}>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: "100%", borderRadius: 8 }}
            >
              <Option value="all">Tất cả trạng thái</Option>
              <Option value="CONFIRMED">Đã xác nhận</Option>
              <Option value="PENDING">Chờ xác nhận</Option>
              <Option value="REJECTED_CHANGE">Từ chối thay đổi</Option>
              <Option value="CANCELLED">Đã hủy</Option>
            </Select>
          </Col>
          <Col span={10} style={{ textAlign: "right" }}>
            <Text type="secondary">Tổng: {filteredData.length} bệnh nhân</Text>
          </Col>
        </Row>
      </Card>

      {/* Patient Table */}
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
            <Table
              columns={columns}
              dataSource={filteredData}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              scroll={{ x: 1000 }}
              bordered
              style={{ borderRadius: 12, overflow: "hidden" }}
            />
          )}
        </Spin>
      </Card>

      {/* Patient Detail Modal */}
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
            <Descriptions.Item label="Email">
              {selectedPatient.customerEmail}
            </Descriptions.Item>
            <Descriptions.Item label="Bác sĩ">
              {selectedPatient.doctorName}
            </Descriptions.Item>
            <Descriptions.Item label="Mục đích">
              {selectedPatient.serviceName || "Chưa có"}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              {getStatusTag(selectedPatient.status)}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày khám">
              {dayjs(selectedPatient.appointmentDate).format("DD/MM/YYYY")}
            </Descriptions.Item>
            <Descriptions.Item label="Ca khám">
              {selectedPatient.shift}
            </Descriptions.Item>
            <Descriptions.Item label="Mục đích">
              {selectedPatient.purpose || "Chưa có"}
            </Descriptions.Item>
            <Descriptions.Item label="Ghi chú">
              {selectedPatient.notes || "Chưa có"}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default PatientList;
